# LeadFlow CRM — Client Lead Management System

A modern, full-stack **Mini CRM & Lead Management System** built for freelancers, agencies, and small businesses to collect client inquiries from a public website, manage prospective leads, track follow-ups, and convert leads into paying customers.

---

##  Project Overview

When potential clients visit your website, they submit inquiries through a public contact form. **LeadFlow CRM** captures these inquiries directly into a secure MongoDB database and displays them in a clean, real-time admin dashboard.

Admins can log in securely to:
- View high-level metrics (Total Inquiries, New Leads, Follow-ups Due, Conversion Rate).
- Search, filter, and update lead statuses (`new`, `contacted`, `converted`, `lost`).
- Open a slide-in drawer to add internal notes and schedule follow-ups.
- Track closed won projects in a dedicated **Converted Clients** section.

---

##  Key Features

- ** Public Landing & Contact Page**: Visitors can view services and submit project inquiries with instant validation.
- ** Secure Admin Authentication**: Login protected with password hashing (bcrypt) and JWT in secure HTTP-only cookies.
- ** Live Dashboard Analytics**: Real-time KPI summary cards and visual performance charts built with Recharts.
- ** Complete Lead Management**: Full CRUD operations, debounced search (by name, email, company), status filters, and server-side pagination.
- ** Slide-in Lead Drawer**: Click any lead to view full project details, switch stages in one click, and access tabs.
- ** Persistent Notes Timeline**: Log threaded notes for every client interaction with timestamps and author details.
- ** Follow-up Task Tracker**: Schedule follow-up calls and deadlines; filter tasks by **Today**, **Overdue**, **Upcoming**, or **Completed**.
- ** Converted Clients Roster**: View won accounts and total revenue generated.
- ** Settings & Data Control**: Update your admin profile, change password, or clear the pipeline with one click.

---

## 🛠 Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Lucide Icons, Recharts, Custom Vanilla CSS |
| **Backend** | Node.js, Express.js (REST API) |
| **Database** | MongoDB, Mongoose ODM |
| **Security** | JWT (HTTP-only cookies), bcryptjs, Helmet, CORS, Rate Limiting, express-validator |
| **Testing** | Jest, Supertest (18 automated integration tests) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally (or a free MongoDB Atlas connection string)

### 2. Installation
Clone the repository and install dependencies for both server and client:

```bash
# Clone the repository
git clone https://github.com/AdithyaramKaturi/FUTURE_FS_02.git
cd FUTURE_FS_02

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file inside the `server/` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/leadflow-crm
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
DEFAULT_ADMIN_NAME=Admin User
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=your_secure_password
```

*(The client connects to `http://localhost:5000/api` through the Vite proxy).*

### 4. Run the Application

Open two terminal windows:

**Terminal 1 — Start Backend Server:**
```bash
npm run dev --prefix server
```
*Backend runs on `http://localhost:5000` (initializes your admin account from `.env` on first launch).*

**Terminal 2 — Start Frontend Application:**
```bash
npm run dev --prefix client
```
*Frontend runs on `http://localhost:5173`.*

Log in at [http://localhost:5173/login](http://localhost:5173/login) using the admin credentials you set in your `.env` file.

---

## 📱 Application Pages

| Page | Route | Description |
| :--- | :--- | :--- |
| **Public Website** | `/` or `/contact` | Landing page for visitors to view agency services and submit inquiries |
| **Admin Login** | `/login` | Secure administrator access |
| **Overview Dashboard** | `/dashboard` | KPI metrics, inquiry inflow trend chart, and recent prospects |
| **All Leads** | `/leads` | Filterable table with search, pagination, and slide-in detail drawer |
| **Follow-ups** | `/follow-ups` | Task list categorized by Today, Overdue, Upcoming, and Completed |
| **Converted Clients** | `/converted` | Portfolio of closed won deals and revenue calculations |
| **Settings** | `/settings` | Admin profile update, password change, and pipeline data controls |

---

## 🧪 Running Automated Tests

Run the backend integration test suite:
```bash
npm test --prefix server
```
*Runs 18 automated tests covering public submission, authentication, CRUD, notes, follow-ups, and analytics.*

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
