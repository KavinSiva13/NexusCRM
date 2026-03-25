# NexusCRM — Modern Customer Relationship Management

A full-featured MERN stack CRM application with a sleek SaaS dashboard UI.

## Tech Stack

**Frontend:** React 18 + Vite, Tailwind CSS, React Router v6, Recharts, Axios  
**Backend:** Node.js, Express.js, MongoDB + Mongoose  
**Auth:** JWT + bcrypt  
**DevOps:** Docker + Docker Compose

## Features

- 🔐 **JWT Authentication** — Login/Register with role-based access (Admin/Staff)
- 📊 **Dashboard** — Live stats, charts, activity feed, quick actions
- 👥 **Lead Management** — Full CRUD, status pipeline, filters, search, pagination
- 🏢 **Customer Management** — Convert leads, track revenue, payment status
- ✅ **Task System** — Grouped by today/upcoming/overdue, priority levels
- 📈 **Reports** — Analytics charts, conversion rates, KPIs
- 🕐 **Activity Timeline** — Per-entity history on lead and customer profiles
- 🔍 **Global Search & Filters** — Status, source, assignee, date filters

## Quick Start

### Option 1: Docker (Recommended)

```bash
git clone <repo>
cd crm
docker-compose up -d
```

Then seed demo data:
```bash
docker exec crm_server node seed.js
```

App will be at: http://localhost:3000

### Option 2: Manual Setup

**Prerequisites:** Node.js 18+, MongoDB running locally

**Backend:**
```bash
cd server
npm install
# Copy .env and update MONGO_URI if needed
node seed.js        # Seed demo data
npm run dev         # Starts on port 5000
```

**Frontend:**
```bash
cd client
npm install
npm run dev         # Starts on port 3000
```

## Demo Credentials

| Role  | Email             | Password  |
|-------|-------------------|-----------|
| Admin | admin@demo.com    | admin123  |
| Staff | sarah@demo.com    | staff123  |
| Staff | mike@demo.com     | staff123  |

## Project Structure

```
crm/
├── server/
│   ├── config/         # DB connection
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── seed.js         # Demo data seeder
│   └── server.js       # Entry point
│
├── client/
│   └── src/
│       ├── components/ # Reusable UI (Modal, StatusBadge)
│       ├── context/    # Auth context
│       ├── layouts/    # App shell (sidebar + topbar)
│       ├── pages/      # Dashboard, Leads, Customers, Tasks, Reports
│       └── services/   # Axios API service
│
└── docker-compose.yml
```

## API Endpoints

| Method | Endpoint               | Description          |
|--------|------------------------|----------------------|
| POST   | /api/auth/register     | Register user        |
| POST   | /api/auth/login        | Login                |
| GET    | /api/auth/me           | Current user         |
| GET    | /api/leads             | List leads (filters) |
| POST   | /api/leads             | Create lead          |
| PUT    | /api/leads/:id         | Update lead          |
| DELETE | /api/leads/:id         | Delete lead          |
| GET    | /api/customers         | List customers       |
| POST   | /api/customers         | Create customer      |
| GET    | /api/tasks             | List tasks           |
| POST   | /api/tasks             | Create task          |
| GET    | /api/activities        | Activity log         |
| GET    | /api/dashboard/stats   | Dashboard metrics    |
| GET    | /api/users             | All users (staff)    |
