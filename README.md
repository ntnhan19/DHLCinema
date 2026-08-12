# 🎬 Movie Ticket Booking System (DHL Cinema)

A comprehensive, full-stack web application for online movie ticket booking and cinema management. 

![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791?logo=postgresql)

## 📋 Overview

**Movie Ticket Booking (DHL Cinema)** is a modern platform that allows users to conveniently book movie tickets online. It features both a user-facing booking interface and an administrative dashboard for theater management, movie scheduling, and transaction oversight.

> 🎓 This project was initially developed as a university foundation project by a team of 3 members and has since been upgraded to serve as a **self-sustaining portfolio showcase**.

### 🌐 Live Demo
- **User Application**: https://dhl-cinema-user.vercel.app/
- **Backend API**: https://dhlcine-api.onrender.com/

---

## ✨ Key Features & Technical Highlights

### 🚀 NEW: Self-Healing & Automated Data Sync
To ensure the project is always ready for demonstration without manual data entry:
- **TMDb API Integration**: Automatically fetches the latest "Now Playing" and "Upcoming" movies (including posters, trailers, casts, and directors) directly from The Movie Database (TMDb).
- **Auto-Schedule Generation**: Dynamically generates showtimes and dynamically maps hundreds of cinema seats for new movies.
- **Smart Cleanup Cronjob**: Automatically purges outdated showtimes and orphaned movies to prevent database bloat over time.
- **Zero-Maintenance**: The system is designed to "wake up" and restore itself to a perfectly populated state upon the first visit after a long period of inactivity.

### 👤 User Features
- **Movie Experience**: Browse currently showing movies, watch trailers, and read detailed synopses.
- **Booking Flow**: Intuitive seat selection map and ticket booking process.
- **Payment Integration**: Simulated online payment checkout via **VNPay (sandbox)**.
- **Account Management**: User authentication (JWT), profile management, and ticket history.

### 🔧 Admin Features
- **Content Management**: Manage movie catalog, cinemas, and halls (CRUD).
- **Business Operations**: Oversee ticket transactions and generate concession categories (Combos, Snacks, Drinks).
- **Promotions**: Create and manage discount vouchers and promotional campaigns.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS, Ant Design
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JSON Web Tokens (JWT), bcrypt
- **External APIs**: VNPay (Payment), TMDb API (Movie Metadata)
- **Deployment**: Vercel (Frontend), Render (Backend), Supabase (Database)

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### 1. Clone the repository
```bash
git clone https://github.com/ntnhan19/DHLCinema.git
cd DHLCinema
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add your DATABASE_URL, TMDB_API_KEY, and VNPAY configs to .env
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Admin Panel Setup
```bash
cd ../admin
npm install
npm run dev
```

## 🤝 Contact & Support

- **Email**: ngochanpt2018@gmail.com
- **GitHub**: [ntnhan19](https://github.com/ntnhan19)

---
<p align="center">🎥 <b>Happy Movie Booking!</b> 🍿</p>
