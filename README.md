# Simple Task App

A small JavaScript app for practicing a React + Vite frontend and an Express API. It has no authentication or database; tasks live in memory and reset when the server restarts.

## Requirements

- Node.js 18 or newer
- npm
- Docker Desktop (for containerized deployment)

## Run locally

Install and run each app separately from its own directory.

Start the server in one terminal:

```sh
cd server
npm install
npm run dev
```

Start the frontend in a second terminal:

```sh
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually http://localhost:5173).

During local development, Vite proxies `/api` requests to Express using the URL configured in `client/.env` (`VITE_API_URL`).

## Environment variables

- `client/.env`:
  - `VITE_PORT` sets the Vite development server port.
  - `VITE_API_URL` sets the Express URL used by the Vite proxy.

- `server/.env`:
  - `PORT` sets the Express listening port.

Both apps include an `.env.example` template. Local `.env` files are ignored by Git.

## Code quality checks

ESLint and Prettier are installed as development dependencies in both `client`
and `server`. Run the checks from the corresponding app directory. For example,
from `server`:

```sh
npm run lint
npm run format:check
```

Use `npm run format` to apply Prettier formatting. The client also has
`npm run build`. The GitHub Actions workflow at `.github/workflows/ci.yml` runs
formatting and ESLint checks for both apps, and builds the client on pushes and
pull requests.

## Production build

Build the frontend from `client`:

```sh
npm run build
```

Start the API from `server`:

```sh
npm start
```

If the frontend build is available at `client/dist`, Express also serves it; otherwise, Express runs as an API-only server.

The default Express port is `3000`.

## API

- `GET /api/health` — health check
- `GET /api/tasks` — list tasks
- `POST /api/tasks` — add a task with JSON such as `{"title":"Learn Docker"}`

---

# Docker Deployment

The frontend and backend each have their own Dockerfile and can be built and
run independently. Both approaches below are documented: running containers
manually is useful for learning networks and port mappings; Docker Compose
automates those steps for the whole app.

The container ports and proxy target are configured in the app environment
files:

- `server/.env`: `PORT=5000`
- `client/.env`: `VITE_PORT=5173` and `VITE_API_URL=http://backend:5000`

The frontend proxy uses `backend` as the backend's hostname on a Docker
network. Rebuild the frontend image after changing its environment settings.

## Run containers manually

Run these commands from the project root.

### Build the images

```powershell
docker build -t node-backend ./server
docker build -t node-frontend ./client
```

### Create a shared network

```powershell
docker network create task-app-network
```

Docker's user-defined network provides internal DNS so containers can reach
each other by container name.

### Start the backend

```powershell
docker run -d --name backend --network task-app-network -p 5000:5000 --env-file server/.env node-backend
```

The API is available from the host at `http://localhost:5000`; other
containers on this network can reach it at `http://backend:5000`.

### Start the frontend

```powershell
docker run -d --name frontend --network task-app-network -p 5173:5173 node-frontend
```

Open `http://localhost:5173`. The frontend's Vite preview proxy forwards `/api`
requests to `http://backend:5000`.

### Inspect, test, and clean up

```powershell
docker ps
docker logs backend
docker logs frontend
docker network inspect task-app-network
curl.exe http://localhost:5000/api/health
curl.exe http://localhost:5000/api/tasks
```

To stop and remove these containers:

```powershell
docker rm -f frontend backend
```

The network can be reused. To remove it when finished:

```powershell
docker network rm task-app-network
```

After changing source code or a Dockerfile, rebuild the corresponding image
and recreate that container. For example:

```powershell
docker rm -f frontend
docker build -t node-frontend ./client
docker run -d --name frontend --network task-app-network -p 5173:5173 node-frontend
```

## Run with Docker Compose

The root `docker-compose.yml` builds and runs both services and creates a
shared network automatically. Its service names are `backend` and `frontend`;
the frontend uses Compose DNS to reach the backend at `http://backend:5000`.
Compose passes `server/.env` to the backend, and the frontend image uses
`client/.env`.

From the project root, build and start both containers:

```powershell
docker compose up --build
```

Or run them in the background:

```powershell
docker compose up --build -d
```

Open the frontend at `http://localhost:5173`. The API is available from the
host at `http://localhost:5000`.

Useful Compose commands:

```powershell
docker compose ps
docker compose logs -f
docker compose logs -f frontend
docker compose logs -f backend
docker compose down
```

After changing source code or a Dockerfile, rebuild and recreate the
containers:

```powershell
docker compose up --build -d
```

`depends_on` starts the backend before the frontend, but does not wait for the
backend API to become ready.

## Docker architecture

```text
                  Browser
                     |
              localhost:5173
                     |
                     v
          +----------------------+
          | Frontend container   |
          | React + Vite preview |
          | Port: 5173           |
          +----------------------+
                     |
                  /api/tasks
                     |
                     v
              Docker network
              backend:5000
                     |
                     v
          +----------------------+
          | Backend container    |
          | Node + Express       |
          | Port: 5000           |
          +----------------------+
                     |
                     v
              In-memory tasks
```

**Docker concepts to explore:**

- Docker images, containers, and Dockerfile instructions (`FROM`, `WORKDIR`,
  `COPY`, `RUN`, `CMD`, `EXPOSE`)
- Port publishing (`-p`) and container ports
- Environment variables and `--env-file`
- User-defined bridge networks and Compose-created networks
- Container-to-container communication and Docker DNS
- Compose services, `depends_on`, and logs
- Rebuilding images and recreating containers



## Will add the git-hub action for ci-cd pipline creation and usage
  *** At the root we will add a `.github` folder**