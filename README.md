# FinSight

A Finance Data Processing and Access Control Backend built with Django REST Framework.

---

## Overview

FinSight is a backend system designed to manage personal financial data through a structured, role-aware REST API. The core focus of the project is API design, data modeling, and enforcing access control at the server level — not at the client.

The system handles financial records (income, expenses, budgets), aggregates them into analytics, and restricts access to those analytics based on the authenticated user's assigned role. All permission logic is enforced in the backend; the frontend has no authority over what data a user can access.

A React frontend is included as a lightweight demonstration layer. Its purpose is to make the API behavior visible — showing how different roles interact with the system, how analytics are rendered, and how write operations are gated. It is not the focus of the project.

---

## Key Features

### Authentication and Security

- JWT-based authentication using `djangorestframework-simplejwt`
- Access token (30-minute lifetime) and refresh token (7-day lifetime) issued on login
- Automatic token refresh handled by the frontend Axios interceptor
- All protected endpoints require a valid `Authorization: Bearer <token>` header
- Inactive accounts are rejected at login with a `403` response

### Role-Based Access Control

Three roles are defined on the custom `User` model:

- **Viewer** — read-only access to financial records; no access to analytics
- **Analyst** — read access to records plus full access to all analytics endpoints
- **Admin** — full CRUD on all records, budgets, categories, and sources; user management

Permissions are enforced through four custom `BasePermission` classes in `core/permissions.py`:

| Class | Behaviour |
|---|---|
| `IsViewerOrAbove` | Any authenticated user |
| `IsAnalystOrAdmin` | Role must be `analyst` or `admin` |
| `IsAdmin` | Role must be `admin` |
| `ReadOnlyForViewer` | Viewers: GET only. Analysts and admins: full access |

Every view applies the appropriate permission class directly. There is no client-side enforcement — a viewer sending a `POST` request directly to the API receives a `403`.

### Financial Records Management

The records layer covers five models: `Budget`, `Income`, `Expenses`, `Source`, and `Category`.

- Full CRUD on income, expenses, budgets, sources, and categories
- Expenses are linked to a budget via a required foreign key; the serializer validates that the expense amount does not exceed the budget's remaining balance
- Amount validation rejects values of zero or below at the serializer level
- Expenses support optional receipt image upload with server-side resizing via Pillow
- Client-side filtering by category, date range, and keyword search
- Results ordered by creation date descending by default

### Analytics Engine

The `analytics` app is intentionally separated from `records`. It contains no models — it only reads from the records layer and returns aggregated data.

Three endpoints are available, all restricted to `analyst` and `admin` roles:

- **Summary** — total income, total expenses, and net balance for the authenticated user
- **Insights** — expense totals grouped by category using Django ORM annotation
- **Monthly trends** — expense totals grouped by month using `TruncMonth`

The summary endpoint uses Django's in-memory cache with a 60-second TTL to avoid redundant aggregation queries on repeated requests.

### System-Level Features

- Global pagination via `PageNumberPagination` (page size: 10)
- Per-user rate limiting: 100 requests/minute for authenticated users, 20/minute for anonymous
- CORS configured via environment variable; defaults to allow-all in local development
- Environment-driven configuration using `python-dotenv` — no hardcoded secrets
- Media file handling with local storage and image resizing on save

---

## Tech Stack

**Backend**

| Component | Technology |
|---|---|
| Framework | Django 4.0.2 |
| API layer | Django REST Framework 3.13.1 |
| Authentication | djangorestframework-simplejwt 5.0.0 |
| Database | SQLite (development) |
| Image processing | Pillow 8.4.0 |
| CORS | django-cors-headers 3.11.0 |
| Filtering | django-filter |

**Frontend (demonstration only)**

| Component | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Styling | Tailwind CSS |
| HTTP client | Axios |
| Charts | Recharts |
| Routing | React Router v6 |

---

## API Design Overview

All endpoints are prefixed with `/api/`.

### Authentication — `/api/users/`

