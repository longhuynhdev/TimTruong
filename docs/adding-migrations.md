# Adding EF Core Migrations

Migrations live in `server/TimTruong.ApiService/Migrations/`. All commands run from the `server/` directory.

## Steps

**1. Modify the model** in `server/Core/Models/`.

**2. Create the migration:**
```bash
cd server
dotnet ef migrations add <DescriptiveName> --project TimTruong.ApiService
```

Name should describe the change, e.g. `AddIsFinanciallyAutonomousToUniversity`.

**3. Review the generated file** in `Migrations/<timestamp>_<Name>.cs` — confirm `Up()` and `Down()` look correct before applying.

**4. Apply to the local database:**
```bash
dotnet ef database update --project TimTruong.ApiService
```

Aspire must be running (PostgreSQL container) for this to succeed.

## Production

Auto-migrations are disabled in production (`Features__EnableAutoMigrations=false`). Deploy the updated API — it will apply pending migrations on startup only if that flag is enabled, otherwise run `database update` manually against the production connection string.

## Rollback

To undo the last migration (before pushing):
```bash
dotnet ef migrations remove --project TimTruong.ApiService
```

To revert the database to a previous migration:
```bash
dotnet ef database update <PreviousMigrationName> --project TimTruong.ApiService
```

## Checklist

- [ ] Model updated in `Core/Models/`
- [ ] Migration generated and reviewed
- [ ] `UniversityDto` / other DTOs updated if new fields are exposed via API
- [ ] `docs/ER-model.md` updated to reflect schema changes
