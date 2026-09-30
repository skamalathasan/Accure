"""The fixed V1 categories. Each transaction type has its own list."""
INCOME_CATEGORIES = ["Sales", "Other Income"]
EXPENSE_CATEGORIES = ["Rent", "Food", "Transportation", "Software", "Supplies", "Other"]

CATEGORIES_BY_TYPE = {
    "income": INCOME_CATEGORIES,
    "expense": EXPENSE_CATEGORIES,
}
