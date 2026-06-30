# ♻️ TakaLoop — Kenya's Circular Waste Intelligence Platform

> One platform connecting citizens, collectors, businesses, and county government into a full circular economy loop — powered by M-Pesa, AI, and community action.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment

```bash
# Server
cd server
cp .env.example .env
# Edit .env with your MongoDB URI, M-Pesa keys, Anthropic API key, etc.

# Client
cd client
cp .env.example .env
# Edit VITE_API_URL if backend runs on different port
```

### 3. Seed Demo Data

```bash
cd server
node seed.js
```

### 4. Run Development Servers

```bash
# Terminal 1 - Backend (port 5000)
cd server && npm run dev

# Terminal 2 - Frontend (port 3000 or 5173)
cd client && npm run dev
```

### 5. Open in Browser
Visit: `http://localhost:5173`

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@takaloop.ke | Admin@2024! |
| Citizen | citizen@demo.com | Admin@2024! |
| Collector | collector@demo.com | Admin@2024! |
| Business | business@demo.com | Admin@2024! |
| Officer | officer@demo.com | Admin@2024! |

---

## 🏗️ System Architecture

```
takaloop/
├── client/              # React + Vite + Tailwind frontend
│   └── src/
│       ├── pages/       # All page components
│       │   ├── citizen/ # Citizen dashboard, points, reports
│       │   ├── business/# Business dashboard, listings, audit
│       │   ├── officer/ # Officer dashboard
│       │   ├── admin/   # Admin panel
│       │   ├── Landing.jsx
│       │   ├── Marketplace.jsx
│       │   └── ImpactDashboard.jsx
│       ├── components/  # Shared UI & layout components
│       ├── context/     # Auth context (JWT)
│       └── lib/         # API utility (Axios)
│
└── server/              # Node.js + Express + MongoDB backend
    ├── models/          # Mongoose models
    ├── routes/          # Express routes
    ├── controllers/     # Route handlers
    ├── middleware/       # Auth (JWT)
    ├── utils/           # M-Pesa, SMS, carbon calculator
    └── seed.js          # Demo data seeder
```

---

## 📦 Modules

| Module | Description |
|--------|-------------|
| **TakaPoints** | Citizens earn points for depositing waste at collection points. Redeem via M-Pesa. |
| **TrashChain** | Waste materials marketplace with M-Pesa escrow payment protection. |
| **ReLoop** | B2B circular economy — businesses trade waste byproducts as raw materials. |
| **WasteIQ** | AI-powered waste audit via Claude API. Identifies recovery opportunities & carbon potential. |
| **DumpAlert** | Geo-tagged illegal dump reporting. County officers manage cleanup workflow. |
| **Impact Dashboard** | Live public metrics — waste diverted, CO₂ offset, money circulated. |
| **Admin Panel** | User management, market pricing, dispute resolution, platform oversight. |

---

## 🔌 API Endpoints

```
POST /api/auth/register         Register new user
POST /api/auth/login            Login
GET  /api/auth/me               Get current user

GET  /api/listings              Browse marketplace
POST /api/listings              Create listing (collector/business)
GET  /api/listings/my           My listings

POST /api/transactions          Initiate M-Pesa purchase
POST /api/transactions/mpesa-callback  M-Pesa webhook
PUT  /api/transactions/:id/confirm    Confirm delivery (releases escrow)

POST /api/points/deposit        Record waste deposit (officer)
POST /api/points/redeem         Redeem points for airtime/cash
GET  /api/points/my             My points & history
GET  /api/points/leaderboard    Top recyclers

GET  /api/reports               Get dump reports
POST /api/reports               Submit dump report
PUT  /api/reports/:id/status    Update report status (officer)

POST /api/audit                 Start WasteIQ AI audit
GET  /api/audit/my              My audit reports

GET  /api/collection-points     List collection points
POST /api/collection-points     Create collection point (admin)

GET  /api/impact                Public impact statistics
GET  /api/pricing               Current market prices
POST /api/pricing               Set market price (admin)

GET  /api/admin/dashboard       Admin overview stats
GET  /api/admin/users           List/search users
PUT  /api/admin/users/:id/verify   Verify user
```

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy dist/ to Vercel
```

### Backend → Railway
```bash
# Push server/ to Railway
# Set environment variables in Railway dashboard
```

### Database → MongoDB Atlas (Free Tier)
- Create cluster at mongodb.com/atlas
- Add connection string to server `.env`

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Charts | Recharts |
| Maps | Leaflet.js + React Leaflet |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Payments | M-Pesa Daraja API (STK Push + Escrow) |
| AI | Claude API (Anthropic) via WasteIQ |
| SMS | Africa's Talking |
| QR Codes | qrcode npm package |
| Images | Cloudinary |
| Security | Helmet, express-rate-limit |

---

## 🔧 Environment Variables

### Server `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://yourdomain.com/api/transactions/mpesa-callback
MPESA_ENV=sandbox

ANTHROPIC_API_KEY=sk-ant-...

AT_API_KEY=your_at_key
AT_USERNAME=sandbox
```

### Client `.env`
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing M-Pesa

Use Safaricom Daraja sandbox:
- Test phone: `254708374149`
- Shortcode: `174379`
- Register at: https://developer.safaricom.co.ke

---

## 📊 Carbon Calculation

| Waste Type | CO₂ Factor (kg CO₂/kg waste) |
|-----------|------------------------------|
| Plastics | 1.5 |
| Metals | 2.1 |
| Paper | 0.8 |
| E-Waste | 3.2 |
| Organics | 0.5 |
| Hazardous | 4.0 |
| Glass | 0.6 |

---

Built with 💚 for Kenya's circular economy.
# TakaLoop
