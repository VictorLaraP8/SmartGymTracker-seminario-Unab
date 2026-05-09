# API gaps del panel de entrenadores

Este frontend usa endpoints reales para autenticación, clientes asignados, ranking, usuarios en riesgo y **módulo COACH** (mensajes y recomendaciones por alumno asignado).

## Endpoints disponibles usados

- `POST /api/auth/login`
- `GET /api/trainer/clients`
- `POST /api/trainer/clients`
- `GET /api/trainer/clients/:clientId/messages` — hilo compartido con la app (`/api/me/coach/messages` del alumno)
- `POST /api/trainer/clients/:clientId/messages`
- `GET /api/trainer/clients/:clientId/recommendations`
- `POST /api/trainer/clients/:clientId/recommendations`
- `GET /api/users/at-risk`
- `GET /api/dashboard/ranking`

## Endpoints faltantes (panel / métricas por alumno)

- `GET /api/trainer/clients/:clientId/dashboard`
  - Perfil del alumno
  - Última actividad real
  - Frecuencia semanal real
  - Volumen total y semanal
  - Historial semanal (8 semanas)
  - Alertas de adherencia por alumno

## Comportamiento actual (mocks)

- Si `VITE_USE_MOCKS=true`, se habilita un historial semanal simulado en:
  - `UserDetail` (gráfico de progreso)
  - `Progress`
- Si `VITE_USE_MOCKS=false`, esas secciones muestran estado `N/D`.
