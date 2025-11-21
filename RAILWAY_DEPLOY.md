# Deploying MingleX to Railway

This repository is set up to be deployed to Railway as a single Docker service that serves both the frontend (built React app) and the backend (Express + Socket.IO). The root `Dockerfile` builds the client and server and starts the Node server which serves the static client build.

Quick steps

- Ensure you have the following environment variables set in Railway for your project/service:
  - `MONGODB_URI` — connection string for MongoDB
  - `JWT_SECRET` — your JWT secret
  - `CORS_ALLOWED_ORIGINS` — comma-separated allowed origins for Socket.IO / CORS (e.g. `https://yourdomain.com`)
  - `EMAIL_USER` / `EMAIL_PASS` etc. — any other env vars used by `server`.

- Link this repository to Railway (via their dashboard) and choose the root of this repo. Railway will detect the `Dockerfile` and build the image.

- Alternatively, you can use the Railway CLI:

```powershell
# from repository root
# railway init         # if you haven't already
# railway link         # to link an existing project
# railway up           # will build using Dockerfile and deploy
```

Notes and tips

- The server reads `process.env.PORT` so Railway's assigned port will be respected.
- If you prefer separate Railway services for frontend and backend, you can:
  - Deploy `client` as a static site (Railway supports static sites) and the `server` as a Node service, or
  - Use two Railway projects and point the frontend to the backend's URL via environment variables.

- To test locally with the Docker image:

```powershell
docker build -t minglex .
docker run -p 5000:5000 -e MONGODB_URI="your_local_mongo" -e JWT_SECRET="secret" minglex
```

If you want help wiring Railway variables or creating two separate services (frontend + backend), tell me which option you prefer and I'll add the supporting files and instructions.
