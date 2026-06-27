# FOS Visit Tracker

A complete, production-ready **Field Officer / Salesman Visit Tracking System** built with React, Node.js, Express, and PostgreSQL.

## Features

### For Salesmen
- **Dashboard** - View monthly targets, visits done, achievement percentage, weekly stats, and streak
- **Log Visit** - Record dealer visits with GPS location, photo upload, purpose, remarks, and outcome
- **My Visits** - View, filter, and manage your visit history
- **My Targets** - Track performance against assigned targets with visual charts
- **Dealers** - View assigned dealers with visit frequency alerts

### For Branch Managers (BM)
- **BM Dashboard** - Team overview with performance metrics
- **Set Targets** - Assign monthly visit targets to salesmen (individual or bulk)
- **Manage Salesmen** - Add, edit, activate/deactivate salesmen
- **Manage Dealers** - Add, edit, assign dealers to salesmen
- **Log Own Visit** - Record BM visits to dealers
- **Reports** - Comprehensive reporting suite

### For Admin
- **Admin Panel** - System-wide management
- **Manage BMs** - Add and manage branch managers
- **Full Reports Access** - All reports across all regions

### Reports Available
1. **Dealer Visit Report** - Detailed visit history per dealer
2. **Salesman Performance** - Target vs achievement trends
3. **Monthly Summary** - Team-wide monthly overview
4. **Dealer Coverage** - Visit frequency analysis
5. **Purpose Analysis** - Visit purpose breakdown with pie charts
6. **BM vs Salesman Comparison** - Side-by-side visit comparison

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Charts | Recharts |
| Icons | Heroicons |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Quick Start

### 1. Clone and Install

```bash
# Extract the ZIP
cd fos-visit-tracker

# Install all dependencies (root + server + client)
npm run install:all
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp server/.env.example server/.env

# Edit server/.env with your PostgreSQL credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/fos_tracker"
```

### 3. Setup Database

```bash
# Generate Prisma client
cd server && npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed demo data
npx prisma db seed
```

### 4. Start the Application

```bash
# From the root directory
npm run dev

# Or use the start script
./start.sh
```

This starts:
- **Backend API** at http://localhost:5000
- **Frontend App** at http://localhost:3000

### 5. Login with Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | Admin@1234 |
| BM | bm1@company.com | BM@1234 |
| BM | bm2@company.com | BM@1234 |
| Salesman | salesman1@company.com | Sales@1234 |
| Salesman | salesman2-10@company.com | Sales@1234 |

## Project Structure

```
fos-visit-tracker/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── common/          # Loader, Modal, SearchableDropdown
│   │   │   ├── Dashboard/       # StatCard, ProgressBar, RecentVisits
│   │   │   ├── Layout/          # Sidebar, Navbar, PrivateRoute
│   │   ├── pages/               # Page components
│   │   ├── context/             # AuthContext
│   │   ├── services/            # API services (axios)
│   │   ├── utils/               # Date helpers, formatters
│   │   ├── App.jsx              # Main app with routes
│   │   └── main.tsx             # Entry point
│   └── index.html
├── server/                      # Express Backend
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.js              # Demo data
│   ├── src/
│   │   ├── controllers/         # Business logic
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Auth, upload
│   │   └── utils/               # Token, email helpers
│   ├── server.js                # Entry point
│   └── .env.example
├── start.sh                     # One-command starter
└── README.md
```

## API Endpoints

All API endpoints are prefixed with `/api/v1`:

### Authentication
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Visits
- `POST /api/v1/visits` - Create visit
- `GET /api/v1/visits` - List visits (with filters)
- `GET /api/v1/visits/dashboard-stats` - Dashboard statistics
- `GET /api/v1/visits/:id` - Get visit details
- `PATCH /api/v1/visits/:id` - Update visit
- `DELETE /api/v1/visits/:id` - Delete visit

### Dealers
- `GET /api/v1/dealers` - List dealers
- `POST /api/v1/dealers` - Create dealer
- `GET /api/v1/dealers/:id` - Get dealer details
- `PATCH /api/v1/dealers/:id` - Update dealer
- `POST /api/v1/dealers/assign` - Assign to salesman

### Targets
- `GET /api/v1/targets/my` - Get my targets
- `GET /api/v1/targets/team` - Get team targets (BM)
- `POST /api/v1/targets` - Set target
- `POST /api/v1/targets/bulk` - Set bulk targets

### Salesmen
- `GET /api/v1/salesmen` - List salesmen
- `POST /api/v1/salesmen` - Create salesman
- `PATCH /api/v1/salesmen/:id` - Update salesman
- `PATCH /api/v1/salesmen/:id/toggle-active` - Toggle active status

### Reports
- `GET /api/v1/reports/dealer-visits` - Dealer visit report
- `GET /api/v1/reports/salesman-performance` - Performance report
- `GET /api/v1/reports/monthly-summary` - Monthly summary
- `GET /api/v1/reports/dealer-coverage` - Coverage report
- `GET /api/v1/reports/purpose-analysis` - Purpose analysis
- `GET /api/v1/reports/bm-vs-salesman` - BM vs Salesman comparison

### Notifications
- `GET /api/v1/notifications` - List notifications
- `PATCH /api/v1/notifications/:id/read` - Mark as read
- `PATCH /api/v1/notifications/read-all` - Mark all as read

## Database Schema

### Users Table
- `id` (UUID, PK)
- `name`, `email`, `password`, `phone`
- `role` (ADMIN, BM, SALESMAN)
- `bmId` (self-referential for salesmen)
- `region`, `isActive`

### Dealers Table
- `id` (UUID, PK)
- `name`, `shopName`, `phone`, `address`, `city`, `region`
- `dealerCode` (unique), `category` (PLATINUM, GOLD, SILVER, GENERAL)
- `isActive`

### Visits Table
- `id` (UUID, PK)
- `visitorId`, `visitorRole`, `dealerId`
- `visitDate`, `visitTime`
- `checkInLat`, `checkInLng`, `photoUrl`
- `remarks`, `purpose`, `status`, `outcome`, `nextAction`
- `month`, `year` (computed)

### VisitTargets Table
- `id` (UUID, PK)
- `salesmanId`, `setByBmId`
- `targetMonth`, `targetYear`, `targetCount`

### DealerAssignments Table
- `id` (UUID, PK)
- `dealerId`, `salesmanId`, `assignedBy`, `isPrimary`

### Notifications Table
- `id` (UUID, PK)
- `userId`, `title`, `message`, `type`, `isRead`

## Deployment

### Backend (Render/Heroku)
1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables in Render dashboard
4. Add build command: `cd server && npm install && npx prisma migrate deploy`
5. Start command: `cd server && npm start`

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Import project in Vercel
3. Set framework preset to Vite
4. Set root directory to `client`
5. Build command: `cd .. && npm run build`
6. Output directory: `dist`

## Environment Variables

See `server/.env.example` for all required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT token signing |
| `PORT` | Server port (default: 5000) |
| `CLIENT_URL` | Frontend URL for CORS |
| `CLOUDINARY_*` | Cloudinary config for photo uploads |
| `SMTP_*` | Email configuration (optional) |
| `ENABLE_EMAILS` | Toggle email notifications |
| `REQUIRE_PHOTO_ON_VISIT` | Require photos |
| `REQUIRE_GPS_ON_VISIT` | Require GPS |

## License

MIT License