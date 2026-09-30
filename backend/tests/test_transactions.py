import pytest


def make_transaction(**overrides):
    data = {
        "description": "Client payment",
        "amount": 100,
        "type": "income",
        "category": "Sales",
        "date": "2026-09-30",
    }
    data.update(overrides)
    return data


def test_create_income_transaction(client):
    response = client.post("/transactions", json=make_transaction(amount=2500))

    assert response.status_code == 201
    body = response.json()
    assert body["id"] == 1
    assert body["type"] == "income"
    assert body["amount"] == 2500
    assert body["category"] == "Sales"


def test_create_expense_transaction(client):
    payload = make_transaction(description="Adobe", amount=49.99, type="expense", category="Software")
    response = client.post("/transactions", json=payload)

    assert response.status_code == 201
    assert response.json()["type"] == "expense"
    assert response.json()["amount"] == 49.99


@pytest.mark.parametrize("bad_amount", [0, -5, "abc", 10.999])
def test_rejects_invalid_amount(client, bad_amount):
    response = client.post("/transactions", json=make_transaction(amount=bad_amount))

    assert response.status_code == 422
    assert client.get("/transactions").json() == []  # nothing was saved


def test_rejects_blank_description(client):
    response = client.post("/transactions", json=make_transaction(description="   "))
    assert response.status_code == 422


def test_rejects_category_that_does_not_match_type(client):
    response = client.post("/transactions", json=make_transaction(type="income", category="Rent"))
    assert response.status_code == 422


def test_rejects_invalid_type_and_date(client):
    assert client.post("/transactions", json=make_transaction(type="refund")).status_code == 422
    assert client.post("/transactions", json=make_transaction(date="not-a-date")).status_code == 422


def test_get_transactions_newest_first(client):
    client.post("/transactions", json=make_transaction(description="Older", date="2026-09-01"))
    client.post("/transactions", json=make_transaction(description="Newer", date="2026-09-20"))

    response = client.get("/transactions")

    assert response.status_code == 200
    assert [t["description"] for t in response.json()] == ["Newer", "Older"]


def test_get_one_transaction_and_404(client):
    created = client.post("/transactions", json=make_transaction()).json()

    assert client.get(f"/transactions/{created['id']}").json()["description"] == "Client payment"
    assert client.get("/transactions/999").status_code == 404


def test_update_transaction(client):
    created = client.post("/transactions", json=make_transaction()).json()
    changed = make_transaction(description="Adobe", amount=50, type="expense", category="Software")

    response = client.put(f"/transactions/{created['id']}", json=changed)

    assert response.status_code == 200
    assert response.json()["description"] == "Adobe"
    assert response.json()["type"] == "expense"
    assert client.get(f"/transactions/{created['id']}").json()["amount"] == 50


def test_update_missing_transaction_returns_404(client):
    assert client.put("/transactions/999", json=make_transaction()).status_code == 404


def test_delete_transaction(client):
    created = client.post("/transactions", json=make_transaction()).json()

    assert client.delete(f"/transactions/{created['id']}").status_code == 204
    assert client.get(f"/transactions/{created['id']}").status_code == 404
    assert client.delete(f"/transactions/{created['id']}").status_code == 404
