WEBSITE.md

Overview

This repository contains a full-stack Urine Analysis application. The frontend is a React + TypeScript single-page app (Vite) that allows selecting an image and sampling RGB to classify color and call the backend. The backend is a FastAPI app that runs a hybrid ML model (ResNet-18 image features + a small MLP for tabular color features) to predict urine specific gravity.

Frontend

- Framework: React 19 + TypeScript
- Bundler: Vite
- Styling: Tailwind CSS
- State & UI: Plain React components; includes a color picker and utils in `frontend/src/utils`.
- Key files:
  - `frontend/src/App.tsx` — main UI and color picker
  - `frontend/src/utils/api.ts` — axios client for backend calls
  - `frontend/src/utils/color_class.ts` — color classification logic
  - `frontend/src/types/index.ts` — shared types and API config (reads `VITE_BASE_URL`)
- How to run (development):

```bash
cd frontend
npm install
npm run dev
```

- Production build:

```bash
cd frontend
npm run build
```

Backend

Welcome to Urina — a simple urine-color analysis demo

This page explains, in simple terms, what this project does and how to try it. It's written for non-technical users and anyone who wants a quick, friendly overview.

What the app does

- Take or upload a photo of a small urine sample (or use a provided example image).
- The app estimates an approximate urine specific-gravity value by analyzing the color of the sample.
- The frontend shows the sampled color and a brief, non-medical guidance message.

Quick user steps (for non-technical users)

1. Open the frontend in your browser. If you're running locally, the dev server is usually at:

```text
http://localhost:5173
```

2. Click "Upload" or "Choose file" and pick a photo of the urine sample.
3. Place the color-picker (drag or tap) over the sample to sample the color.
4. Press "Analyze" or wait for the app to automatically analyze the sampled area.
5. Read the numeric estimate (specific gravity) and the short guidance message.

Important safety note

- This app provides informational results only. It is not a medical test or diagnosis. If you have health concerns, consult a healthcare professional.

Want to run it locally? (short developer-friendly steps)

Frontend (quick):

```bash
cd frontend
npm install
npm run dev
# then open http://localhost:5173 in your browser
```

Backend (quick):

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# API docs: http://localhost:8000/docs
```

Run with Docker (one machine):

```bash
cd backend
docker build -t urine-analysis-api:latest .
docker run -p 8000:8000 urine-analysis-api:latest
```

Developer notes (short and friendly)

- Frontend: built with React + TypeScript (Vite) and styled with Tailwind. The frontend reads a build-time environment variable `VITE_BASE_URL` which points to the backend API.
- Backend: FastAPI serving a small hybrid machine learning model (image + color features) using PyTorch. Main endpoints include `/predict` and `/extract_features`.

Where to look for help

- `frontend/src/App.tsx` — UI and color picker behavior
- `frontend/src/utils/api.ts` — the code that calls the backend
- `backend/main.py` — the API and model inference logic

Want a one-click demo?

I can help add simple deployment automation (GitHub Actions for the frontend and a script to push the backend to Azure), or create a short README with screenshots. Tell me which option you prefer and I'll add it.

