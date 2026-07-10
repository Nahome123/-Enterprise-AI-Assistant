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

Required backend environment variables:

```text
DATABASE_URL
OPENAI_API_KEY
JWT_SECRET_KEY
JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES
UPLOAD_DIR
```

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