| Method | Path | Description | Access |
|---|---|---|---|
| POST | `auth/register/` | Register a new user | Public |
| POST | `auth/login/` | Obtain access and refresh tokens | Public |
| POST | `auth/token/refresh/` | Refresh an expired access token | Public |
| GET | `me/` | Return current user profile | Authenticated |
| GET | `` | List all users | Admin |
| PATCH | `<id>/role/` | Update a user's role | Admin |
| PATCH | `<id>/status/` | Activate or deactivate a user | Admin |

### Records — `/api/records/`

| Method | Path | Description | Access |
|---|---|---|---|
| GET | `info` | Aggregated monthly summary | Authenticated |
| GET / POST | `budgets` | List or create budgets | GET: any / POST: admin |
| PUT / DELETE | `budgets/<id>` | Update or delete a budget | Admin |
| GET / POST | `income` | List or create income records | GET: any / POST: admin |
| PUT / DELETE | `income/<id>` | Update or delete an income record | Admin |
| GET / POST | `expenses` | List or create expenses | GET: any / POST: admin |
| PUT / DELETE | `expenses/<id>` | Update or delete an expense | Admin |
| GET / POST | `categories` | List or create categories | GET: any / POST: admin |
| GET / POST | `sources` | List or create income sources | GET: any / POST: admin |

### Analytics — `/api/analytics/`

| Method | Path | Description | Access |
|---|---|---|---|
| GET | `summary/` | Total income, expenses, balance | Analyst, Admin |
| GET | `insights/` | Expense breakdown by category | Analyst, Admin |
| GET | `monthly-trends/` | Monthly expense totals | Analyst, Admin |

---

## Role-Based Access Logic

```
POST /api/records/expenses   →  viewer:  403 Forbidden
                             →  analyst: 403 Forbidden
                             →  admin:   201 Created

GET  /api/analytics/summary/ →  viewer:  403 Forbidden
                             →  analyst: 200 OK
                             →  admin:   200 OK

GET  /api/records/income     →  viewer:  200 OK
                             →  analyst: 200 OK
                             →  admin:   200 OK
```

Roles are stored on the `User` model as a `CharField` with three valid choices. The permission classes in `core/permissions.py` read `request.user.role` directly after confirming `is_authenticated`. There is no middleware or decorator magic — each view explicitly declares which permission class applies.

---

## System Architecture

```
FinSight-main/
├── finsight_core/        # Project configuration
│   ├── settings.py       # Environment-driven settings
│   ├── urls.py           # Root URL routing
│   ├── utils.py          # Shared image utilities
│   └── validators.py     # Shared field validators
│
├── users/                # Authentication and user management
│   ├── models.py         # Custom User extending AbstractUser
│   ├── serializers.py    # Register, login, role, status serializers
│   ├── views.py          # Auth endpoints and admin user management
│   └── urls.py
│
├── records/              # Core financial data layer
│   ├── models.py         # Budget, Income, Expenses, Source, Category
│   ├── serializers.py    # Per-operation serializers with validation
│   ├── views.py          # ExpenseViewSet with filtering and search
│   ├── views_expense.py  # Expense and category endpoints
│   ├── views_income.py   # Income and source endpoints
│   ├── views_budget.py   # Budget endpoints
│   └── urls.py
│
├── analytics/            # Read-only aggregation layer
│   ├── views.py          # Summary, insights, monthly trends
│   ├── services.py       # Reusable aggregation logic
│   └── urls.py
│
├── core/                 # Shared backend utilities
│   └── permissions.py    # IsAdmin, IsAnalystOrAdmin, IsViewerOrAbove, ReadOnlyForViewer
│
└── finsight-frontend/    # React demo application
```

**`users/`** owns authentication and the user lifecycle. It is the only app that issues tokens and manages role assignment.

**`records/`** owns all financial data. It enforces that expenses cannot exceed their associated budget's remaining balance, and that amounts are always positive. Write access is restricted to admin at the view level.

**`analytics/`** contains no models. It queries the records layer using Django ORM aggregations and returns computed results. Keeping it separate means analytics logic can be modified, cached, or replaced without touching the data models.

**`core/`** contains only permission classes. Centralising them here means any view in any app can import and apply them consistently.

---

## How to Run the Project

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd FinSight-main

# Install dependencies
pip install -r requirements.txt
pip install python-dotenv django-filter

# Apply migrations
python manage.py migrate

