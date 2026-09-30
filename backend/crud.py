"""All database reads/writes and the financial calculations."""
from collections import defaultdict
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from models import Transaction
from schemas import MonthlyTotal, Summary, TransactionInput


def list_transactions(db: Session) -> list[Transaction]:
    query = select(Transaction).order_by(Transaction.date.desc(), Transaction.id.desc())
    return list(db.scalars(query))


def get_transaction(db: Session, transaction_id: int) -> Transaction | None:
    return db.get(Transaction, transaction_id)


def create_transaction(db: Session, data: TransactionInput) -> Transaction:
    transaction = Transaction(
        description=data.description,
        amount=data.amount,
        type=data.type.value,
        category=data.category,
        date=data.date,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def update_transaction(db: Session, transaction: Transaction, data: TransactionInput) -> Transaction:
    transaction.description = data.description
    transaction.amount = data.amount
    transaction.type = data.type.value
    transaction.category = data.category
    transaction.date = data.date
    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction(db: Session, transaction: Transaction) -> None:
    db.delete(transaction)
    db.commit()


def get_summary(db: Session) -> Summary:
    """Totals plus per-month income/expenses.

    Sums use Decimal so money math is exact. Fine for V1's data size; with
    very large tables you would move this into SQL (GROUP BY).
    """
    total_income = Decimal("0")
    total_expenses = Decimal("0")
    by_month: dict[str, dict[str, Decimal]] = defaultdict(
        lambda: {"income": Decimal("0"), "expense": Decimal("0")}
    )

    for transaction in db.scalars(select(Transaction)):
        amount = Decimal(str(transaction.amount))
        month = transaction.date.strftime("%Y-%m")
        by_month[month][transaction.type] += amount
        if transaction.type == "income":
            total_income += amount
        else:
            total_expenses += amount

    monthly = [
        MonthlyTotal(month=month, income=float(totals["income"]), expenses=float(totals["expense"]))
        for month, totals in sorted(by_month.items())
    ]
    return Summary(
        total_income=float(total_income),
        total_expenses=float(total_expenses),
        net_profit=float(total_income - total_expenses),
        monthly=monthly,
    )
