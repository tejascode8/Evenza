# Evenza — Full-Stack Event Booking & Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=flat&logo=three.js&logoColor=white)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.x-88CE02?style=flat&logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38b2ac?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_/_Local-47a248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Evenza is an enterprise-grade, full-stack event discovery, live reservation, and digital ticketing platform built on the MERN stack with Three.js 3D WebGL visuals, GSAP micro-animations, and a zero-latency real-time synchronization engine. It features dual-role authentication (User & Admin), 2-Factor Email OTP verification for anti-scalping, dynamic 3D holographic ticket pass preview, real-time ticket inventory concurrency controls, an Admin Command Center, transactional pass delivery via Brevo, and responsive glassmorphic interfaces.

---

## ✨ Features

* ⚡ **Real-Time Live Synchronization Engine (Zero Latency)**:
  * Native Server-Sent Events (SSE) stream (`/api/realtime/stream`) connecting admins and attendees in real time.
  * Instant Admin Booking Influx: new booking requests slide in automatically without page refresh, recalculating gross revenue and seat metrics on the fly.
  * Instant Attendee Pass Activation: when an admin confirms a reservation, the user's dashboard pass instantly flips from "Pending" to "Confirmed" with digital QR pass generation.
  * Live Inventory & Capacity Sync: remaining seats, occupancy meters, and "Sold Out" badges update in real time across the hero pass, catalog grid, and event detail pages.
* 🌌 **3D WebGL Canvas & Holographic Pass**:
  * Interactive Three.js particle constellation (850 multi-colored particles) + rotating wireframe torus rings with damped mouse parallax camera tracking.
  * Ultra-premium 3D Holographic Ticket Pass with cursor tilt physics (`perspective(1100px)`), dynamic holographic glare sheen, and carousel switcher.
* 🔐 **Authentication & 2FA Security**:
  * JWT (JSON Web Token) authentication with `bcryptjs` password hashing.
  * Mandatory 6-digit Email OTP for account activation and secure event reservation authorization.
* 🎫 **Intelligent Booking & Anti-Scalping Engine**:
  * Real-time seat inventory validation preventing concurrency double-booking.
  * Support for both Free and Paid ticket tiers.
  * Digital QR boarding pass generation for verified attendees.
* 📊 **Admin Command Center**:
  * Full CRUD control over event listings (title, slug, date, category, pricing, capacity, cover images).
  * Booking verification pipeline: confirm (Mark Paid / Not Paid) or reject requests.
  * Real-time metrics: Gross Revenue, Confirmed Attendees, Pending Approvals, and Seat Occupancy rates.
  * One-click CSV Attendee Guestlist export.
* 📧 **Automated Transactional Emails**:
  * Powered by the Brevo (Sendinblue) REST API v3.
  * Dispatches official digital pass confirmations and 2FA verification OTPs.
* 🎨 **Interactive UI/UX & Typography Hygiene**:
  * Strict vector SVG icons from `react-icons/fa` aligned with typography baselines (zero emojis).
  * Multi-criteria catalog filtering (Category pills with count badges, Debounced Search, Price toggle, Sort dropdown).
  * Responsive mobile menu, custom dropdowns, confirmation modals, toast alerts, and skeleton loaders.

---

## 🏗️ Repository Architecture

```text
Evenza/
├── backend/                  # Express.js REST API, Database Models & Real-Time Engine
│   ├── controllers/          # authController, bookingController, eventController
│   ├── middleware/           # auth JWT verification & admin authorization
│   ├── models/               # User, Event, Booking, OTP schemas
│   ├── routes/               # /api/auth, /api/events, /api/bookings, /api/realtime
│   ├── utils/                # Brevo email dispatch service & Realtime SSE Hub
│   ├── seed.js               # Comprehensive 25-user & realistic event database seeder
│   ├── seedAdmin.js          # Standalone Admin account provisioner
│   └── server.js             # API entrypoint, SSE streaming & SPA static asset server
├── frontend/                 # Vite + React 18 Single Page Application
│   ├── src/
│   │   ├── components/       # HeroSection, HeroThreeCanvas, Navbar, ConfirmModal, CustomDropdown, Toast, Skeletons
│   │   ├── context/          # AuthContext (session) & RealtimeContext (live SSE event stream)
│   │   ├── pages/            # Home, EventDetail, UserDashboard, AdminDashboard, Auth, Payments
│   │   └── utils/            # Axios API client with token interceptor
│   ├── index.html            # Application entry HTML
│   └── tailwind.config.js    # Design system tokens and custom keyframe animations
├── Evenza_API_Test/          # Pre-configured Postman API Collection
├── Documents/                # System Architecture diagrams & flowcharts
├── SETUP_GUIDE.md            # In-depth MongoDB Atlas & Brevo configuration manual
└── package.json              # Monorepo root orchestration scripts
```