# Create a superuser (optional, for Django admin)
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/api/`.

### Environment Variables (Backend)

The backend reads from `FinSight-main/.env`:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ACCESS_TOKEN_LIFETIME_MINUTES=30
REFRESH_TOKEN_LIFETIME_DAYS=7
```

### Frontend

```bash
cd FinSight-main/finsight-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Environment Variables (Frontend)

The frontend reads from `FinSight-main/finsight-frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

---

## Demo Flow

The following sequence demonstrates the system's core behaviour end to end.

**1. Register accounts with different roles**

```
POST /api/users/auth/register/
{ "username": "alice", "password": "...", "role": "admin" }

POST /api/users/auth/register/
{ "username": "bob", "password": "...", "role": "viewer" }

POST /api/users/auth/register/
{ "username": "carol", "password": "...", "role": "analyst" }
```

**2. Log in as admin and create records**

```
POST /api/users/auth/login/
→ returns { "access": "...", "refresh": "...", "user": { "role": "admin" } }

POST /api/records/budgets        → create a budget with a total amount and end date
POST /api/records/income         → create an income record
POST /api/records/expenses       → create an expense linked to the budget
```

**3. Verify role restrictions**

Log in as `bob` (viewer) and attempt a write operation:
```
POST /api/records/expenses  →  403 Forbidden
GET  /api/analytics/summary/ →  403 Forbidden
GET  /api/records/income     →  200 OK
```

Log in as `carol` (analyst) and access analytics:
```
GET /api/analytics/summary/        →  200 OK  { total_income, total_expense, balance }
GET /api/analytics/insights/       →  200 OK  { category_breakdown: [...] }
GET /api/analytics/monthly-trends/ →  200 OK  [{ month, total }, ...]
POST /api/records/expenses         →  403 Forbidden
```

**4. Admin user management**

Log in as `alice` (admin):
```
GET   /api/users/              →  list all users
PATCH /api/users/2/role/       →  { "role": "analyst" }
PATCH /api/users/2/status/     →  { "is_active": false }
```

---

## Design Decisions

**Custom User model**

Django's built-in `User` model does not support application-level roles. Extending `AbstractUser` with a `role` field keeps role data on the user record itself, making permission checks a single attribute read (`request.user.role`) rather than a separate database query.

**Centralised permission classes**

Rather than repeating role checks inline across views, all permission logic lives in `core/permissions.py`. This makes the access rules auditable in one place and ensures consistency across the `records`, `analytics`, and `users` apps.

**Separate analytics app**

Analytics logic is intentionally isolated from the records data layer. The `analytics` app has no models — it only reads. This separation means the aggregation logic can be optimised, cached, or swapped out without any risk to the underlying data. It also makes the access boundary explicit: analytics is a privilege, not a default.

**Budget-expense relationship**

Expenses require a budget foreign key, and the serializer validates that the expense amount does not exceed the budget's remaining balance at write time. This enforces financial integrity at the API layer rather than relying on the client to check.

**Frontend as a demo layer**

The React frontend exists to make the API observable without requiring a separate API client like Postman. It demonstrates role-based UI restrictions (hiding write controls from viewers, blocking analytics for non-analysts) and renders the analytics data visually. It does not contain any business logic.

---

## Future Improvements

- **Token blacklisting on logout** — currently, logging out only clears the client-side token. Implementing simplejwt's token blacklist app would invalidate refresh tokens server-side.
- **PostgreSQL support** — the current SQLite setup is suitable for development. A production deployment would require switching to PostgreSQL and configuring the database via environment variables.
- **Advanced analytics** — the current analytics endpoints aggregate at the user level. Adding time-range filtering, income trend tracking, and budget utilisation percentages would make the analytics layer more useful.
- **Celery background tasks** — recurring operations such as marking budgets as expired or sending budget threshold notifications could be offloaded to a task queue.
- **API documentation** — integrating `drf-spectacular` would generate an OpenAPI schema and interactive documentation automatically from the existing views and serializers.

---

## Conclusion

FinSight demonstrates a structured approach to building a role-aware REST API with Django REST Framework. The permission system is enforced entirely at the backend, the data layer includes validation at the serializer level, and the analytics layer is cleanly separated from the records layer. The project is designed to be readable, auditable, and straightforward to extend.
