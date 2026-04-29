# Fintech OS

A full-stack fintech platform built with a React frontend, Go backend REST API, and gRPC streaming server. Designed for real-time payments, KYC verification, double-entry ledger accounting, and multi-currency account management.

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│           React + TypeScript + Vite + Tailwind          │
│              Deployed on Vercel (SPA)                   │
└──────────┬──────────────────────┬───────────────────────┘
           │ REST API             │ gRPC-Web
           ▼                     ▼
┌─────────────────────┐  ┌──────────────────────┐
│   Go Backend API    │  │  gRPC Streaming      │
│   (net/http + GORM) │  │  Server (Go)         │
│   Vercel Functions  │  │  Railway / Docker    │
└─────────┬───────────┘  └──────────┬───────────┘
          │                         │
          ▼                         ▼
┌─────────────────────────────────────────────────┐
│              Neon PostgreSQL (Serverless)        │
│    UUID-OSSP · pgcrypto · Connection Pooling    │
└─────────────────────────────────────────────────┘
```

### Frontend (`/src`)

- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS + Framer Motion animations
- **Routing**: React Router v7
- **State**: Context API (Auth, Health, Theme)
- **Deployment**: Vercel (SPA with client-side routing)

**Pages & Features:**

| Route | Description |
|---|---|
| `/` | Landing page |
| `/status` | System health & service status (protected) |
| `/ledger` | Double-entry ledger testing (protected) |
| `/kyc` | KYC verification flow (protected) |
| `/kyc/dashboard` | KYC management dashboard (protected) |
| `/payments` | Real-time payments (protected) |
| `/developers` | Developer documentation & API reference |
| `/developers/quickstart` | Quick start guide |
| `/developers/api-explorer` | Interactive API explorer |
| `/grpc-demo` | gRPC streaming demo |

### Backend API (`/backend`)

- **Language**: Go
- **HTTP**: `net/http` standard library
- **ORM**: GORM with PostgreSQL
- **Auth**: JWT-based authentication
- **Deployment**: Vercel Serverless Functions (via `api/index.go`) or Docker

**API Endpoints:**

| Module | Description |
|---|---|
| `auth.go` | Registration, login, JWT token management |
| `users.go` | User profile management |
| `accounts.go` | Multi-currency account CRUD, balance tracking |
| `ledger.go` | Double-entry ledger transactions and entries |
| `kyc.go` | KYC document submission and verification |
| `market.go` | Market data endpoints |
| `health.go` | Health check with database status |
| `grpc_bridge.go` | REST-to-gRPC bridge for streaming |

**Backend Structure:**

```
backend/
├── api/                # Vercel serverless handler + route handlers
├── cmd/                # CLI entry points (server, worker, migrate)
├── internal/
│   ├── config/         # Environment & configuration loading
│   ├── database/       # Neon PostgreSQL connection & migrations
│   ├── grpc/           # gRPC server implementation
│   ├── handlers/       # HTTP request handlers
│   ├── middleware/      # Auth, CORS, rate limiting
│   ├── models/         # GORM models (User, Account, Transaction)
│   ├── repository/     # Data access layer
│   └── services/       # Business logic layer
├── pkg/                # Shared packages (logger, errors, security)
├── proto/              # Protocol Buffer definitions
└── main.go             # Standalone server entry point
```

### gRPC Streaming Server (`/grpc-streaming-server`)

- **Protocol**: gRPC-Web over HTTP for browser compatibility
- **Use Case**: Real-time payment streaming, live market data
- **Runtime**: Node.js demo server

### Database

- **Provider**: [Neon](https://neon.tech/) (serverless PostgreSQL)
- **Extensions**: `uuid-ossp`, `pgcrypto`
- **Connection Pooling**: Neon pooler with SSL/TLS required
- **Schema**: Users, Accounts, Transactions with soft deletes and UUID primary keys

## Getting Started

### Prerequisites

- Node.js 18+
- Go 1.21+
- A [Neon](https://neon.tech/) PostgreSQL database (or any PostgreSQL 12+)

### Frontend Setup

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

### Backend Setup

```bash
cd backend
cp env.example .env
# Edit .env with your database credentials (see env.example)
go mod download
go run main.go
```

The backend runs at `http://localhost:8080`.

### Environment Variables

Copy `backend/env.example` to `backend/.env` and fill in your values. **Never commit `.env` files** -- they are gitignored.

Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT token signing |
| `SERVER_PORT` | Backend server port (default: 8080) |
| `ENVIRONMENT` | `development` or `production` |

## Deployment

### Frontend (Vercel)

The frontend deploys automatically on Vercel. Configuration is in `vercel.json` -- SPA routing is handled via rewrites.

### Backend (Vercel Functions)

The backend can be deployed as Vercel Serverless Functions using `backend/vercel.json`. All routes are handled by `api/index.go`.

### Backend (Docker)

```bash
cd backend
docker build -t fintech-backend .
docker run -p 8080:8080 --env-file .env fintech-backend
```

### gRPC Server (Docker)

```bash
cd backend
docker build -f Dockerfile.grpc -t fintech-grpc .
docker run -p 50051:50051 --env-file .env fintech-grpc
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Go, net/http, GORM |
| Database | PostgreSQL (Neon serverless) |
| Streaming | gRPC / gRPC-Web |
| Auth | JWT |
| Hosting | Vercel (frontend + backend functions) |
| CI/CD | Git-based deployments via Vercel |

## License

MIT
