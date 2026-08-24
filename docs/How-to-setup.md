# How to Setup - TimTruong Application

This guide will help you set up and run the TimTruong application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
1. **Bun** - [Download](https://bun.sh) (client package manager)
2. **.NET 10 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/10.0), then run `dotnet workload install aspire`
3. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/) (for local PostgreSQL via Aspire)
4. **uv** + **Python 3.14** - [uv install docs](https://docs.astral.sh/uv/) (ETL only)

---

## Client - Frontend

### 1. Install Dependencies
```shell
cd client
bun install
```

### 2. Configure environment (optional)
```shell
cp .env.example .env
```
`.env` sets `VITE_API_URL`. If omitted, the app falls back to `http://localhost:5309` (see `src/services/api.ts`).

### 3. Start Development Server
```shell
bun run dev
```
The app is available at `http://localhost:5173`.

---

## Server - Backend

The backend is **.NET 10 Aspire**. There are two ways to run it — pick based on what you need.

### Option A — via AppHost (full orchestration, recommended for normal dev)
Starts PostgreSQL (Docker), the API, and the Aspire Dashboard together.

```shell
# Start Docker Desktop first — Aspire needs it for the PostgreSQL container
dotnet run --project TimTruong.AppHost
```
- Aspire Dashboard: `http://localhost:17254`
- API: `https://localhost:7356`
- API docs (Scalar): `https://localhost:7356/scalar/`

**Note**: AppHost is **local-development only** and is never deployed. In production only `TimTruong.ApiService` runs, as a plain containerized ASP.NET Core app (see [Production Deployment](#production-deployment)).

The PostgreSQL container (`WithLifetime(ContainerLifetime.Persistent)`, fixed host port `5432`, not proxied) survives AppHost shutdown and stays reachable on `localhost:5432` even after you stop AppHost — that's what makes Option B below possible.

### Option B — ApiService standalone (skip the dashboard/orchestration overhead)
Needs the Postgres container to already exist — run AppHost (Option A) **once** first if you haven't. After that you can stop AppHost; the container keeps running and stays reachable on port 5432.

Connect `TimTruong.ApiService` to it via its own user-secrets (separate secret store from AppHost's):
```shell
cd TimTruong.ApiService

# Get the auto-generated Postgres password from AppHost's secrets:
cd ../TimTruong.AppHost && dotnet user-secrets list   # → Parameters:postgres-password
cd ../TimTruong.ApiService

dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Host=localhost;Port=5432;Database=timtruongdb;Username=postgres;Password=<paste-password-here>"

dotnet run
```
API is now at `http://localhost:5309`.

### Database Migrations
Run from `server/TimTruong.ApiService/`:
```shell
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

---
## Environment Configuration

### Backend (TimTruong.ApiService)
- `appsettings.json` — base config:
  - `Cors:AllowedOrigins` — **empty on purpose** (see note below)
- `appsettings.Development.json` — Development overrides:
- User-secrets (Development only) — `ConnectionStrings:DefaultConnection`, only needed for standalone mode (Option B above)

**Config load order** (later wins; this is `WebApplicationBuilder.CreateBuilder`'s default provider chain):
1. `appsettings.json`
2. `appsettings.{ASPNETCORE_ENVIRONMENT}.json`
3. User secrets — **only loaded when `ASPNETCORE_ENVIRONMENT=Development`**
4. Environment variables (`__` instead of `:` for nesting, e.g. `Cors__AllowedOrigins__0`)
5. Command-line args

Nested objects merge by key across providers (a later file only overrides the keys it sets, siblings from earlier files survive). **Arrays merge by index, not wholesale** — a JSON array becomes keys like `Cors:AllowedOrigins:0`, `:1`... so a shorter override array does *not* clear the longer array's trailing entries from an earlier provider. This is exactly why `appsettings.json`'s `Cors:AllowedOrigins` must stay `[]`: if it had entries, a production override with fewer origins (via `Cors__AllowedOrigins__0=...`) would still leak the base list's extra entries into the CORS policy.

### AppHost (Development only)
PostgreSQL is fully defined in code (`AppHost.cs`) — data volume, fixed non-proxied host port `5432`, persistent container lifetime. There's no built-in override to point it at a remote database; to do that you'd edit `AppHost.cs` directly.

The Postgres password is auto-generated once by Aspire and persisted to `TimTruong.AppHost`'s own user-secrets (`Parameters:postgres-password`) — it does **not** change between runs. Read it with:
```shell
cd server/TimTruong.AppHost
dotnet user-secrets list
```

### Frontend
`client/.env` (copy from `.env.example`):
```
VITE_API_URL=https://localhost:7356
```
If not set, the frontend falls back to `http://localhost:5309` (the standalone ApiService port).


## ETL Process

Python scripts in `etl/` (uv project, requires Python 3.14). Data files live under `etl/data/`.

### Step 1: Configure environment
```shell
cd etl
cp .env.example .env
```

### Step 2: Run the pipelines (uv handles the venv automatically)
```shell
uv run etl_universities.py     # data/_shared/universities.csv → Universities
uv run etl_majors.py           # data/schools/{Code}-{Short}/majors/{Year}.csv → Majors + MajorYears
uv run etl_dormitories.py      # data/_shared/dormitories.csv → Dormitories
uv run etl_rankings.py         # data/_shared/university_rankings.csv → UniversityRankings
```
Run `etl_universities.py` before `etl_majors.py` — majors link to universities by code.

### Admission scores (điểm chuẩn) — image → CSV → DB, run once per year
```shell
uv run extract_admissions.py [TARGET ...] [--note "..."]   # images → scores.csv (Vision-LLM)
# review/edit scores.csv manually, then:
uv run etl_admissions.py [TARGET ...]                       # scores.csv → AdmissionRequirements
```
`TARGET` filters to a school/year (`SCHOOL`, `SCHOOL/YEAR`, or `SCHOOL-YEAR`); omit for all. Needs majors loaded first.

---

