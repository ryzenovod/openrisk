import asyncio
import json
from datetime import datetime
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.core.sync import get_job_channel, model_lock, scoring_semaphore
from app.db.models import Job, JobEvent
from app.db.session import SessionLocal
from app.ml.model import retrain_model, score_application


async def _emit_event(db: Session, job: Job, message: str, level: str = "info") -> None:
    event = JobEvent(job_id=job.id, message=message, level=level)
    db.add(event)
    job.updated_at = datetime.utcnow()
    db.commit()

    channel = get_job_channel(job.id)
    async with channel.condition:
        channel.condition.notify_all()


def create_job(db: Session, job_type: str, payload: Dict[str, Any]) -> Job:
    job = Job(job_type=job_type, status="queued", progress=0.0, payload=json.dumps(payload))
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


async def run_job(job_id: int) -> None:
    db = SessionLocal()
    try:
        job = db.get(Job, job_id)
        if not job:
            return
        job.status = "running"
        db.commit()
        if job.job_type == "retrain":
            await _run_retrain(db, job)
        elif job.job_type == "optimize":
            await _run_optimize(db, job)
        else:
            await _emit_event(db, job, "Unknown job type", level="error")
            job.status = "failed"
            db.commit()
    finally:
        db.close()


async def _run_retrain(db: Session, job: Job) -> None:
    await _emit_event(db, job, "Retraining model started")
    # SYNC-LAB: Lock ensures exclusive access to the ML model during retrain.
    async with model_lock:
        await asyncio.sleep(1)
        retrain_model()
    job.progress = 1.0
    job.status = "completed"
    await _emit_event(db, job, "Retraining completed")
    db.commit()


async def _run_optimize(db: Session, job: Job) -> None:
    payload = json.loads(job.payload)
    applications: List[Dict[str, Any]] = payload.get("applications", [])
    budget: float = float(payload.get("budget", 100000))
    await _emit_event(db, job, f"Optimization started for {len(applications)} applications")

    results = []
    total_amount = 0.0
    for idx, app in enumerate(applications, start=1):
        # SYNC-LAB: Semaphore limits concurrent scoring during batch optimization.
        async with scoring_semaphore:
            result = score_application(app)
        expected_profit = (1 - result["pd"]) * app["interest_rate"] / 100 * app["loan_amount"]
        results.append({
            **app,
            "pd": result["pd"],
            "expected_profit": expected_profit,
        })
        job.progress = idx / max(len(applications), 1)
        await _emit_event(db, job, f"Scored application {idx}/{len(applications)}")

    results.sort(key=lambda item: item["expected_profit"], reverse=True)
    selected = []
    for item in results:
        if total_amount + item["loan_amount"] <= budget:
            selected.append(item)
            total_amount += item["loan_amount"]

    payload["selected"] = selected
    job.payload = json.dumps(payload)
    job.progress = 1.0
    job.status = "completed"
    await _emit_event(db, job, "Optimization completed")
    db.commit()
