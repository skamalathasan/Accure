"""Pydantic models: validate incoming data and shape outgoing data."""
from datetime import date as date_type
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from categories import CATEGORIES_BY_TYPE


class TransactionType(str, Enum):
    income = "income"
    expense = "expense"


class TransactionInput(BaseModel):
    """Used for both creating and updating a transaction."""

    description: str = Field(min_length=1, max_length=200)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    type: TransactionType
    category: str
    date: date_type

    @field_validator("description")
    @classmethod
    def description_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Description cannot be empty")
        return value

    @model_validator(mode="after")
    def category_matches_type(self):
        allowed = CATEGORIES_BY_TYPE[self.type.value]
        if self.category not in allowed:
            raise ValueError(
                f"'{self.category}' is not a valid {self.type.value} category. "
                f"Choose one of: {', '.join(allowed)}"
            )
        return self


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str
    amount: float  # sent to the frontend as a plain JSON number
    type: TransactionType
    category: str
    date: date_type
    created_at: datetime


class MonthlyTotal(BaseModel):
    month: str  # "YYYY-MM"
    income: float
    expenses: float


class Summary(BaseModel):
    total_income: float
    total_expenses: float
    net_profit: float
    monthly: list[MonthlyTotal]
