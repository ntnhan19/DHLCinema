# 🎬 Movie Ticket Booking System

A comprehensive web application for online movie ticket booking and management.

![Movie Ticket Booking](https://img.shields.io/badge/Project-Movie%20Ticket%20Booking-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-v14+-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791?logo=postgresql)
![JavaScript](https://img.shields.io/badge/JavaScript-97.9%-F7DF1E?logo=javascript)

## 📋 Overview

> 🎓 This project was developed as a **university foundation project** by a group of third-year Software Engineering students.  
> It is **not a commercial product**, but a hands-on academic project to apply full-stack web development knowledge.

**Movie Ticket Booking** is a modern platform that allows users to conveniently book movie tickets online. The project features both user-facing systems for ticket booking and administrative systems for theater management, movie scheduling, and transaction oversight.

As part of the system, a **VNPay (sandbox)** integration was implemented to simulate online payment.

### 🌐 Live Demo
- **User Application**: https://dhl-cinema-user.vercel.app/
- **Admin Panel**: https://dhl-cinema-admin.vercel.app/ (if available)

---

## ✨ Key Features

### 👤 User Features
- **Account Management**
  - User registration and login
  - Personal profile editing
- **Movie Experience**
  - Browse currently showing movies with details
  - Book movie tickets with seat selection
  - **VNPay sandbox payment integration**
  - Post movie reviews and ratings

### 🔧 Admin Features
- **Content Management**
  - Manage movie catalog (CRUD)
  - Create and edit screening schedules
  - Theater and seat configuration
- **Business Operations**
  - Manage booking transactions
  - Create promotions and discounts
  - Manage user information

---

## 🛠️ Technology Stack

### Frontend
- ![React](https://img.shields.io/badge/-React.js-61DAFB?logo=react&logoColor=white) – Modern UI library for interactive frontend
- ![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white) – Utility-first CSS framework
- ![Ant Design](https://img.shields.io/badge/-Ant%20Design-0170FE?logo=antdesign&logoColor=white) – React UI component library

### Backend
- ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) – JavaScript runtime environment
- ![Express](https://img.shields.io/badge/-Express.js-000000?logo=express&logoColor=white) – Web framework for REST APIs
- ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?logo=postgresql&logoColor=white) – Relational database
- ![Prisma](https://img.shields.io/badge/-Prisma%20ORM-2D3748?logo=prisma&logoColor=white) – Type-safe ORM for PostgreSQL
- **JWT** – Secure authentication with JSON Web Tokens
- **VNPay (Sandbox)** – Simulated payment gateway integration

### Admin Panel
- **React Admin** – Powerful admin interface for managing system resources

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- PostgreSQL installed and running

### Step 1: Clone the repository
```bash
git clone https://github.com/ntnhan19/DHLCinema.git
cd DHLCinema
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your database connection in .env
npm run dev
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### Step 4: Admin Panel Setup
```bash
cd ../admin
npm install
npm run dev
```

## 📂 Project Structure
```
DHLCinema/
├── admin/           # Admin Panel (React Admin)
├── backend/         # Backend (Node.js + Express)
├── frontend/        # Frontend (React.js)
├── .gitignore       # Git ignore file
├── README.md        # Project documentation
└── .gitattributes   # Git attributes file
```

## 🔮 Future Development Goals

- [ ] Complete payment gateway integration
- [ ] Enhance user interface and experience
- [ ] Implement advanced movie search functionality
- [ ] Add personalized movie recommendations
- [ ] Mobile application development
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact & Support

- **Email**: ngochanpt2018@gmail.com
- **GitHub**: [ntnhan19/DHLCinema](https://github.com/ntnhan19/DHLCinema)

---

<p align="center">🎥 <b>Happy Movie Booking!</b> 🍿</p>