---

## 🚀 Quick Start

### 1. Prerequisites

* [Node.js](https://nodejs.org/) (v18.0.0 or higher)
* [MongoDB](https://www.mongodb.com/) (Local instance or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
* *(Optional)* Free [Brevo API Key](https://www.brevo.com/) for email delivery (in development, OTP codes are also logged to the server console).

---

### 2. Environment Configuration

Copy the example environment files and configure your keys:

```bash
# In backend/.env
MONGO_URI=mongodb://localhost:27017/evenza
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=notifications@evenza.com
BREVO_SENDER_NAME=Evenza
```

```bash
# In frontend/.env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Installation & Database Seeding

From the project root:

```bash
# 1. Install dependencies across root, backend, and frontend
npm run setup

# 2. Seed database with realistic demo events and attendees
npm run seed

# 3. (Optional) Create or reset the default Admin account
npm run seed:admin
```

> **Default Seed Credentials**:
> * **Admin Account**: `admin@evenza.com` / `Admin@12345`
> * **Demo User Account**: `demo@evenza.com` / `@demo$123`

---

### 4. Running Locally

#### Option A: Single Terminal (Recommended)
```bash
npm run dev
```
*Concurrently launches the Express API (`http://localhost:5000`) and the Vite React App (`http://localhost:5173`).*

#### Option B: Separate Terminals
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/realtime/stream` | Public | Live Server-Sent Events (SSE) real-time data stream |
| `GET` | `/api/realtime/status` | Public | Real-time engine health & active connection metrics |
| `POST` | `/api/auth/register` | Public | Register new user & trigger 2FA OTP |
| `POST` | `/api/auth/verify-otp` | Public | Verify OTP and activate account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `POST` | `/api/auth/register-admin` | Public | Register/update administrator account |
| `GET` | `/api/events` | Public | List events (supports `?search=` and `?category=`) |
| `GET` | `/api/events/:slugOrId` | Public | Fetch single event details by slug or ObjectId |
| `POST` | `/api/events` | Admin | Create a new event & broadcast `EVENT_CREATED` |
| `PUT` | `/api/events/:id` | Admin | Update existing event & broadcast `EVENT_UPDATED` |
| `DELETE` | `/api/events/:id` | Admin | Delete event listing & broadcast `EVENT_DELETED` |
| `POST` | `/api/bookings/send-otp` | User | Dispatch 2FA booking authorization OTP |
| `POST` | `/api/bookings` | User | Verify OTP, submit reservation & broadcast `BOOKING_CREATED` |
| `GET` | `/api/bookings/my` | Authenticated | Retrieve user bookings (or all for Admin) |
| `PUT` | `/api/bookings/:id/confirm`| Admin | Confirm booking, deduct seat & broadcast `BOOKING_CONFIRMED` |
| `DELETE` | `/api/bookings/:id` | Authenticated | Cancel booking, restore seat & broadcast `BOOKING_CANCELLED` |

---

## 📦 Production Deployment

The backend Express application is pre-configured to statically serve the compiled React SPA from `frontend/dist` with client-side routing fallback:

```bash
# 1. Build the frontend production bundle
npm run build

# 2. Start the production server
npm run start:backend
```

Configure your cloud platform (e.g. Render, Railway, Vercel, AWS EC2) with the environment variables specified above and set `NODE_ENV=production`.

---

## 📄 License

This project is licensed under the MIT License.
