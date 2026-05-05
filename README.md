# Team Task Manager

Full-stack task manager with a React/Vite frontend and Node/Express/MongoDB backend.

## Local Run

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Railway Deploy

Create two Railway services from this GitHub repo.

Backend service:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`

Frontend service:

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Start command: `npx vite preview --host 0.0.0.0 --port $PORT`
- Variables: `VITE_API_URL=https://your-backend-service.up.railway.app/api`

After the backend Railway URL is generated, update `VITE_API_URL` in the frontend service and redeploy the frontend.
