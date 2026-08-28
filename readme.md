# 🌾 Kisan Setu — किसान सेतु

> **Bridging the gap between Indian farmers and government services through AI-powered voice assistance**

<div align="center">

![Kisan Setu](https://img.shields.io/badge/Made%20for-Indian%20Farmers-green?style=for-the-badge&logo=leaf)
![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-24.x-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

</div>

---

## 🧭 Overview

**Kisan Setu** *(Farmer's Bridge)* is a full-stack, mobile-first Progressive Web Application built for Smart India Hackathon 2026. It empowers Indian farmers with a conversational RAG-powered AI assistant that speaks their language — delivering personalized agricultural advice, government scheme eligibility, mandi price updates, and more.

> *"Koi bhi kisan akela nahi rahega."* — No farmer is left alone.

---

## ✨ Key Features

| Feature | Description |
|--------|-------------|
| 🤖 **RAG AI Chatbot** | Answers farmer queries using official scheme PDFs (PM-KMY, PM-KISAN, PMFBY, KCC) via Google Gemini 2.0 Flash + LangChain |
| 🎙️ **Voice Interface** | Talk in Hindi — Web Speech API converts voice to text and reads answers aloud |
| 📋 **AgriStack Integration** | Auto-links Kisan ID from National AgriStack registry on mobile OTP login |
| 🌾 **Fasal Becho (Sell Crop)** | Farmers list produce; buyers can discover and purchase directly |
| 📊 **Scheme Explorer** | Browse PM-KISAN, PMFBY, KCC, PM-KMY with one-tap eligibility checks |
| 🖥️ **Admin Portal** | Manage farmers, register Kisan IDs, and oversee scheme applications |
| 📱 **Mobile-First UI** | Designed as a smartphone experience with Material-style components |
| 🔒 **OTP Authentication** | Frictionless mobile-number based login — no passwords needed |

---

## 🏗️ Architecture

```
SIH-Project/
├── 📁 backend/                     # Express.js API Server (Port 5000)
│   └── src/
│       ├── chatbot/                # 🐍 Python RAG AI Microservice
│       │   ├── main.py             #    FastAPI entry point
│       │   ├── config.py           #    Environment configuration
│       │   ├── llm_service.py      #    LangChain + Gemini AI integration
│       │   ├── rag_service.py      #    PDF document retrieval engine
│       │   └── data/documents/     #    Official scheme PDFs (PM-KMY, SCHEMES)
│       ├── controllers/            # Route business logic
│       ├── models/                 # Mongoose schemas
│       ├── routes/                 # Express API routes
│       ├── middlewares/            # Auth, optional token guards
│       ├── utils/                  # Bhashini, logger, agristack utilities
│       └── index.js                # App entry point
│
└── 📁 frontend/                    # React + Vite App (Port 5173)
    └── src/
        ├── pages/
        │   ├── Login/              # OTP-based mobile login
        │   ├── Home/               # Farmer dashboard with avatar
        │   ├── Chat/               # RAG AI Chatbot UI with voice
        │   ├── SellCrop/           # Crop listing and marketplace
        │   ├── Schemes/            # Government scheme explorer
        │   ├── Profile/            # Farmer profile with AgriStack sync
        │   └── Admin/              # Admin portal dashboard
        ├── components/             # Reusable UI components
        └── services/api.js         # Axios API client
```

---

## 🤖 RAG AI Chatbot — How It Works

```
User Query (Hindi / English)
        │
        ▼
┌──────────────────────────┐
│   Voice Recognition       │  ←  Web Speech API (browser-native)
│   Hindi STT               │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│   Node.js Express API     │
│   POST /api/v1/voice/     │
│   text-query              │
└───────────┬──────────────┘
            │  execFile()
            ▼
┌──────────────────────────┐
│   Python RAG Engine       │
│   backend/src/chatbot/    │
│                           │
│   1. rag_service.py  ─────┼──► PDF Chunking: PM-KMY, SCHEMES.pdf
│      Document Retrieval   │
│                           │
│   2. llm_service.py  ─────┼──► LangChain + Gemini 2.0 Flash
│      Response Generator   │
└───────────┬──────────────┘
            │  Structured JSON
            ▼
┌──────────────────────────┐
│   AI Response Card UI     │  ←  cardTitle + answer + detail + source
│   React /chat Page        │
└───────────┬──────────────┘
            │
            ▼
   🔊 Text-to-Speech (TTS)   ←  Web Speech Synthesis API
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and **npm**
- **Python** v3.10+
- **MongoDB Atlas** *(free tier works)*
- **Google Gemini API Key** *(optional — enables live AI responses)*

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/infinity-0008/SIH-Project.git
cd SIH-Project
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/kisan_setu
JWT_SECRET=your_jwt_secret_here
OTP_SECRET=your_otp_secret_here
GEMINI_API_KEY=your_google_gemini_api_key   # Enables live Gemini AI
ADMIN_USERNAME=admin
ADMIN_PASSWORD=kisan2026
CORS_ORIGIN=http://localhost:5173
```

Install Python AI dependencies:

```bash
# From the backend root
pip install langchain-google-genai pypdf
```

Start the backend:

```bash
npm run dev
```

> ✅ **API running at** `http://localhost:5000`

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> ✅ **App running at** `http://localhost:5173`

---

## 🔐 Demo Credentials

| Role | Details |
|------|---------|
| 🌾 **Farmer** | Any valid 10-digit mobile number → OTP login (no password needed) |
| 🖥️ **Admin Portal** | URL: `/admin/login` → Username: `admin` / Password: `kisan2026` |

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/farmers/send-otp` | Send OTP to farmer mobile |
| `POST` | `/api/v1/farmers/verify-otp` | Verify OTP & receive JWT |
| `GET` | `/api/v1/farmers/profile` | Fetch logged-in farmer profile |
| `POST` | `/api/v1/voice/text-query` | 🤖 RAG AI text chat query |
| `POST` | `/api/v1/voice/query` | 🎙️ Voice query (audio → AI response) |
| `GET` | `/api/v1/schemes` | List all government schemes |
| `POST` | `/api/v1/schemes/:code/apply` | Apply for a government scheme |
| `GET` | `/api/v1/crops` | Browse all listed crops |
| `POST` | `/api/v1/crops` | Farmer lists a new crop for sale |
| `POST` | `/api/v1/admin/farmers` | Admin: Register a Kisan ID |
| `GET` | `/api/v1/health` | Service health check |

---

## 🧠 AI Knowledge Base — Schemes Covered

| Scheme Code | Full Name | Benefit |
|-------------|-----------|---------|
| **PM-KMY** | PM Kisan Maandhan Yojana | ₹3,000/month pension at age 60 |
| **PM-KISAN** | PM Kisan Samman Nidhi | ₹6,000/year in 3 direct bank instalments |
| **PMFBY** | PM Fasal Bima Yojana | Crop loss insurance — Kharif 2%, Rabi 1.5% premium |
| **KCC** | Kisan Credit Card | ₹3 Lakh credit facility at 4% effective interest |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, CSS Modules, Lucide Icons |
| **Backend API** | Node.js 24, Express.js 5, MongoDB Atlas, Mongoose |
| **AI / RAG Engine** | Python 3, LangChain, Google Gemini 2.0 Flash |
| **Document Parsing** | PyPDF — PDF chunking & keyword retrieval from official scheme docs |
| **Authentication** | JWT Tokens, OTP mobile login, `optionalVerifyToken` for chat |
| **Media Storage** | Cloudinary (crop images), MongoDB (data) |
| **Voice** | Web Speech API — native browser STT & TTS (no external API cost) |
| **AgriStack** | Custom farmer registry with Kisan ID auto-link on login |

---

## 👥 Team

**Crafted with ❤️ for Indian Farmers — Smart India Hackathon 2026**

| Member | Role |
|--------|------|
| **Abhay Yadav** | Full-Stack Lead · Backend Architecture · RAG AI Integration |
| **Kunal Kundaliya** | Frontend Developer · UI/UX Design · Mobile Experience |

---

## 📄 License

Licensed under the **ISC License** — see [LICENSE](./LICENSE) for details.

---

<div align="center">

### 🌾 Jai Kisan · Jai Hind 🇮🇳

*Smart India Hackathon 2026 — Empowering 140 million Indian farmers*

</div>
