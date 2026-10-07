# Campus Customs — Yale Bulldog Blue

A Yale merch store with a helpful shopping chatbot. Shoppers can browse products, create an
account, and chat about merch; the assistant gives honest price and stock answers from a
local database and surfaces matching products on the page.

- **Frontend:** React + Vite + TypeScript
- **Backend:** Python FastAPI, with a PydanticAI agent (model `gpt-5.6-luna` via Portkey)
- **Data:** local SQLite database (`data/campus_customs.db`) + product images

## The agent

The agent lives in four files under `backend/`:

- `prompts/prompt.md` — the system prompt (voice + safety rules)
- `agent.py` — model wiring, dependencies, and the run entry point
- `tools.py` — the catalogue tools the agent can call (search, details, stock)
- `models.py` — the pydantic / PydanticAI structured types

(`main.py` is the FastAPI app; `auth.py`, `db.py`, `security.py`, `chat_store.py`, and
`audit.py` are supporting modules it imports.)

## Prerequisites

- Python 3.11+ and Node.js 18+
- A Portkey API key with access to `gpt-5.6-luna`

## 1. Place the data pack

This repo does **not** include the database or product images. Put the provided data pack
in place so the folders look like this:

```
data/
├── campus_customs.db          # the SQLite database
└── products/                  # product images referenced by the catalogue
```

(`data/` is git-ignored, so it is never committed.)

## 2. Configure your API key

```bash
cp .env.example .env
# then edit .env and set PORTKEY_API_KEY to your key
```

`.env` is git-ignored and never committed.

## 3. Run the backend (FastAPI)

From the repo root:

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cd backend
uvicorn main:app --reload --port 8000
```

The API runs at http://localhost:8000.

## 4. Run the frontend (Vite)

In a second terminal, from the repo root:

```bash
cd frontend
npm install
npm run dev
```

Open the site at **http://localhost:5173**. Vite proxies `/api` and `/images` to the
backend on port 8000, so start the backend first.

## Test account

- **Email:** `test@campuscustoms.yale.edu`
- **Password:** `password`

You can also create a new account through the site.

## Project layout

```
hw4/
├── AI_prompts.md          # running log of every prompt used to build this
├── requirements.txt       # backend Python dependencies
├── .env.example           # copy to .env and fill in (placeholders only)
├── .gitignore
├── README.md
├── frontend/              # Vite React TypeScript app
├── backend/               # FastAPI app + PydanticAI agent
│   ├── main.py
│   ├── agent.py  tools.py  models.py   # the agent
│   ├── prompts/prompt.md
│   └── auth.py  db.py  security.py  chat_store.py  audit.py
└── output/                # write-ups, app check, and the agent audit trail
```

## Notes

- Prices come from `catalogue.price` and stock from `inventory.quantity`; the agent answers
  through tools that read the database, so it never invents a price or quantity.
- `output/audit_trail.json` is an append-only log of agent-loop activity (tool calls + stop
  reasons) and grows as you use the chat.
- See `output/harness.md` for a full write-up of how the system works.
