# 🎬 Movie Ticket Booking System (DHL Cinema)

A full-stack web application for online movie ticket booking and cinema management, built by a team of 3 members.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](#)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791?logo=postgresql)](#)

### 🌐 Live Demo
- **User Application**: https://dhl-cinema-user.vercel.app/
- **Backend API**: https://dhlcine-api.onrender.com/

---

## ✨ Technical Highlights & Features

- **Automated Data Pipeline (TMDb API)**: Engineered a background cronjob to automatically fetch the latest movies, dynamically generate showtimes, and map cinema seats without manual data entry.
- **Self-Healing Architecture**: The system automatically purges outdated showtimes and restores missing data upon startup, ensuring the portfolio is always ready for demonstration even after months of inactivity.
- **Concurrent Seat Booking**: Designed complex database schemas using Prisma ORM to handle real-time seat locking and prevent double-booking.
- **VNPay Payment Gateway**: Successfully simulated end-to-end checkout transactions using the VNPay Sandbox and webhook callbacks.
- **Authentication & Security**: Implemented JWT (JSON Web Tokens) and bcrypt for secure user registration, login, and Role-Based Access Control (RBAC) for the Admin Dashboard.
- **Admin Dashboard**: Full CRUD management for movies, theaters, concessions, and promotional campaigns.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Ant Design
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Supabase), Prisma ORM
- **Deployment**: Vercel (Frontend), Render (Backend)

---

## 🚀 Quick Setup

1. Clone the repository and install dependencies:
```bash
git clone https://github.com/ntnhan19/DHLCinema.git
cd DHLCinema/backend && npm install
cd ../frontend && npm install
```

2. Configure environment variables (`.env`) for Backend:
```env
DATABASE_URL="your_postgresql_url"
TMDB_API_KEY="your_tmdb_api_key"
```

3. Run the development servers:
```bash
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
cd frontend && npm run dev
```
