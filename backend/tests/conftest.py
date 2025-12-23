import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import Settings
from app.db.models import Base
from app.db.session import get_db
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def _set_env():
    os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"
    os.environ["API_KEY"] = "test-key"


@pytest.fixture()
def client():
    settings = Settings()
    engine = create_engine(settings.database_url, future=True)
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
