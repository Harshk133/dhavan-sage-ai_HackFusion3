# Agentic Pharmacy AI (36h Hackathon)

This repository contains an autonomous, intelligent multi-agent pharmacy system built entirely on the 3-Layer Agent Architecture (Directives, Orchestrator, Execution). 

## Features
1. **Agentic Chain of Thought (Observability):** Integrated with LangGraph and LangSmith. Provides full trace logs proving the Supervisor checked Inventory AND Prescriptions before fulfilling orders.
2. **Conversational Ordering (STT/TTS):** A React frontend that uses Web Speech API to capture audio, passes it to the FastAPI LangGraph backend, and speaks the response.
3. **Safety Guardrails:** Strict Python deterministic tools that check MongoDB stock limits and Mock prescription limits.
4. **Proactive Refill Intelligence:** A CRON background task that mathematically predicts when patients will run out of chronic medications based on sandbox purchase history.
5. **No-CMS Sandbox:** Entirely custom FastAPI + MongoDB backend, replacing SQLite for superior async performance per requirements.

## Stack
- **AI/Orchestration:** LangGraph, LangChain, `gpt-4o-mini` (or local Ollama fallback)
- **Backend:** Python, FastAPI, Motor (Async MongoDB), APScheduler (for refill crons).
- **Frontend:** React (Vite), TailwindCSS, `lucide-react`.
- **Database:** MongoDB
- **Observability:** LangSmith

## How to Run

### 1. Database & Environment
1. Ensure MongoDB is running locally on port `27017`.
2. Open `.env` and populate your `OPENAI_API_KEY` (or swap to local `ChatOllama` in `agent_supervisor.py`).
3. (Optional) Populate `LANGCHAIN_API_KEY` in `.env` to view trace chains live in the browser.

### 2. Backend (FastAPI / LangGraph)
1. Navigate to the `backend/` directory (or use the root `venv`).
2. Run data load (assuming you place mock excels in `/data`): `python execution/data_loader.py`
3. Boot the server: `uvicorn backend.main:app --reload --port 8000`

### 3. Frontend (React / Vite)
1. Open a second terminal to `/frontend`
2. `npm install`
3. `npm run dev`
4. Access the UI at `http://localhost:5173`. 
   - Click "Test Chatbot" to place voice orders. 
   - Click "Admin View" to see live inventory depletion and CRON-generated refill alerts.

## 3-Layer Architecture Example
When you say *"I need 20 pills of Paracetamol"*:
1. **Orchestrator (LangGraph)** reads the NLP and checks `directives/agent_supervisor_sop.md`.
2. It invokes the LangChain Tool `check_inventory` which fires an HTTP request to our determinist API.
3. It invokes `check_prescription` based on `directives/prescription_validation.md`.
4. If BOTH pass, it invokes `execute_order`, which writes to MongoDB.
5. The CRON job in `predict_refills.py` continuously scans the new DB state to forecast future shortages.


Give a Star 🌟 to this repository! 
