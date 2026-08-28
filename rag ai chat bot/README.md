# Kisan Setu AI Saathi backend

FastAPI backend for the existing React chat UI. It provides `POST /chat`, SQLite conversation memory, local ChromaDB retrieval, local Sentence Transformers embeddings, and Gemini-generated answers grounded in documents you ingest.

## Setup

1. Create the virtual environment:

   ```bash
   python -m venv .venv
   ```

2. Activate it.

   Windows:

   ```bash
   .venv\Scripts\activate
   ```

   Linux/macOS:

   ```bash
   source .venv/bin/activate
   ```

3. From this `backend` directory, install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Copy `.env.example` to `.env`, then set `GOOGLE_API_KEY` to a Google AI Studio API key (used only for generating answers). Embeddings run locally through Sentence Transformers and do not consume Gemini embedding quota. The multilingual model downloads automatically the first time. Adjust models or `FRONTEND_URL` only if needed.

5. Put trusted agricultural PDF, TXT, Markdown, or DOCX files in `data/documents/`. Metadata includes source filename and page where available.

6. Build/update the local knowledge base:

   ```bash
   python -m app.ingestion.ingest
   ```

7. Start the API:

   ```bash
   uvicorn main:app --reload --port 8000
   ```

8. In another terminal, run the existing React frontend:

   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

The existing frontend already sends requests to `http://localhost:8000/chat`; no frontend changes are needed.

## API

`POST /chat`

```json
{"user_id":"user123","conversation_id":null,"message":"मेरी गेहूं की फसल में पीले धब्बे हैं"}
```

The response includes `conversation_id`, `cardTitle`, `answer`, `detail`, and `source`. Send the returned conversation ID for later messages. The database retains only the most recent configured messages in each LLM context window (default 12), while storing the conversation locally in `kisan_setu.db`.

`GET /health` returns `{"status":"ok"}`.

## Safety and behavior

The service retrieves knowledge-base context first. If no chunk reaches the configured relevance threshold, Gemini answers autonomously from its general agricultural knowledge without mentioning retrieval or missing context. It asks users to follow registered product labels and contact a qualified agricultural officer where a chemical dosage or diagnosis is uncertain. If the Google key is not configured, a safe configuration message is returned. Do not commit `.env`, `chroma_db`, or the local SQLite database.

## Tests

Run from `backend/`:

```bash
pytest
```
# Kisan Setu | Kisan-First AI Conversational Assistant 🌾

> **SIH 2026 Problem Statement:** Agriculture & Rural Development  
> **Core Mission:** Bridging the gap between rural farmers, government schemes, and direct market trade through a voice-first, single-profile conversational platform.

---

## 📌 Executive Overview

**Kisan Setu** is a Hindi-first, voice-enabled conversational assistant designed for low-literacy farmers and first-time smartphone users. It solves two critical pain points in Indian agriculture:

1. **Repetitive Data Entry for Government Schemes:** Instead of filling out separate forms for every welfare program, a farmer enters their profile once via **Farmer ID**, automatically connecting land, crop, and location details across features.
2. **Exploitative Local Crop Selling:** Farmers often sell blindly to middlemen. Kisan Setu compares local **mandi** prices with government **MSP** routes, giving farmers clear trade-offs between price and travel distance.

---

## ⚡ Key Highlights

* 🗣️ **Voice-First UI:** Built around a single large microphone landing state powered by national AI mission infrastructure (**Bhashini**).
* 👤 **Profile-Once Architecture:** Leverages **AgriStack** (Land, Farmer, Crop Sown Registries) so zero re-typing is required.
* 🤖 **Dual-Feature Agent Core:** Driven by a **LangGraph** RAG pipeline handling scheme eligibility and direct crop-selling logic seamlessly.
* 📶 **Offline-Tolerant PWA:** Service workers and IndexedDB store local data so dropped field connections don't disrupt usage.

---

## 🏗️ System Architecture (PADS Overview)
# 🌾 System Architecture

```text
┌─────────────────────────┐
│   Farmer (Voice/Text)   │
└────────────┬────────────┘
             ▼
┌──────────────────────────────────────┐
│ Client Layer — React PWA              │
│ Voice + Text UI                       │
└────────────┬─────────────────────────┘
             ▼
┌──────────────────────────────────────┐
│ API Layer — FastAPI                   │
│ Auth, Routing & Session Management    │
└────────────┬─────────────────────────┘
             ▼
┌──────────────────────────────────────┐
│ Agent Core — LangGraph                │
│ RAG Pipeline & Reasoning Engine       │
└────────────┬─────────────────────────┘
             ▼
┌──────────────────────────────────────┐
│ Data & Integrations                   │
│ PostgreSQL + ChromaDB                 │
│ Bhashini + AgriStack + Mandi APIs     │
└──────────────────────────────────────┘
```

## 🔄 Scheme Eligibility Flow

```text
Farmer Voice Query
        ↓
React PWA
        ↓
FastAPI
        ↓
Bhashini ASR
(Speech → Text)
        ↓
LangGraph Agent
   ├── AgriStack Profile
   └── ChromaDB Schemes
        ↓
Eligibility Decision
        ↓
Bhashini TTS
(Text → Speech)
        ↓
Farmer Hears Response
```

## 📌 Layer Breakdown

* **Client:** React PWA optimized for low-end Android devices.
* **API:** FastAPI handles OTP authentication, routing, sessions, and roles.
* **Agent:** LangGraph manages RAG, reasoning, and eligibility matching.
* **Database:** PostgreSQL stores structured farmer/application data.
* **Vector Store:** ChromaDB stores scheme and agricultural documents.
* **Bhashini:** Provides ASR, translation, and TTS.
* **AgriStack:** Provides farmer/agricultural profile data.
* **Mandi APIs:** Agmarknet/e-NAM provide market price information.
