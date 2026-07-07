# Blogging App Monorepo

This repository contains a full-stack blogging application in a Turbo repo with two apps:

- `apps/web` — Frontend built with Next.js 16, React 19, Redux Toolkit, React Query, Ant Design, Tailwind CSS, and Zustand.
- `apps/server` — Backend API built with Express 5, MongoDB, JWT auth, cookie parsing, CORS, rate limiting, and OpenAI/Groq integration.

## What this project includes

- User authentication and authorization
- Blog creation, reading, updating, deleting
- Comments, likes, saved blogs, and reporting
- OpenAI/Groq integration routes for AI-related features
- Rate limiting on the server to protect API endpoints
-chat 

## Getting started

From the repository root:

```bash
npm install
npm run dev
```

The root `dev` script uses Turbo to start both apps if configured in workspace scripts.

### Run each app separately

Frontend:

```bash
cd apps/web
npm install
npm run dev
```

Backend:

```bash
cd apps/server
npm install
npm run dev
```

The backend listens on `process.env.PORT`, and the frontend expects the API to be available from `http://localhost:3000` by default.

## Environment variables

Create a `.env` file in `apps/server` with at least:

```env
PORT=5000
MONGODB_URI=your_mongo_connection_string
GROQ_API_KEY=your_groq_api_key
```

If the app uses additional OpenAI or JWT settings, add them there as needed.

## Directory structure

- `apps/web` — frontend source, pages, components, store, and UI
- `apps/server` — Express API, routes, controllers, middleware, models, and config
- `package.json` — root workspace config
- `turbo.json` — Turbo monorepo settings

## Notes

- Use `apps/web/README.md` for frontend-specific details if needed.
- The backend is configured with `express-rate-limit` and uses CORS, cookie parsing, and MongoDB.
