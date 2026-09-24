# Evenza — Frontend Client Application

The frontend for Evenza is built with **React 18**, **Vite**, and **Tailwind CSS**. It delivers a responsive Single Page Application (SPA) with role-guarded routes, interactive search and filtering, digital QR boarding pass modals, and an Admin dashboard.

---

## 🛠️ Tech Stack & Dependencies

* **Framework**: React 18 (`18.2.0`) & React DOM
* **Routing**: React Router DOM (`6.22.3`)
* **Icons**: React Icons (`5.0.1`)
* **HTTP Client**: Axios (`1.6.7`)
* **Build Tool**: Vite (`5.1.4`) & `@vitejs/plugin-react` (`4.2.1`)
* **CSS / Styling**: Tailwind CSS (`3.4.1`), PostCSS (`8.4.35`), Autoprefixer (`10.4.18`)

---

## 📁 Directory Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx             # Responsive glassmorphism header with active states
│   │   ├── ProtectedRoute.jsx     # Role-based route guard (/admin & /dashboard)
│   │   ├── CustomDropdown.jsx     # Accessible custom dropdown component
│   │   ├── ConfirmModal.jsx       # Reusable styled modal for confirmations
│   │   ├── Toast.jsx              # Floating auto-dismiss notifications
│   │   ├── LoadingScreen.jsx      # Animated brand loading screen
│   │   ├── DashboardSkeleton.jsx  # Skeleton placeholder for dashboard
│   │   ├── EventCardSkeleton.jsx  # Skeleton placeholder for event listings
│   │   └── EventDetailSkeleton.jsx# Skeleton placeholder for event details
│   ├── context/
│   │   └── AuthContext.jsx        # Authentication state, login, register, 2FA OTP, logout
│   ├── pages/
│   │   ├── Home.jsx               # Discovery feed, filters, search, and pagination
│   │   ├── EventDetail.jsx        # Detailed event view with 2FA booking flow
│   │   ├── UserDashboard.jsx      # Attendee tickets, digital QR passes, and cancellation
│   │   ├── AdminDashboard.jsx     # Analytics, event CRUD, guestlist CSV export, booking approvals
│   │   ├── Login.jsx              # User & admin sign-in with quick-fill support
│   │   ├── Register.jsx           # User registration with password strength meter & OTP
│   │   ├── PaymentSuccess.jsx     # Booking confirmed acknowledgement screen
│   │   └── PaymentFailed.jsx      # Booking failed retry screen
│   ├── utils/
│   │   └── axios.js               # Central Axios client with bearer token interceptor
│   ├── App.jsx                    # Root route hierarchy
│   ├── index.css                  # Tailwind directives and custom animation classes
│   └── main.jsx                   # Entry point mounting AuthProvider
├── index.html                     # HTML5 template with custom ticket favicon
├── tailwind.config.js             # Color palette, display typography, and keyframes
└── vite.config.js                 # Vite plugins and server configuration
```

---

## ⚙️ Environment Variables

Create `frontend/.env`:

```env
# Backend API base URL (defaults to http://localhost:5000/api in development)
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Available Scripts

```bash
# Start Vite development server (HMR enabled)
npm run dev

# Compile production bundle to dist/
npm run build

# Preview production build locally
npm run preview
```
