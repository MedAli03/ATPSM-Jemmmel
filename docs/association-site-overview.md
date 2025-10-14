# Association Website Codebase Overview

## Technology Stack
- **Frontend**: React 18 with Vite bundler, Tailwind CSS (RTL configuration), Material UI for select form controls, React Router for routing, React Query for data fetching, Axios for API calls, and Framer Motion / React Slick for animations.
- **Backend**: Node.js with Express framework, Sequelize ORM targeting a MySQL database. Features include authentication via JWT, SSE-based notifications, and migrations for schema evolution.

## Frontend Structure
- `src/App.jsx`: Wraps the app with `BrowserRouter`, `AuthProvider`, and a configured React Query client.
- `src/routes/index.jsx` + `routeConfig.js`: Define public pages (home, about, contact, activities, news, etc.) and protected dashboard routes for `PRESIDENT` and `DIRECTEUR` roles.
- `src/components/layout/`: Contains landing page sections like `HeroSection`, `About`, `Contact`, along with shared layout components.
  - **HeroSection**: Animated slider (`react-slick`) with CTA buttons linking to contact and about pages, plus social sidebar icons.
  - **About**: Highlights association vision, mission, and objectives with CTA to `/about` page.
  - **Contact**: Material UI form capturing inquiries, displays contact details, map iframe, and social links.
- `src/pages/`: Implements full pages, including `HomePage` (composing layout sections), `AboutUsPage` (detailed description, branches, contact form, map), `NewsPage`, dashboards, and profile management.
- `src/api/`: Axios wrappers for backend endpoints (e.g., profile, groups, notifications, news) ensuring consistent authentication headers.
- `src/pages/dashboard/`: Rich RTL dashboard with modules for children, groups, educators, news, events, notifications, and a feature-complete profile page.

## Styling & Assets
- Tailwind CSS configured in `src/tailwind.config.js` with RTL support.
- Custom CSS modules (`Hero.css`, `About.css`, `Contact.css`) provide unique branding flourishes, animations, and responsive layout behavior.
- Public assets (images, icons, fonts) located under `client/public` and `client/src/assets` for hero backgrounds, pattern overlays, etc.

## Backend Highlights
- Express app in `server/app.js` wires middleware, routes, and real-time notification hub.
- Authentication handled via `auth.controller.js` and `middlewares/auth.js`, supporting headers and query tokens (for SSE).
- Profile management: `server/controllers/me.controller.js`, service (`me.service.js`), and repo coordinate fetching/updating user info, avatar uploads, password changes, and recent sessions.
- Groups, children, news modules each have controllers, services, repos, and validation schemas in `server/services/`, `server/repos/`, `server/validations/`.
- Notifications system: SSE hub in `server/realtime/index.js`, mapper utilities, broadcast and user services controlling persistence and live updates.
- Database models and migrations reside in `server/models/` and `server/migrations/` respectively.

## Data Flow Overview
1. **Public Site**: Visitors land on `HomePage`, navigating to `AboutUsPage` for association history and values, or `Contact` form for inquiries.
2. **Authentication**: Login page authenticates via backend, storing JWT in `localStorage` for Axios interceptors.
3. **Dashboard**: Authorized roles access `/dashboard/...` routes, leveraging React Query hooks tied to API wrappers for CRUD operations.
4. **Real-time Notifications**: EventSource connection consumes `/api/notifications/stream`, updating local caches and showing toasts/badges.

## Development Tips
- Run client with `npm run dev` from `client/`; server likely via `npm start` or similar in `server/` (check package scripts).
- Ensure `.env` provides backend base URL, JWT secrets, database credentials.
- When adding features, update both repo/service layers and front-end API hooks to keep schema contracts aligned.

