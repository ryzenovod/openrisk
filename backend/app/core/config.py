from functools import lru_cache
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        protected_namespaces=("settings_",),
    )

    api_key: str = "local-dev-key"
    database_url: str = "postgresql+psycopg://postgres:postgres@db:5432/credit_risk"
    model_path: str = "/data/model.joblib"
    dataset_path: str = "/data/dataset.csv"
    max_concurrent_scoring: int = 4
    job_poll_interval_seconds: float = 0.5

    openapi_title: str = "Credit Risk MVP"
    openapi_version: str = "0.1.0"
    openapi_description: str = (
        "Information system for credit risk assessment and optimization with AI."
    )


class OpenAPIServer(BaseModel):
    url: str
    description: str


@lru_cache
def get_settings() -> Settings:
    return Settings()
