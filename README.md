# Accure

Accure is a simple financial tracker for small businesses. Record income and expenses, then see your totals and monthly trends on a dashboard.

This is **VERSION 1**: no accounts, no bank connections, just a clean tool for tracking money in and out.

## Features

- Dashboard with **Total Income**, **Total Expenses**, and **Net Profit**
- Monthly income vs. expenses bar chart
- Add, edit, and delete transactions (with a delete confirmation)
- Fixed categories that depend on the transaction type
- Validation on both the frontend and the backend
- Data saved in a SQLite database, so it survives page refreshes and restarts
- Loading, empty, and error states

## Tech Stack

| Part | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, Recharts |
| Backend | Python, FastAPI, Pydantic |
| Database | SQLite via SQLAlchemy |
| Tests | pytest |

## Installation

You need **Python 3.10+** and **Node.js 20+**.

```bash
# Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Frontend (in a second terminal)
cd frontend
npm install
```

## Running the app

**Backend** (http://localhost:8000, interactive docs at `/docs`):

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```

**Frontend** (http://localhost:3000):

```bash
cd frontend
npm run dev
```

The database file (`backend/accure.db`) is created automatically the first time the backend starts. If your backend runs somewhere other than `http://localhost:8000`, copy `frontend/.env.example` to `frontend/.env.local` and change `NEXT_PUBLIC_API_URL`.

### Sample data

```bash
cd backend
python seed.py            # add sample transactions (only if the table is empty)
python seed.py --reset    # delete everything, then add the sample data
python seed.py --clear    # delete everything
```

## Running the tests

```bash
cd backend
source .venv/bin/activate
pytest
```

The tests use a temporary in-memory database, so they never touch your real data.

## Architecture

```
accure/
├── backend/
│   ├── main.py          # creates the app, CORS, error handling
│   ├── database.py      # SQLite connection and sessions
│   ├── models.py        # Transaction database table
│   ├── schemas.py       # Pydantic validation for requests/responses
│   ├── categories.py    # the fixed category lists
│   ├── crud.py          # database operations + summary calculations
│   ├── routes/          # thin HTTP handlers (transactions, summary)
│   ├── seed.py          # sample data
│   └── tests/
└── frontend/
    ├── app/             # pages: Dashboard (/) and Transactions (/transactions)
    ├── components/      # table, form modal, cards, chart, dialogs
    └── lib/             # API client, types, formatting helpers
```

**How it fits together**

- The browser never touches the database. The frontend calls the FastAPI REST API through one small client (`frontend/lib/api.ts`).
- **The backend is the source of truth.** It validates every request (amount > 0, valid type, category matching the type, valid date) and calculates all totals. The frontend only displays what the API returns. The form validates too, but only to give faster feedback.
- After any add, edit, or delete, the page refetches from the API. The dashboard loads fresh totals each time you open it.
- Money is stored and summed as exact decimals on the backend to avoid floating-point errors.

**API**

| Method | Path | Purpose |
|---|---|---|
| GET | `/transactions` | List all (newest first) |
| GET | `/transactions/{id}` | Get one |
| POST | `/transactions` | Create |
| PUT | `/transactions/{id}` | Update |
| DELETE | `/transactions/{id}` | Delete |
| GET | `/summary` | Totals + monthly income/expenses |

**Categories** are defined in `backend/categories.py` and mirrored in `frontend/lib/categories.ts` (the backend rejects anything not on its list). If you change one, change both.
