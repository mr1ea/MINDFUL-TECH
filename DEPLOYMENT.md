# Backend Deployment

This repository contains a web frontend and a Node/Express backend in `backend/`.

## Recommended deployment path

Use Railway, Render, or another Node hosting provider for the backend.

### Railway setup

1. Create a new Railway project and connect this repository.
2. Set the root directory to `mindfultech-app` if needed.
3. Set these environment variables in Railway:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GROQ_API_KEY` or `GOOGLE_API_KEY`
   - `PORT=5000`
4. Set the start command to:
   - `npm start`
5. Deploy the project.

### Render setup

1. Create a new Render service and connect this repository.
2. Add `render.yaml` to the repository root.
3. Configure the service to use Node.js and the `main` branch.
4. Add these environment variables in Render:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GROQ_API_KEY` or `GOOGLE_API_KEY`
   - `NODE_ENV=production`
5. Deploy the service.

### Frontend configuration

If you host the frontend separately, set the frontend environment variable:

- `VITE_API_BASE_URL=https://<your-deployed-backend>/api`

The frontend uses this value to call the backend API.

## AI API key values

The backend currently supports AI requests through environment variables.

- `GROQ_API_KEY` — Groq AI key used by the current analysis service.
- `GOOGLE_API_KEY` — Google Generative AI key (Gemini) if you want to switch providers.
- `OPENAI_API_KEY` — OpenAI key for future extension or fallback.

## Important notes

- Do not commit `.env` or other secret files.
- Use `.env.example` and `backend/.env.example` as templates.
- If you use Vercel for frontend, keep the backend on Railway or another hosted Node service, because this project is not configured as a Vercel serverless function app.
