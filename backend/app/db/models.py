from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    age: Mapped[int] = mapped_column(Integer)
    income: Mapped[float] = mapped_column(Float)
    employment_years: Mapped[int] = mapped_column(Integer)
    debt_to_income: Mapped[float] = mapped_column(Float)
    credit_history_months: Mapped[int] = mapped_column(Integer)
    delinquencies: Mapped[int] = mapped_column(Integer)
    loan_amount: Mapped[float] = mapped_column(Float)
    loan_term_months: Mapped[int] = mapped_column(Integer)
    interest_rate: Mapped[float] = mapped_column(Float)

    decisions: Mapped[list["Decision"]] = relationship(back_populates="application")


class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    pd: Mapped[float] = mapped_column(Float)
    expected_loss: Mapped[float] = mapped_column(Float)
    recommended: Mapped[bool] = mapped_column(Boolean)
    recommendation_reason: Mapped[str] = mapped_column(String(255))

    application: Mapped[Application] = relationship(back_populates="decisions")


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_type: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50))
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    payload: Mapped[str] = mapped_column(Text, default="{}")

    events: Mapped[list["JobEvent"]] = relationship(back_populates="job")


class JobEvent(Base):
    __tablename__ = "job_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    level: Mapped[str] = mapped_column(String(20), default="info")
    message: Mapped[str] = mapped_column(Text)

    job: Mapped[Job] = relationship(back_populates="events")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    actor: Mapped[str] = mapped_column(String(100))
    action: Mapped[str] = mapped_column(String(100))
    details: Mapped[str] = mapped_column(Text)
