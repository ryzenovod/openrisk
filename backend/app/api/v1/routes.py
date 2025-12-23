import asyncio
import json
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.schemas import (
    ApplicationFeatures,
    DashboardMetrics,
    DashboardResponse,
    JobCreateRequest,
    JobEventResponse,
    JobResponse,
    ScoreResponse,
)
from app.core.config import get_settings
from app.core.sync import get_job_channel
from app.db.models import Application, Decision, Job, JobEvent
from app.db.session import get_db
from app.jobs.runner import create_job, run_job
from app.ml.model import score_application

router = APIRouter(prefix="/api/v1", tags=["api"])
settings = get_settings()


def api_key_guard(
    x_api_key: str | None = Header(default=None),
    api_key: str | None = Query(default=None),
) -> None:
    if x_api_key != settings.api_key and api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")


@router.post("/score", response_model=ScoreResponse, dependencies=[Depends(api_key_guard)])
def score(payload: ApplicationFeatures, db: Session = Depends(get_db)) -> ScoreResponse:
    result = score_application(payload.model_dump())
    expected_loss = result["pd"] * 0.5 * payload.loan_amount
    recommendation = "approve" if result["pd"] < 0.2 else "review"

    application = Application(**payload.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)

    decision = Decision(
        application_id=application.id,
        pd=result["pd"],
        expected_loss=expected_loss,
        recommended=recommendation == "approve",
        recommendation_reason="auto-scoring",
    )
    db.add(decision)
    db.commit()

    return ScoreResponse(
        pd=result["pd"],
        expected_loss=expected_loss,
        recommendation=recommendation,
        top_factors=result["top_factors"],
    )


@router.post("/jobs", response_model=JobResponse, dependencies=[Depends(api_key_guard)])
async def create_job_endpoint(
    payload: JobCreateRequest,
    db: Session = Depends(get_db),
) -> JobResponse:
    job = create_job(db, payload.job_type, payload.model_dump())
    asyncio.create_task(run_job(job.id))
    return JobResponse.model_validate(job)


@router.get("/jobs", response_model=list[JobResponse], dependencies=[Depends(api_key_guard)])
def list_jobs(db: Session = Depends(get_db)) -> list[JobResponse]:
    jobs = db.execute(select(Job).order_by(Job.created_at.desc()).limit(20)).scalars().all()
    return [JobResponse.model_validate(job) for job in jobs]


@router.get("/jobs/{job_id}", response_model=JobResponse, dependencies=[Depends(api_key_guard)])
def get_job(job_id: int, db: Session = Depends(get_db)) -> JobResponse:
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse.model_validate(job)


@router.get(
    "/jobs/{job_id}/events",
    dependencies=[Depends(api_key_guard)],
    response_model=list[JobEventResponse],
)
async def stream_job_events(
    job_id: int,
    request: Request,
    last_event_id: int | None = None,
    db: Session = Depends(get_db),
) -> StreamingResponse:
    if not db.get(Job, job_id):
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator() -> AsyncGenerator[str, None]:
        last_id = last_event_id or 0
        channel = get_job_channel(job_id)
        while True:
            events = (
                db.execute(
                    select(JobEvent)
                    .where(JobEvent.job_id == job_id, JobEvent.id > last_id)
                    .order_by(JobEvent.id)
                )
                .scalars()
                .all()
            )
            for event in events:
                last_id = event.id
                payload = json.dumps(
                    {
                        "id": event.id,
                        "level": event.level,
                        "message": event.message,
                        "created_at": event.created_at.isoformat(),
                    }
                )
                yield f"id: {event.id}\n"
                yield f"event: log\n"
                yield f"data: {payload}\n\n"

            if await request.is_disconnected():
                break

            async with channel.condition:
                try:
                    await asyncio.wait_for(channel.condition.wait(), timeout=3)
                except asyncio.TimeoutError:
                    continue

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/dashboard", response_model=DashboardResponse, dependencies=[Depends(api_key_guard)])
def dashboard(db: Session = Depends(get_db)) -> DashboardResponse:
    apps = db.execute(select(Application)).scalars().all()
    decisions = db.execute(select(Decision)).scalars().all()
    average_pd = sum(d.pd for d in decisions) / len(decisions) if decisions else 0.0
    approved_rate = (
        sum(1 for d in decisions if d.recommended) / len(decisions)
        if decisions
        else 0.0
    )
    metrics = DashboardMetrics(
        total_applications=len(apps),
        approved_rate=approved_rate,
        average_pd=average_pd,
        portfolio_el=sum(d.expected_loss for d in decisions) if decisions else 0.0,
    )
    recent_jobs = db.execute(select(Job).order_by(Job.created_at.desc()).limit(5)).scalars().all()
    pd_distribution = [d.pd for d in decisions][-20:]
    el_over_time = [d.expected_loss for d in decisions][-20:]
    job_durations = [float(j.progress) for j in recent_jobs]
    return DashboardResponse(
        metrics=metrics,
        recent_jobs=[JobResponse.model_validate(job) for job in recent_jobs],
        pd_distribution=pd_distribution,
        el_over_time=el_over_time,
        job_durations=job_durations,
    )
