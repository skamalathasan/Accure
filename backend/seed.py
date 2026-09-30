"""Development sample data.

  python seed.py            add sample data (only if the table is empty)
  python seed.py --reset    delete everything, then add sample data
  python seed.py --clear    delete everything
"""
import sys
from datetime import date, timedelta

from database import Base, SessionLocal, engine
from models import Transaction

today = date.today()


def days_ago(n: int) -> date:
    return today - timedelta(days=n)


# (description, amount, type, category, date) - spread over ~3 months for the chart
SAMPLE_TRANSACTIONS = [
    ("Client payment", 2500, "income", "Sales", days_ago(2)),
    ("Software subscription", 50, "expense", "Software", days_ago(3)),
    ("Office supplies", 125, "expense", "Supplies", days_ago(5)),
    ("Rent", 1200, "expense", "Rent", days_ago(8)),
    ("Client payment", 1800, "income", "Sales", days_ago(14)),
    ("Team lunch", 64.50, "expense", "Food", days_ago(21)),
    ("Client payment", 2100, "income", "Sales", days_ago(33)),
    ("Rent", 1200, "expense", "Rent", days_ago(38)),
    ("Delivery van fuel", 95.25, "expense", "Transportation", days_ago(45)),
    ("Design licence refund", 120, "income", "Other Income", days_ago(52)),
    ("Client payment", 1650, "income", "Sales", days_ago(63)),
    ("Rent", 1200, "expense", "Rent", days_ago(68)),
    ("Printer paper and ink", 88, "expense", "Supplies", days_ago(75)),
    ("Software subscription", 50, "expense", "Software", days_ago(84)),
]


def clear(db) -> int:
    return db.query(Transaction).delete()


def seed(db) -> None:
    for description, amount, type_, category, when in SAMPLE_TRANSACTIONS:
        db.add(Transaction(description=description, amount=amount, type=type_, category=category, date=when))


def main() -> None:
    flag = sys.argv[1] if len(sys.argv) > 1 else ""
    if flag not in ("", "--reset", "--clear"):
        sys.exit(__doc__)

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if flag in ("--reset", "--clear"):
            print(f"Removed {clear(db)} transactions.")
        elif db.query(Transaction).count() > 0:
            sys.exit("Table already has data. Use --reset to replace it.")
        if flag != "--clear":
            seed(db)
            print(f"Added {len(SAMPLE_TRANSACTIONS)} sample transactions.")
        db.commit()


if __name__ == "__main__":
    main()
