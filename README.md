# Route 53 Clone — AWS Management Console

A production-quality clone of the AWS Route 53 DNS management console, built with Next.js 15, FastAPI, and SQLite. The UI closely mirrors the real AWS Route 53 experience — from layout and typography to navigation, tables, modals, and color palette.

---

## Demo credentials

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@example.com      |
| Password | password123            |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Next.js 15)                      │
│  ┌──────────┐   ┌────────────────┐   ┌───────────────────────┐  │
│  │  Pages   │ → │Feature Components│ → │API Layer (axios+RQ) │  │
│  └──────────┘   └────────────────┘   └───────────┬───────────┘  │
└──────────────────────────────────────────────────┼──────────────┘
                                                    │ HTTPS
                                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FastAPI (Python)                          │
│  ┌──────────┐   ┌────────────────┐   ┌───────────────────────┐  │
│  │API Routes│ → │Service Layer   │ → │Repository Layer       │  │
│  └──────────┘   └────────────────┘   └───────────┬───────────┘  │
└──────────────────────────────────────────────────┼──────────────┘
                                                    │
                                                    ▼
                                             ┌────────────┐
                                             │  SQLite DB  │
                                             └────────────┘
```

---

## Database Schema

```
users
├── id           INTEGER PK
├── email        TEXT UNIQUE
├── password_hash TEXT
└── created_at   DATETIME

hosted_zones
├── id           INTEGER PK
├── zone_name    TEXT UNIQUE
├── comment      TEXT
├── private_zone BOOLEAN
├── record_count INTEGER
├── created_at   DATETIME
└── updated_at   DATETIME

dns_records
├── id             INTEGER PK
├── hosted_zone_id INTEGER FK → hosted_zones.id (CASCADE DELETE)
├── name           TEXT
├── type           TEXT (A|AAAA|CNAME|TXT|MX|NS|PTR|SRV|CAA)
├── value          TEXT
├── ttl            INTEGER
├── routing_policy TEXT
├── created_at     DATETIME
└── updated_at     DATETIME
```

---

## Folder Structure

```
route53-clone/
├── backend/
│   ├── alembic/                  # Database migrations
│   │   └── versions/
│   │       └── 001_initial_schema.py
│   ├── app/
│   │   ├── api/                  # FastAPI route handlers (thin)
│   │   │   ├── auth.py
│   │   │   ├── hosted_zones.py
│   │   │   └── dns_records.py
│   │   ├── core/                 # Config, security, dependencies
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   ├── database/             # SQLAlchemy session + Base
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── repositories/         # Database access only
│   │   ├── schemas/              # Pydantic v2 schemas
│   │   └── services/             # Business logic
│   ├── tests/                    # Pytest tests
│   ├── main.py                   # FastAPI app entry point
│   ├── requirements.txt
│   ├── alembic.ini
│   └── render.yaml               # Render deployment config
│
└── frontend/
    ├── app/                      # Next.js 15 App Router
    │   ├── (auth)/login/         # Login page
    │   └── (dashboard)/          # Protected pages
    │       ├── hosted-zones/     # Hosted zone list + detail
    │       ├── traffic-policies/ # Coming soon
    │       ├── health-checks/    # Coming soon
    │       ├── resolver/         # Coming soon
    │       └── profiles/         # Coming soon
    ├── components/
    │   ├── layout/               # TopBar, Sidebar
    │   └── shared/               # Reusable UI components
    ├── features/
    │   ├── hosted-zones/         # HZ list, detail, modals, table
    │   └── dns-records/          # DNS record table, modals
    ├── hooks/                    # React Query hooks
    ├── services/                 # Axios API service layer
    ├── lib/                      # Utils, axios instance, auth store
    ├── types/                    # TypeScript types
    ├── tests/                    # Vitest + RTL tests
    └── vercel.json               # Vercel deployment config
