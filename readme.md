# Kisan Setu (किसान सेतु) 🌾

Kisan Setu is an AgriStack-integrated digital agriculture platform providing farmers with AI assistance, direct crop marketing, government scheme access, and real-time mandi prices.

---

## 🚀 Quick Start Guide

To run the project locally after cloning from GitHub, open **two separate terminal windows**:

### 1️⃣ Start Backend Server (Terminal 1)
```bash
cd backend
npm install
npm run dev
```
- **API URL**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/v1/health`

---

### 2️⃣ Start Frontend Web App (Terminal 2)
```bash
cd frontendkrishna
npm install
npm run dev
```
- **Farmer Mobile App**: `http://localhost:5173`
- **Admin Corporate Portal**: `http://localhost:5173/admin/login`

---

## 🔑 Default Prototype Credentials

| Role | Username / ID | Password / OTP |
| :--- | :--- | :--- |
| **Admin Portal** | `admin` | `kisan2026` |
| **Farmer Login** | Any 10-digit mobile (e.g. `9876543210`) | Any 6-digit OTP (e.g. `123456`) |

---

## 📁 Tech Stack
- **Frontend**: React, Vite, Lucide Icons, CSS Modules
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bhashini AI / LangChain integration
