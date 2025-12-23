import asyncio
from dataclasses import dataclass, field
from typing import Dict

from app.core.config import get_settings

settings = get_settings()


# SYNC-LAB: Semaphore limits concurrent scoring jobs to prevent CPU overload.
scoring_semaphore = asyncio.Semaphore(settings.max_concurrent_scoring)

# SYNC-LAB: Lock protects the currently loaded ML model during retraining.
model_lock = asyncio.Lock()


@dataclass
class JobChannel:
    condition: asyncio.Condition = field(default_factory=asyncio.Condition)


# SYNC-LAB: Condition notifies SSE subscribers about new job events.
job_channels: Dict[int, JobChannel] = {}


def get_job_channel(job_id: int) -> JobChannel:
    if job_id not in job_channels:
        job_channels[job_id] = JobChannel()
    return job_channels[job_id]
