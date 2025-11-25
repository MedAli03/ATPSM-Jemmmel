# ATPSM API/Frontend Audit (initial pass)

## Backend layout
- Express app mounts all routers under `/api` in `server/app.js`. Base health endpoints live at `/` and `/health` for platform checks. 【F:server/app.js†L65-L109】
- Server bootstraps via `server/server.js`, wiring Socket.IO, database connectivity, and graceful shutdown. 【F:server/server.js†L1-L54】

## Notable middleware
- Global authentication middleware is applied per-route file; example: all `enfants` routes enforce JWT auth before role checks. 【F:server/routes/enfants.routes.js†L19-L23】
- RBAC uses `requireRole` to restrict sensitive operations (e.g., PRESIDENT/DIRECTEUR for create/update/delete). 【F:server/routes/enfants.routes.js†L28-L57】

## Sample API surface (initial mapping)
| Method | Path | Roles | Controller | Notes |
| --- | --- | --- | --- | --- |
| POST | /api/auth/login | public | `auth.controller.login` | Issues JWT and user payload. 【F:server/routes/auth.routes.js†L5-L7】 |
| GET | /api/enfants | PRESIDENT, DIRECTEUR, EDUCATEUR | `enfants.controller.list` | Validates query params before listing children. 【F:server/routes/enfants.routes.js†L28-L41】 |
| GET | /api/enfants/:id | PRESIDENT, DIRECTEUR, EDUCATEUR, PARENT | `enfants.controller.get` | Params validated; controller expected to scope parent access. 【F:server/routes/enfants.routes.js†L43-L51】 |
| POST | /api/enfants | PRESIDENT, DIRECTEUR | `enfants.controller.create` | Creates child record with validation. 【F:server/routes/enfants.routes.js†L53-L60】 |
| PATCH | /api/enfants/:id/link-parent | PRESIDENT, DIRECTEUR | `enfants.controller.linkParent` | Links parent to child via validated payload. 【F:server/routes/enfants.routes.js†L68-L76】 |
| GET | /api/enfants/me/enfants | PARENT | `enfants.controller.listMine` | Lists children for authenticated parent. 【F:server/routes/enfants.routes.js†L88-L98】 |

> **Note:** This table only covers the `auth` and `enfants` routes as a starting point. Remaining route files (PEI, evaluations, activities, dashboards, notifications, groups, etc.) still need a full sweep to complete the API map.

## Frontend clients discovered (initial)
- Web React app uses a shared Axios instance resolving `/api` by default (`client/src/services/https.js`). It injects Bearer tokens from `auth` localStorage state. 【F:client/src/services/https.js†L4-L41】
- Web API wrappers live under `client/src/api/` (e.g., `enfants.js`, `peis.js`, `stats.js`). Each exports helpers built on the Axios client. **These still need per-endpoint alignment against backend routes.**
- Mobile React Native app sets up an Axios client with `baseURL` from `EXPO_PUBLIC_API_URL` or defaults to `http://localhost:5000/api`. 【F:mobile/src/services/api.ts†L3-L16】 Additional educator-specific APIs are in `mobile/src/features/educateur/api.ts`. 【F:mobile/src/features/educateur/api.ts†L1-L37】

## Gaps / next steps
- Complete the API map for all route files (`pei`, `evaluations`, `activites`, `groupes`, `notifications`, dashboards, etc.), documenting methods, paths, roles, and controllers.
- Inventory every frontend call (web + mobile) from `client/src/api` and feature hooks/screens in `mobile/src/features/**`, then align them with backend routes and payloads.
- Verify RBAC and scoping logic in controllers/services for PARENT and EDUCATEUR to ensure child/group restrictions are enforced.
- Identify missing endpoints (if any) for frontend usage and plan implementations following existing middleware + validation patterns.

This document captures the initial structure to guide a deeper pass that reconciles all endpoints with the web and mobile clients.
