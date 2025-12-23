# credit-risk-mvp

Информационная система оценки и оптимизации кредитного риска с применением ИИ и спецификации OpenAPI.

## Запуск

```bash
docker compose up --build
```

Если после сборки backend падает с ошибкой `ImportError: no pq wrapper available`, убедитесь что используется `psycopg[binary]` (уже добавлено в `backend/requirements.txt`) и пересоберите контейнер.

Если frontend сообщает: `"next start" does not work with "output: standalone"`, запуск уже исправлен — контейнер стартует через `node .next/standalone/server.js`.

### Переменные окружения

| Переменная | Описание | Значение по умолчанию |
| --- | --- | --- |
| `DATABASE_URL` | строка подключения к Postgres | `postgresql+psycopg://postgres:postgres@db:5432/credit_risk` |
| `API_KEY` | ключ для заголовка `X-API-Key` | `local-dev-key` |
| `MODEL_PATH` | путь для модели ML | `/data/model.joblib` |
| `DATASET_PATH` | путь для синтетического датасета | `/data/dataset.csv` |
| `NEXT_PUBLIC_API_BASE` | базовый URL backend | `http://localhost:8000` |
| `NEXT_PUBLIC_API_KEY` | ключ для frontend запросов | `local-dev-key` |

## UI

- Dashboard: метрики, графики и последние job'ы.
- Score application: форма скоринга, PD/EL и факторы.
- Portfolio optimize: запуск job оптимизации портфеля.
- Jobs: список задач и detail-страница с живым логом через SSE.

## API

- Backend: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- OpenAPI: `http://localhost:8000/openapi.json`

## Что делать дальше

1. Соберите и запустите все сервисы:
   ```bash
   docker compose up --build
   ```
2. Откройте UI:
   - `http://localhost:3000`
3. Проверьте backend:
   - `http://localhost:8000/health`
   - `http://localhost:8000/docs`
4. Запустите оптимизацию портфеля:
   - UI → **Portfolio optimize** → **Run optimization job**
5. Откройте live-лог job:
   - UI → **Jobs** → выберите job → наблюдайте SSE лог.

### Пример запроса

```bash
curl -X POST http://localhost:8000/api/v1/score \
  -H "Content-Type: application/json" \
  -H "X-API-Key: local-dev-key" \
  -d '{
    "age": 35,
    "income": 75000,
    "employment_years": 5,
    "debt_to_income": 0.3,
    "credit_history_months": 60,
    "delinquencies": 0,
    "loan_amount": 20000,
    "loan_term_months": 36,
    "interest_rate": 12.5
  }'
```

## OpenAPI снапшоты

```bash
make export-openapi
```

Снапшоты лежат в `openapi/openapi.json` и `openapi/openapi.yaml`.

## Как это закрывает лабораторную по синхронизации

SYNC-LAB точки:
- `backend/app/core/sync.py`: `scoring_semaphore` ограничивает параллельные скоринги.
- `backend/app/core/sync.py`: `model_lock` защищает модель во время retrain.
- `backend/app/core/sync.py`: `job_channels` (Condition) уведомляет SSE подписчиков.
- `backend/app/jobs/runner.py`: использование Semaphore/Lock при запуске job.

## Тесты

```bash
cd backend
pytest
```
