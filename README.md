Lumora
======

Illuminate Enterprise Knowledge.

Full-stack enterprise knowledge assistant with document upload, pgvector search, RAG chat with citations, authentication, ticket intelligence, and a React/Vite frontend.

Tech Stack
----------

- Frontend: React, TypeScript, Vite, Material UI, React Query, Axios
- Backend: FastAPI, SQLAlchemy, PostgreSQL, pgvector, JWT auth
- AI: OpenAI embeddings and chat completion
- Database: PostgreSQL with pgvector

Local Development
-----------------

Start PostgreSQL:

```bash
docker compose up -d
```

Backend:

```bash
cd backend
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
copy .env.example .env
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev -- --host 127.0.0.1
```

Deployment
----------

Vercel should deploy the `frontend` directory as the production web app.

Recommended Vercel settings:

- Framework preset: Vite
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL`

Set `VITE_API_BASE_URL` to the public URL of the deployed FastAPI backend, for example:

```text
https://your-api.example.com
```

Backend hosting note:

The FastAPI backend requires PostgreSQL, pgvector, persistent uploads, and server-side secrets. Deploy it separately on a backend platform such as Render, Railway, Fly.io, or a VM, then point Vercel to that backend URL.

This repository includes:

- `backend/Dockerfile` for the FastAPI API service
- `backend/railway.json` for Railway backend deployment
- `render.yaml` for a Render Blueprint with a web service, PostgreSQL database, and persistent upload disk
- `frontend/vercel.json` for frontend SPA routing

Railway backend deployment:

1. Create a new Railway project from the GitHub repository.
2. Add a PostgreSQL database service in the same Railway project.
3. Add a backend service from the repository.
4. Railway can deploy from the repository root using the root `railway.json` and `Dockerfile`.
5. If you prefer an isolated backend service, set the backend service root directory to `backend` and use `/backend/railway.json`.
6. Add the backend environment variables listed below.
7. Generate a public domain for the backend service.
8. Set `PUBLIC_BACKEND_URL` to that Railway backend URL.
9. Confirm the backend health check returns `{"status":"running"}`.

Recommended Railway backend variables:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
OPENAI_API_KEY=replace-with-your-new-openai-key
JWT_SECRET_KEY=replace-with-a-strong-random-secret-at-least-32-characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
UPLOAD_DIR=/app/uploads
TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe
FRONTEND_URL=https://lumoradocs.org
BACKEND_CORS_ORIGINS=https://lumoradocs.org,https://frontend-q0pvum5km-nahometeshe-1491s-projects.vercel.app
PUBLIC_BACKEND_URL=https://your-railway-backend-url.up.railway.app
```

Render backend deployment, optional:

1. Create a new Render Blueprint from the GitHub repository.
2. Use the included `render.yaml`.
3. Set `OPENAI_API_KEY` in the Render service environment.
4. After Render gives you the API URL, set `PUBLIC_BACKEND_URL` to that URL.
5. Confirm the backend health check returns `{"status":"running"}`.

The backend creates the `vector` extension on startup with:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

If your database provider does not allow that command, enable `pgvector` from the provider dashboard or SQL console before starting the API.

Required backend environment variables:

```text
DATABASE_URL
OPENAI_API_KEY
JWT_SECRET_KEY
JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES
UPLOAD_DIR
FRONTEND_URL
BACKEND_CORS_ORIGINS
PUBLIC_BACKEND_URL
```

After the backend is live, update Vercel:

```text
VITE_API_BASE_URL=https://your-backend-url.example.com
```

Then redeploy the frontend.

Build Verification
------------------

Frontend:

```bash
cd frontend
npm run build
```

Backend syntax check:

```bash
cd backend
.\venv\Scripts\python.exe -m compileall app
```
