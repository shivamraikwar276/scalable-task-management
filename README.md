# Scalable Task Manager -> Shivam-Manjhi

A full-stack MERN task manager with JWT authentication and role-based access control (user / admin).

## 🌐 Live Demo

Frontend: https://scalable-task-manager-amber.vercel.app  
Backend: https://scalable-task-manager.onrender.com

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, dotenv, cors, nodemon
**Frontend:** React (Vite), Axios, React Router

## Project Structure

```
scalable-task-manager/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── components/
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── vite.config.js
├── postman_collection.json
└── README.md
```

## Setup & Run

### 1. Prerequisites

- Node.js 18+
- MongoDB running locally with the connection string:
  `mongodb://admin:root@127.0.0.1:27017/TaskManager?authSource=admin`

### 2. Install dependencies

From the project root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Or in one shot:

```bash
npm run install-all
```

### 3. Configure environment

`backend/.env` is included with sensible defaults:

```
PORT=5000
JWT_SECRET=secret123
JWT_EXPIRES_IN=1d
MONGO_URI=mongodb://admin:root@127.0.0.1:27017/TaskManager?authSource=admin
```

### 4. Run

Run both servers together (recommended):

```bash
npm run dev
```

Or separately in two terminals:

```bash
npm run backend     # http://localhost:5000
npm run frontend    # http://localhost:5173
```

The Vite dev server proxies `/api` requests to the backend automatically.

Open **http://localhost:5173** in your browser.

## API Endpoints

All endpoints are versioned under `/api/v1`.

### Auth

| Method | Endpoint         | Auth   | Description                                                |
| ------ | ---------------- | ------ | ---------------------------------------------------------- |
| POST   | `/auth/register` | Public | Create user (`name`, `email`, `password`, optional `role`) |
| POST   | `/auth/login`    | Public | Login, returns JWT                                         |
| GET    | `/auth/me`       | Bearer | Current user info                                          |

### Tasks

| Method | Endpoint        | Auth              | Description                               |
| ------ | --------------- | ----------------- | ----------------------------------------- |
| GET    | `/tasks`        | user, admin       | List tasks (own for user, all for admin)  |
| POST   | `/tasks`        | user, admin       | Create task                               |
| GET    | `/tasks/:id`    | user (own), admin | Get task                                  |
| PUT    | `/tasks/:id`    | user (own), admin | Update task                               |
| DELETE | `/tasks/:id`    | user (own), admin | Delete task                               |
| POST   | `/tasks/assign` | admin only        | Assign task to a user (`title`, `userId`) |

### Users (admin only)

| Method | Endpoint     | Description                   |
| ------ | ------------ | ----------------------------- |
| GET    | `/users`     | List all users                |
| GET    | `/users/:id` | Get user                      |
| DELETE | `/users/:id` | Delete user (and their tasks) |

## JWT Flow

1. Client calls `/auth/register` or `/auth/login` and receives `{ token, user }`.
2. Token contains `{ id, role }` and expires in 1 day.
3. Client stores the token in `localStorage` and attaches it to every request:
   `Authorization: Bearer <token>`
4. Backend `protect` middleware verifies the token and loads the user.
5. `authorizeRoles(...roles)` enforces role-based access on protected routes.

## Role-based Access

- **user** — can only read/update/delete tasks where `task.userId === req.user.id`.
- **admin** — can read/update/delete any task, manage users, and assign tasks to any user.

The frontend reads the user's role from the stored profile (and falls back to decoding the JWT) and:

- Hides the Admin nav link for non-admins.
- Protects the `/admin` route with `<ProtectedRoute role="admin">`.

## Postman Collection

Import `postman_collection.json` into Postman. Set the `baseUrl` variable to `http://localhost:5000/api/v1` and run **Login** — the `token` variable is set automatically and reused by every other request.

## Scalability Notes

This codebase is intentionally small but structured for horizontal scaling:

- **Stateless API** — JWT-based auth means any instance can serve any request, so the backend can sit behind a load balancer (NGINX, AWS ALB) and scale out.
- **Microservices** — `auth`, `tasks`, and `users` are already isolated as routes/controllers and can be split into separate services communicating over HTTP or a message bus (NATS, RabbitMQ, Kafka).
- **Caching** — Add Redis in front of `GET /tasks` and `GET /users` to absorb read traffic and store rate-limit counters, sessions, or short-lived tokens.
- **Database** — Use a managed MongoDB cluster (Atlas) with replica sets and sharding by `userId` for horizontal data scaling. Indexes on `userId` and `createdAt` are already in place.
- **Containerization** — Each service ships as a Docker image; deploy via Kubernetes (or ECS) with separate pods for backend and frontend (frontend can be served as static files via CDN).
- **Observability** — Add structured logging (pino/winston), metrics (Prometheus), and tracing (OpenTelemetry).
- **Security** — Rotate `JWT_SECRET`, add rate limiting (`express-rate-limit`), helmet for headers, and HTTPS termination at the load balancer.