```

---

## API Documentation

### Authentication

| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| POST   | /api/auth/login   | Get JWT access token |
| POST   | /api/auth/logout  | Logout (stateless)   |
| GET    | /api/auth/me      | Get current user     |

### Hosted Zones

| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| GET    | /api/hosted-zones         | List zones (paginated)    |
| POST   | /api/hosted-zones         | Create zone               |
| GET    | /api/hosted-zones/{id}    | Get single zone           |
| PUT    | /api/hosted-zones/{id}    | Update zone               |
| DELETE | /api/hosted-zones/{id}    | Delete zone + all records |

**Query parameters for GET /api/hosted-zones:**
- `page` (int, default 1)
- `page_size` (int, default 25, max 100)
- `search` (string) — filters name and comment
- `filter_type` (public|private)
- `sort_by` (zone_name|created_at|record_count)
- `sort_order` (asc|desc)

### DNS Records

| Method | Endpoint                                     | Description              |
|--------|----------------------------------------------|--------------------------|
| GET    | /api/hosted-zones/{id}/records               | List records (paginated) |
| POST   | /api/hosted-zones/{id}/records               | Create record            |
| DELETE | /api/hosted-zones/{id}/records/bulk          | Bulk delete records      |
| GET    | /api/records/{id}                            | Get single record        |
| PUT    | /api/records/{id}                            | Update record            |
| DELETE | /api/records/{id}                            | Delete record            |

---

## Installation & Local Development

### Prerequisites

- Python 3.11+
- Node.js 20+
- npm 10+

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (creates route53.db automatically)
python -m alembic upgrade head

# Start development server
python -m uvicorn main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000
API docs (Swagger): http://localhost:8000/docs

### Frontend

```bash
cd frontend

# Copy environment file
cp .env.local.example .env.local
# Edit .env.local if needed — default points to localhost:8000

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

### Tests

**Backend:**
```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

**Frontend:**
```bash
cd frontend
npm test
```

---

## Deployment

### Backend → Render

1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set **Build command:** `pip install -r requirements.txt && python -m alembic upgrade head`
4. Set **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `SECRET_KEY` — generate with `openssl rand -hex 32`
   - `DATABASE_URL` — `sqlite:///./route53.db`
   - `DEMO_EMAIL` — `admin@example.com`
   - `DEMO_PASSWORD` — `password123`

Or use the included `render.yaml` for automated deployment.

### Frontend → Vercel

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` — your Render backend URL (e.g., `https://route53-api.onrender.com`)
5. Deploy

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                    | Default                      | Description                    |
|-----------------------------|------------------------------|--------------------------------|
| `APP_NAME`                  | Route53 Clone API            | API title                      |
| `DEBUG`                     | false                        | Enable SQLAlchemy echo         |
| `DATABASE_URL`              | sqlite:///./route53.db       | Database connection string     |
| `SECRET_KEY`                | (change me)                  | JWT signing key                |
| `ALGORITHM`                 | HS256                        | JWT algorithm                  |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 1440                       | Token lifetime (24h)           |
| `DEMO_EMAIL`                | admin@example.com            | Demo user email                |
| `DEMO_PASSWORD`             | password123                  | Demo user password             |

### Frontend (`frontend/.env.local`)

| Variable               | Default                 | Description            |
|------------------------|-------------------------|------------------------|
| `NEXT_PUBLIC_API_URL`  | http://localhost:8000   | Backend API base URL   |

---

## Tech Stack

| Layer     | Technology                                                      |
|-----------|-----------------------------------------------------------------|
| Frontend  | Next.js 15, TypeScript, TailwindCSS, shadcn/ui                 |
| State     | React Query (server state), Zustand (auth)                      |
| Tables    | TanStack Table v8                                               |
| Forms     | React Hook Form + Zod                                           |
| Icons     | Lucide React                                                    |
| HTTP      | Axios                                                           |
| Backend   | FastAPI, SQLAlchemy 2, Pydantic v2, Alembic                     |
| Auth      | JWT (python-jose + passlib/bcrypt)                              |
| Database  | SQLite (file-based, zero-config)                                |
| Testing   | Pytest (backend), Vitest + React Testing Library (frontend)     |
| Deploy    | Vercel (frontend) + Render (backend)                            |

---

## Features

- ✅ AWS Route 53 faithful UI (dark nav, AWS orange, proper typography)
- ✅ JWT authentication with demo credentials
- ✅ Hosted Zones CRUD (create, view, edit, delete)
- ✅ DNS Records CRUD (A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA)
- ✅ Real-time search with debounce
- ✅ Server-side pagination (10 / 25 / 50 per page)
- ✅ Sort by any column (asc/desc)
- ✅ Filter by zone type (public/private) and record type
- ✅ Bulk selection and bulk delete of DNS records
- ✅ Export hosted zones and DNS records as CSV
- ✅ Confirmation modals for destructive actions
- ✅ Toast notifications for all operations
- ✅ Loading skeletons
- ✅ Empty states
- ✅ Error states with retry
- ✅ Responsive layout
- ✅ Protected routes (auto-redirect to login)
- ✅ Session persistence (localStorage via Zustand)
- ✅ Record count auto-updates when records are added/deleted
