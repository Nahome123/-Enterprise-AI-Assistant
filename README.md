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
- `render.yaml` for a Render Blueprint with a web service, PostgreSQL database, and persistent upload disk
- `frontend/vercel.json` for frontend SPA routing

Render backend deployment:

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
