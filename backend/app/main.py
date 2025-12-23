from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes import router as api_router
from app.core.config import OpenAPIServer, get_settings
from app.db.models import Base
from app.db.session import engine
from app.ml.model import load_or_train_model

settings = get_settings()

servers = [
    OpenAPIServer(url="http://localhost:8000", description="Local backend").model_dump()
]

tags_metadata = [
    {"name": "api", "description": "Core API endpoints"},
]

app = FastAPI(
    title=settings.openapi_title,
    version=settings.openapi_version,
    description=settings.openapi_description,
    servers=servers,
    openapi_tags=tags_metadata,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    load_or_train_model()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(api_router)
