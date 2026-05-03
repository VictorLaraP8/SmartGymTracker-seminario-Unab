# Migraciones SQL (PostgreSQL)

Ejecuta cada archivo contra la misma base de datos que usa la API (`DATABASE_URL` en tu `.env`).

## Catálogo de ejercicios (`003_exercises_catalog.sql`)

Inserta ~50 ejercicios con `muscle_group` de forma **idempotente** (no duplica si el nombre ya existe).

```bash
cd backend-api
psql "$DATABASE_URL" -f migrations/003_exercises_catalog.sql
```

En Windows (PowerShell) con variable de entorno:

```powershell
psql $env:DATABASE_URL -f migrations/003_exercises_catalog.sql
```

### Revertir solo el catálogo

Al final de `003_exercises_catalog.sql` hay un bloque `DELETE` comentado. Descoméntalo y ejecútalo con `psql`. Si hay filas en `workout_exercises` que referencian esos ejercicios, el `DELETE` puede fallar por claves foráneas; en ese caso elimina o ajusta esas filas antes.

## Otras migraciones

- `001_profile_body_progress.sql` — perfil y `body_progress`
- `002_trainer_coach_module.sql` — módulo trainer/coach

Mismo patrón: `psql "$DATABASE_URL" -f migrations/<archivo>.sql`
