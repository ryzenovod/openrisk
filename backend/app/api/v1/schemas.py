from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict, Field


class ApplicationFeatures(BaseModel):
    age: int = Field(..., ge=18, le=80)
    income: float = Field(..., ge=0)
    employment_years: int = Field(..., ge=0)
    debt_to_income: float = Field(..., ge=0, le=1)
    credit_history_months: int = Field(..., ge=0)
    delinquencies: int = Field(..., ge=0)
    loan_amount: float = Field(..., ge=0)
    loan_term_months: int = Field(..., ge=1)
    interest_rate: float = Field(..., ge=0)


class ScoreResponse(BaseModel):
    pd: float
    expected_loss: float
    recommendation: str
    top_factors: List[str]


class JobCreateRequest(BaseModel):
    job_type: str
    applications: List[ApplicationFeatures] = []
    budget: float = 100000


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_type: str
    status: str
    progress: float
    created_at: datetime
    updated_at: datetime
    payload: str


class JobEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    created_at: datetime
    level: str
    message: str


class DashboardMetrics(BaseModel):
    total_applications: int
    approved_rate: float
    average_pd: float
    portfolio_el: float


class DashboardResponse(BaseModel):
    metrics: DashboardMetrics
    recent_jobs: List[JobResponse]
    pd_distribution: List[float]
    el_over_time: List[float]
    job_durations: List[float]
