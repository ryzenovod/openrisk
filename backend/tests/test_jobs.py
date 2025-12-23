import asyncio
import time

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import Settings
from app.db.models import Base
from app.jobs.runner import create_job, run_job


def test_job_lifecycle():
    settings = Settings()
    engine = create_engine(settings.database_url, future=True)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    db = SessionLocal()

    payload = {
        "applications": [
            {
                "age": 30,
                "income": 65000,
                "employment_years": 4,
                "debt_to_income": 0.4,
                "credit_history_months": 48,
                "delinquencies": 1,
                "loan_amount": 15000,
                "loan_term_months": 24,
                "interest_rate": 10.0,
            }
        ],
        "budget": 50000,
    }
    job = create_job(db, "optimize", payload)
    asyncio.run(run_job(job.id))
    db.refresh(job)
    assert job.status == "completed"


def test_retrain_lock_serializes():
    settings = Settings()
    engine = create_engine(settings.database_url, future=True)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

    db_one = SessionLocal()
    db_two = SessionLocal()
    job_one = create_job(db_one, "retrain", {})
    job_two = create_job(db_two, "retrain", {})

    async def runner():
        start = time.perf_counter()
        await asyncio.gather(run_job(job_one.id), run_job(job_two.id))
        return time.perf_counter() - start

    duration = asyncio.run(runner())
    assert duration >= 1.8
