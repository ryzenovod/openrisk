from fastapi.testclient import TestClient


def test_score_endpoint(client: TestClient):
    payload = {
        "age": 35,
        "income": 75000,
        "employment_years": 5,
        "debt_to_income": 0.3,
        "credit_history_months": 60,
        "delinquencies": 0,
        "loan_amount": 20000,
        "loan_term_months": 36,
        "interest_rate": 12.5,
    }
    response = client.post(
        "/api/v1/score",
        json=payload,
        headers={"X-API-Key": "test-key"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "pd" in data
    assert "expected_loss" in data
    assert data["recommendation"] in {"approve", "review"}
