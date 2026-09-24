# Evenza — Backend REST API

The backend for Evenza is built with **Node.js**, **Express.js**, and **MongoDB / Mongoose**. It provides role-based authentication, 2FA OTP verification, seat-safe booking workflows, and transactional email notifications via Brevo.

---

## 🛠️ Tech Stack & Dependencies

* **Runtime**: Node.js
* **Framework**: Express.js (`4.18.2`)
* **Database**: MongoDB via Mongoose ODM (`8.2.0`)
* **Security & Auth**: `jsonwebtoken` (`9.0.2`), `bcryptjs` (`2.4.3`)
* **Configuration**: `dotenv` (`16.4.5`), `cors` (`2.8.5`)
* **Dev Server**: `nodemon` (`3.1.0`)

---

## 📁 Directory Structure

```text
backend/
├── controllers/
│   ├── authController.js     # User registration, login, OTP verification, admin setup
│   ├── bookingController.js  # Booking requests, OTP authorization, confirmation, cancellation
│   └── eventController.js    # Event CRUD operations and slug resolution
├── middleware/
│   └── auth.js               # JWT verification (protect) & Admin role check (admin)
├── models/
│   ├── User.js               # User accounts (name, email, password, role, isVerified)
│   ├── Event.js              # Event schema with auto-slug generation hook
│   ├── Booking.js            # Ticket reservations with status & paymentStatus
│   └── OTP.js                # 5-minute TTL expiring verification codes
├── routes/
│   ├── auth.js               # /api/auth routes
│   ├── bookings.js           # /api/bookings routes
│   └── events.js             # /api/events routes
├── utils/
│   └── email.js              # Brevo transactional email & OTP service
├── seed.js                   # Realistic database population script
├── seedAdmin.js              # Provision master admin account
├── test_email.js             # Brevo integration testing utility
├── server.js                 # Express server & static asset host
└── package.json
```

---

## ⚙️ Environment Variables

Create a `backend/.env` file:

```env
MONGO_URI=mongodb://localhost:27017/evenza
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=notifications@evenza.com
BREVO_SENDER_NAME=Evenza
```

---

## 🚀 Available Scripts

```bash
# Start backend in development mode with nodemon
npm run dev

# Start backend in production mode
npm start

# Seed database with realistic demo data
npm run seed

# Create or reset master admin account
npm run seed:admin
```
