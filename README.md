# QuizFlow | Online Quiz & Exam Platform

Project Link(vercel):https://onlinequiz-23.vercel.app/

A professional, production-ready examination platform built with modern web technologies.

## 🚀 Key Features

### 🧑💼 Admin Features
- **Intelligent Dashboard**: Real-time statistics on exams, students, and submissions.
- **Exam Management**: Full CRUD for exams with duration and passing score settings.
- **Question Engine**: Support for MCQ, Short Answer, and Coding questions.
- **Bulk Upload**: Import questions via Excel files for rapid deployment.
- **Live Analytics**: View student performance and detailed submisison reports.

### 👨🎓 Student Features
- **Dynamic Dashboard**: Track upcoming exams, history, and global rank.
- **Exam Engine**: 
    - Real-time server-synced timer.
    - **3-second Auto-save**: Never lose progress due to connectivity issues.
    - Resumable sessions: Refresh or crash? Pick up exactly where you left off.
    - Integrated coding editor UI for development questions.
- **Instant Analysis**: Detailed post-exam reports with correct answers and explanations.
- **Global Leaderboard**: Compete for top spots with a visual podium ranking system.

## 🛠️ Tech Stack
- **Frontend**: Vite + React, Tailwind CSS, Lucide Icons
- **Backend**: Node.js + Express
- **Database**: Turso (SQLite)
- **Auth**: JWT (JSON Web Tokens) with Role-Based Access Control

## 🏁 Quick Start

### 1. Prerequisites
- Node.js installed on your machine.
- Environment variables are already configured in `backend/.env` with Turso credentials.

### 2. Setup
```bash
# Navigate to the project
cd onlinePortal

# Install and Start Backend
cd backend
npm install
npm run dev

# (In a new terminal) Install and Start Frontend
cd ../frontend
npm install
npm run dev
```

### 3. Demo Credentials
- **Admin**: `admin@exam.com` / `Admin123!`
- **Student**: `student@exam.com` / `Student123!`
- **Student: "virinchi@gmail.com" / "virinchi"
---
*Created by Antigravity AI*
