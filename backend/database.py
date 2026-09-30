"""Database connection setup (SQLite + SQLAlchemy)."""
import warnings
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.exc import SAWarning
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# SQLite stores decimals as floats internally. We round to 2 places in Python,
# so this warning is expected and safe to silence for V1.
warnings.filterwarnings("ignore", message=".*Decimal objects natively.*", category=SAWarning)

DATABASE_PATH = Path(__file__).parent / "accure.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# check_same_thread=False lets FastAPI use SQLite from its worker threads.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: gives each request its own session, then closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
