# Complete Setup & Integration Guide: Evenza

This guide walks you through setting up MongoDB Atlas (Cloud Database), the Brevo Email API (Transactional Notifications), environment secrets, and running end-to-end API tests with Postman.

---

## Step 1: Set Up MongoDB Atlas (Cloud Database)

MongoDB Atlas provides a managed cloud database for storing `Users`, `Events`, `Bookings`, and `OTPs`.

1. **Create an Account**:
   * Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and register for a free account.
2. **Deploy a Free Cluster**:
   * Click **"Create Database"** / **"Build a Database"**.
   * Select the **"M0 (Free Tier)"** option.
   * Choose your preferred cloud provider and region, then click **Create**.
3. **Configure Database Credentials**:
   * Under **Security** in the left sidebar, click **"Database Access"**.
   * Click **"Add New Database User"**.
   * Select **Password Authentication**. Set a Username (e.g. `evenza_admin`) and a secure Password.
   * Assign the role `Read and write to any database`, then click **Add User**.
4. **Set Up Network IP Whitelist**:
   * Under **Security**, click **"Network Access"**.
   * Click **"Add IP Address"** -> **"Allow Access from Anywhere"** (`0.0.0.0/0`) to allow connections from your local development environment and cloud hosting providers.
   * Click **Confirm**.
5. **Obtain Connection URI**:
   * Go to **Database** (under Deployments). Click **"Connect"** on your cluster.
   * Select **Drivers** (Node.js).
   * Copy the connection string provided:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/evenza?retryWrites=true&w=majority
     ```
   * Replace `<username>` and `<password>` with your actual credentials.

---

## Step 2: Set Up Brevo Email API (Transactional 2FA & Passes)

Evenza uses the Brevo (Sendinblue) REST API v3 to dispatch 2FA verification codes and HTML digital boarding passes.

1. Sign up for a free account at [Brevo](https://www.brevo.com/).
2. Verify your sender identity under **Senders & IPs > Senders** (e.g. `yourname@domain.com` or your verified email).
3. Generate a new API Key under **SMTP & API > API Keys**. Copy your key (`xkeysib-...`).

> **Note on Local Development**: If you do not have Brevo configured, the application will still function seamlessly — all generated 2FA OTP codes are automatically logged directly to your server console for instant copying.

---

## Step 3: Configure Environment Variables

Create `backend/.env` from the provided template:

```env
# MongoDB Connection String
MONGO_URI=mongodb+srv://evenza_admin:your_password@cluster0.xxxxx.mongodb.net/evenza?retryWrites=true&w=majority

# JWT Authentication Secret (Any long random string)
JWT_SECRET=evenza_secure_jwt_token_secret_key_2026

# Server Port
PORT=5000

# Brevo Transactional Email Service
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=your_verified_sender_email@domain.com
BREVO_SENDER_NAME=Evenza
```

---

## Step 4: Seed Database & Provision Admin Account

From the project root:

```bash
# Install all workspace dependencies
npm run setup

# Seed 25 realistic users and diverse events with active occupancies
npm run seed

# Create or reset the master Admin credentials
npm run seed:admin
```

**Seed Credentials**:
* **Admin**: `admin@evenza.com` / `Admin@12345`
* **Demo User**: `demo@evenza.com` / `@demo$123`

---

## Step 5: Run Local Development Servers

```bash
# Concurrently runs Express API (port 5000) and Vite React Frontend (port 5173)
npm run dev
```

Open your browser at `http://localhost:5173/`.

---

## Step 6: Test APIs with Postman

A complete Postman collection is included at `Evenza_API_Test/Evenza_Postman_Collection.json`.

1. Open [Postman](https://www.postman.com/downloads/).
2. Click **Import** (top left).
3. Select `Evenza_API_Test/Evenza_Postman_Collection.json`.
4. Test the full booking and management lifecycle:
   * **Register User** &rarr; **Verify Account OTP** (activates account).
   * **Login** (automatically sets the Bearer Auth token).
   * **Create Event (Admin)** (creates listing and stores `event_id`).
   * **Send Booking OTP Request** &rarr; **Verify & Request Booking** (submits ticket request to pending queue).
   * **Confirm Booking (Admin - Paid)** (confirms pass, decrements seat, dispatches pass email).
