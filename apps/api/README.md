# Dashboard Energy API

Backend API for the Dashboard Energy monitoring system built with **Express.js**, **Drizzle ORM**, and **MySQL**.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Drizzle ORM
- **Database**: MySQL (XAMPP)
- **Auth**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Language**: TypeScript

## Prerequisites

- Node.js 18+
- MySQL server lokal (via XAMPP, apt, atau container `dashboard-mysql` di docker-compose.yml root repo)

## Quick Start

### 1. Install dependencies

```bash
cd apps/api
npm install
```

### 2. Set up environment variables

Copy the example env file:
```bash
cp .env.example .env
```

Edit `.env` and update your database connection:
```
DATABASE_URL=mysql://root:@localhost:3306/dashboard_energy
```

### 3. Create the database

```sql
CREATE DATABASE dashboard_energy;
```

If you are using the remote server above, make sure the MySQL service is reachable from the backend host before running migrations.

### 4. Push schema to database

```bash
npm run db:push
```

### 5. Seed the database with test data

```bash
npm run db:seed
```

### 6. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/logout` | Logout (invalidate token) |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user profile |

### Buildings & Zones

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campuses` | List all campuses |
| GET | `/api/campuses/:id` | Get campus details |
| GET | `/api/campuses/:id/zones` | Get zones in campus |
| GET | `/api/zones/:id` | Get zone details |
| GET | `/api/zones/:id/buildings` | Get buildings in zone |
| GET | `/api/buildings` | List all buildings |
| GET | `/api/buildings/:id` | Get building details |
| PUT | `/api/buildings/:id` | Update building |

### Panels

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/panels` | List all panels |
| GET | `/api/buildings/:id/panels` | Get panels in building |
| GET | `/api/panels/:id` | Get panel with latest reading |
| PUT | `/api/panels/:id` | Update panel |
| POST | `/api/panels/:id/maintenance` | Toggle maintenance mode |
| GET | `/api/panels/:id/readings` | Get historical readings |
| GET | `/api/panels/:id/events` | Get event log |
| GET | `/api/panels/:id/thresholds` | Get alert thresholds |
| POST | `/api/panels/:id/thresholds` | Set alert threshold |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | List alerts (filterable) |
| GET | `/api/alerts/active` | Get active alerts |
| GET | `/api/alerts/counts` | Get alert counts by severity |
| GET | `/api/alerts/:id` | Get alert details |
| POST | `/api/alerts/:id/acknowledge` | Acknowledge alert |
| POST | `/api/alerts/:id/resolve` | Resolve alert |

### Readings & Grid Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/readings` | Submit panel reading |
| POST | `/api/readings/bulk` | Submit bulk readings |
| GET | `/api/grid/live` | Get live grid metrics |
| GET | `/api/grid/ticker` | Get ticker feed data |
| GET | `/api/grid/power-distribution` | Get 24h power distribution |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/consumption` | Get consumption data |
| GET | `/api/analytics/kpis` | Get KPI summary |
| GET | `/api/analytics/department-breakdown` | Get usage by department |
| GET | `/api/analytics/hourly-trend` | Get hourly consumption trend |
| GET | `/api/analytics/power-factor-trend` | Get power factor trend |

## Test Credentials

After seeding:
- **Email**: `admin@gridmonitor.iot`
- **Password**: `password`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema to database (dev) |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed database with test data |

## Project Structure

```
src/
├── config/
│   ├── database.ts     # Drizzle DB connection
│   └── env.ts          # Environment config with validation
├── db/
│   ├── schema/         # Drizzle table definitions
│   ├── migrations/     # SQL migrations
│   └── seed.ts         # Database seeding script
├── middleware/
│   ├── auth.ts         # JWT authentication
│   ├── errorHandler.ts # Error handling
│   └── validate.ts     # Zod validation
├── services/
│   ├── authService.ts
│   ├── buildingService.ts
│   ├── panelService.ts
│   ├── alertService.ts
│   ├── readingService.ts
│   └── analyticsService.ts
├── routes/
│   ├── auth.routes.ts
│   ├── buildings.routes.ts
│   ├── panels.routes.ts
│   ├── alerts.routes.ts
│   ├── readings.routes.ts
│   └── analytics.routes.ts
└── index.ts            # Express app entry point
```

## License

MIT
