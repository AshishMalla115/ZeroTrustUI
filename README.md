# Zero Trust Engine - Attack Demo UI

A React/TypeScript frontend that visualizes 6 Zero Trust attack scenarios as interactive demonstrations. Connects to the FastAPI backend at `http://127.0.0.1:8000`.

## Features

- **6 Interactive Attack Scenarios** - Each with dedicated page showing attack, response, risk scores, and decision flow
- **Real-time WebSocket Integration** - Live risk score updates from admin WebSocket
- **Token Sharing** - Scenario 1 login token automatically available for Scenarios 3 & 4
- **Admin Dashboard** - Sessions, Users, Audit Log, and Override management
- **Risk Visualization** - Circular gauges, timeline charts, decision badges
- **Request/Response Inspection** - Syntax-highlighted JSON with copy functionality

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State**: React Query (TanStack Query) + Zustand
- **Real-time**: Native WebSocket API
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Syntax Highlighting**: react-syntax-highlighter

## Prerequisites

- Node.js 18+
- Backend running at `http://127.0.0.1:8000` (see backend README)

## Quick Start

```bash
# 1. Navigate to project directory
cd /home/ashis/ZeroTrustUI

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Start development server
npm run dev
```

The UI will be available at `http://localhost:5173`

## Backend Setup (Required)

Before starting the UI, ensure the backend is running:

```bash
cd /home/ashis/ZeroTrustBackend
python -m uvicorn app.main:app --reload --port 8000
```

Verify backend is accessible:
```bash
curl http://127.0.0.1:8000/health
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@zerotrust.com","password":"password123"}'
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Regular User | test@zerotrust.com | password123 |
| Admin | admin@zerotrust.com | admin123 |

## Scenario Overview

### Scenario 1: Normal Login
- Pre-filled login form with test credentials
- Shows risk score gauge, decision badge, JWT token preview
- "Save Token" button stores token for Scenarios 3 & 4

### Scenario 2: Failed Authentication (Brute Force)
- Runs 3 consecutive failed login attempts automatically
- Shows each attempt's request/response
- Visualizes Redis failed-attempt counter concept
- Explains lockout threshold (5 attempts = 429)

### Scenario 3: Middleware Scoring (Continuous Verification)
- Uses token from Scenario 1
- Three endpoint buttons: `/protected`, `/admin/sessions`, `/health`
- Live risk score timeline (Recharts)
- Real-time WebSocket updates (if admin connected)
- Shows RBAC: `/admin/sessions` returns 403 for non-admin

### Scenario 4: Token Blacklist (Session Revocation)
- Uses token from Scenario 1
- Two-step flow: Logout → Try Reuse Token
- Shows 401 rejection after blacklist
- Explains JWT blacklist in Redis with JTI claims

### Scenario 5: Admin Flow (Privileged Visibility & Override)
- Admin login with separate credentials
- 4-tab dashboard:
  - **Sessions**: Table with risk scores, decisions, override action
  - **Users**: Table with deactivate, force MFA, reset MFA actions
  - **Audit Log**: Filterable audit trail
  - **Override**: Session dropdown with threshold configuration
- WebSocket connection for live risk updates

### Scenario 6: Input Validation (Schema-Level Rejection)
- Three test cases: short password, invalid email, empty password
- Each shows payload, 422 response, validation error details
- Explains Pydantic validation at schema layer

## Project Structure

```
zero-trust-ui/
├── src/
│   ├── api/              # API clients (axios + WebSocket)
│   ├── components/
│   │   ├── common/       # Reusable UI components
│   │   ├── layout/       # Header, Sidebar, Layout
│   │   └── scenarios/    # Scenario-specific components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── App.tsx           # App with routing
│   └── main.tsx          # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── .env.example
```

## Available Scripts

```bash
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://127.0.0.1:8000` | Backend API base URL |
| `VITE_WS_URL` | `ws://127.0.0.1:8000` | WebSocket base URL |

## Key Features Explained

### Token Sharing
- Scenario 1 login stores JWT in Zustand authStore
- Scenarios 3 & 4 automatically read from authStore
- "Use Token from Scenario 1" button auto-fills token input

### WebSocket Integration
- Connects on admin login (Scenario 5)
- Receives `risk_update` and `alert` messages
- Updates risk timeline in Scenario 3 live
- Shows toast notifications for new alerts

### Risk Scoring
- Scores range 0.0-1.0
- Thresholds: MFA ≥ 0.4, Block ≥ 0.75 (configurable)
- Decisions: allow, restrict, mfa, block, logged_out
- Visual: Green → Yellow → Orange → Red

### CORS Configuration
Backend must allow `http://localhost:5173`. Check `main.py` in backend:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Troubleshooting

### "Backend unavailable" banner
- Ensure backend is running on port 8000
- Check CORS configuration in backend
- Verify `VITE_API_URL` in `.env`

### WebSocket not connecting
- Must be logged in as admin (Scenario 5)
- Check `VITE_WS_URL` in `.env`
- Verify backend WebSocket endpoint at `/ws/admin`

### Token not working in Scenarios 3/4
- Complete Scenario 1 login first
- Click "Save Token for Scenarios 3&4" button
- Or use "Use Token from Scenario 1" button in Scenarios 3/4

## Build for Production

```bash
npm run build
# Output in dist/ directory
```

## License

MIT