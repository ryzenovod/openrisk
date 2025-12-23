import json
from pathlib import Path

import yaml

from app.main import app


OUTPUT_DIR = Path(__file__).resolve().parents[2] / "openapi"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

schema = app.openapi()

with (OUTPUT_DIR / "openapi.json").open("w", encoding="utf-8") as handle:
    json.dump(schema, handle, indent=2, ensure_ascii=False)

with (OUTPUT_DIR / "openapi.yaml").open("w", encoding="utf-8") as handle:
    yaml.safe_dump(schema, handle, allow_unicode=True)

print("OpenAPI exported to openapi/openapi.json and openapi/openapi.yaml")
