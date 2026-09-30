def add(client, amount, type_, category, date="2026-09-15"):
    response = client.post(
        "/transactions",
        json={"description": "Test", "amount": amount, "type": type_, "category": category, "date": date},
    )
    assert response.status_code == 201


def add_example_data(client):
    add(client, 1000, "income", "Sales")
    add(client, 500, "income", "Sales")
    add(client, 200, "expense", "Rent")
    add(client, 100, "expense", "Food")


def test_total_income(client):
    add_example_data(client)
    assert client.get("/summary").json()["total_income"] == 1500


def test_total_expenses(client):
    add_example_data(client)
    assert client.get("/summary").json()["total_expenses"] == 300


def test_net_profit(client):
    add_example_data(client)
    assert client.get("/summary").json()["net_profit"] == 1200


def test_net_profit_can_be_negative(client):
    add(client, 100, "income", "Sales")
    add(client, 350, "expense", "Rent")
    assert client.get("/summary").json()["net_profit"] == -250


def test_empty_summary_is_all_zero(client):
    assert client.get("/summary").json() == {
        "total_income": 0,
        "total_expenses": 0,
        "net_profit": 0,
        "monthly": [],
    }


def test_money_math_is_exact(client):
    for _ in range(3):
        add(client, 0.10, "income", "Sales")
    assert client.get("/summary").json()["total_income"] == 0.3  # float sums would give 0.30000000000000004


def test_monthly_breakdown_is_sorted_by_month(client):
    add(client, 300, "income", "Sales", date="2026-09-10")
    add(client, 80, "expense", "Food", date="2026-08-05")
    add(client, 20, "expense", "Food", date="2026-09-12")

    assert client.get("/summary").json()["monthly"] == [
        {"month": "2026-08", "income": 0, "expenses": 80},
        {"month": "2026-09", "income": 300, "expenses": 20},
    ]


def test_summary_updates_after_edit_and_delete(client):
    add(client, 1000, "income", "Sales")
    expense = client.post(
        "/transactions",
        json={"description": "Rent", "amount": 400, "type": "expense", "category": "Rent", "date": "2026-09-01"},
    ).json()

    client.put(
        f"/transactions/{expense['id']}",
        json={"description": "Rent", "amount": 250, "type": "expense", "category": "Rent", "date": "2026-09-01"},
    )
    assert client.get("/summary").json()["net_profit"] == 750

    client.delete(f"/transactions/{expense['id']}")
    assert client.get("/summary").json()["net_profit"] == 1000
