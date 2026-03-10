# How to Setup - TimTruong Application

This guide will help you set up and run the TimTruong application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
1. **Bun** (v1.0 or higher) - [Download](https://bun.sh)
2. **.NET 10.0 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/10.0)
3. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)

### Verify Installation
Run these commands to verify your setup:
```shell
bun --version     # Should show 1.0+
dotnet --version  # Should show 10.0.x
docker --version  # Should show Docker version
```

---

## Client - Frontend

### 1. Install Bun (if not already installed)
```shell
curl -fsSL https://bun.sh/install | bash
```

### 2. Install Dependencies
Navigate to the client directory and install all required packages:
```shell
cd client
bun install
```

### 3. Start Development Server
Launch the frontend application:
```shell
bun run dev
```

The application will be available at `http://localhost:5173` (default Vite port).
---

## Server - Backend

The backend uses **.NET Aspire** for orchestration, which automatically manages PostgreSQL and the API service.

### 1. Verify .NET Installation
Ensure you have .NET 10.0 SDK installed:
```shell
dotnet --version
```

### 2. Restore NuGet Packages
Navigate to the server directory and restore dependencies:
```shell
cd server
dotnet restore
```

### 3. Install .NET Aspire Workload
If this is your first time using .NET Aspire, install the workload:
```shell
dotnet workload update
dotnet workload install aspire
```

### 4. Start Docker Desktop
Ensure Docker Desktop is running before starting the application. Aspire uses Docker to run PostgreSQL and pgAdmin containers.

### 5. Run the Application
Start the Aspire AppHost, which will orchestrate all services:
```shell
dotnet run --project TimTruong.AppHost
```

This command will:
- Start PostgreSQL database with persistent volume (using Docker)
- Launch pgAdmin for database management
- Start the API service
- Display the Aspire Dashboard

**Note**: AppHost is for **local development only**. In production, only TimTruong.ApiService is deployed as a standalone ASP.NET Core application.

### 6. Access the Services
Once running, you'll see the Aspire Dashboard URL in the terminal ( `http://localhost:17254`).

From the dashboard, you can access:
- **API Service** - The REST API endpoint
- **API Documentation** - https://localhost:7356/scalar/
- **PostgreSQL** - Database connection details
- **pgAdmin** - Web-based database administration tool

### 7. Database Migrations
If you need to apply or create database migrations:

```shell
# Navigate to the API service directory
cd TimTruong.ApiService

# Create a new migration
dotnet ef migrations add <MigrationName>

# Apply migrations to database
dotnet ef database update
```

---

## Environment Configuration

### Backend (TimTruong.ApiService)
The backend configuration is managed through:
- `appsettings.json` - Base configuration with production defaults
  - CORS: Empty allowed origins (must be set via environment variables)
  - Features: OpenAPI disabled, auto-migrations disabled
- `appsettings.Development.json` - Development overrides
  - CORS: `http://localhost:5173` (frontend)
  - Features: OpenAPI enabled, auto-migrations enabled

**Key Configuration Sections:**
```json
{
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173"]
  },
  "Features": {
    "EnableOpenApi": true,
    "EnableAutoMigrations": true
  }
}
```

### AppHost (Development Only)
By default, AppHost uses **local Docker PostgreSQL** - no configuration needed.

**Optional: Connect to Remote Database**
If you need to test against a production or shared database, use .NET user secrets:

```shell
cd server/TimTruong.AppHost

# Set connection string via user secrets (one-time setup)
dotnet user-secrets set "ConnectionStrings:timtruongdb" "Host=your-db-host;Database=your-db;Username=your-user;Password=your-password;SSL Mode=VerifyFull"
```

User secrets are stored securely in your user profile (`~/.microsoft/usersecrets/`) and persist across sessions.

### Frontend
Create a `.env` file in the `client` directory (optional):
```
VITE_API_URL=http://localhost:5309
```

If not set, the frontend defaults to `http://localhost:5309`.

---

## Production Deployment

**Important**: Only `TimTruong.ApiService` is deployed to production. AppHost is a development-only orchestration tool.

### Backend (TimTruong.ApiService)
Set these environment variables in your production environment:

```shell
# Database connection
ConnectionStrings__DefaultConnection="Host=your-db;Database=your-db;Username=your-user;Password=your-password"

# CORS (add your frontend domains)
Cors__AllowedOrigins__0="https://yourdomain.com"
Cors__AllowedOrigins__1="https://www.yourdomain.com"

# Features (auto-migrations should be false in production)
Features__EnableOpenApi=false
Features__EnableAutoMigrations=false
```

### Frontend
Set the API URL environment variable:
```shell
VITE_API_URL=https://api.yourdomain.com
```

Then build:
```shell
cd client
bun run build
```

The `dist` folder contains the static files ready for deployment (Azure Static Web Apps, Vercel, Netlify, etc.).

---
## ETL Process
### Step 1: Navigate to the data directory
```shell
cd data
```
### Step 2: Activate the virtual environment (Do this BEFORE installing packages)
```shell
source venv/bin/activate
```

### Step 3: Install required Python dependencies
```
pip install -r requirements.txt
```
### Step 4: Add required data files to the data directory
 - credentials.json: Contains database connection strings and API keys
 - universities.csv: Source data file with university records
### Step 5: Run the ETL pipeline
```shell
python3 etl.py
```


## Troubleshooting

### Common Issues

#### Frontend Not Starting
- Ensure Bun is installed correctly
- Delete `node_modules` and `bun.lock`, then run `bun install` again
- Check if port 5173 is already in use

#### Backend Not Starting
- Ensure .NET 10.0 SDK is installed
- Verify Docker Desktop is running
- Check if required ports are available ( 7356 for API, 50380 for PostgreSQL)
- Run `dotnet clean` and `dotnet restore` to clean and restore packages

#### Database Connection Issues
- Ensure Docker containers are running via Aspire Dashboard
- Check PostgreSQL logs in the Aspire Dashboard
- If using remote database with user secrets, verify the connection string:
  ```shell
  cd server/TimTruong.AppHost
  dotnet user-secrets list
  ```

#### Aspire Workload Issues
```shell
# Update Aspire workload
dotnet workload update

# Repair Aspire installation
dotnet workload repair
```
---
