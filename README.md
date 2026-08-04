# 🌸 Lily Link

A modern **Microservice-based URL Shortener** built with **Next.js**, **Node.js**, **Express**, **Prisma**, **Neon PostgreSQL**, **Upstash Redis**, and **Docker**. The architecture focuses on scalability, loose coupling, high performance, and production-ready deployment.

---

## 🔗 Live Demo

- **Frontend:** https://lily-link.vercel.app
- **Repository:** https://github.com/meheraj786/microservice-url-link-shortener
- **System-Design(HLD):** https://meherajdev.vercel.app/system-designs/design-url-shortner

---

# 🛠️ Tech Stack

## Frontend (User Interface)

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 + HeroUI (formerly NextUI)
- **HTTP Client:** Axios with automatic JWT token injection via interceptors
- **Deployment:** Vercel (Production Static Optimization)

---

## Backend (Microservices Core)

- **Runtime:** Node.js + Express + TypeScript
- **ORM:** Prisma (v6 & v7)
- **Database:** Neon PostgreSQL
  - `user_schema`
  - `url_schema`
- **Caching:** Upstash Redis (Serverless Distributed Cache)
- **API Gateway:** Dockerized Nginx
  - Reverse Proxy
  - SSL Handshaking
  - Custom CORS Preflight
  - Native Rate Limiting (HTTP 429)

---

## Infrastructure & DevOps

- **Containerization:** Docker
- **Optimized Builds:** Multi-stage Dockerfiles
- **Local Orchestration:** Docker Compose
- **CI/CD:** GitHub Actions
- **Deployment Strategy:**
  - Backend → Render
  - Frontend → Vercel

---

# ✨ Features

### 🔐 JWT Authentication

Secure user registration and login handled by the dedicated **user-service**.

### 🔗 Logical Foreign Keys

Independent microservices communicate using loose-coupled `userId` string references without enforcing physical database foreign keys.

### ⚡ Distributed Caching

URL lookups first query **Upstash Redis (O(1))**, then fall back to **PostgreSQL**, significantly reducing database load.

### 🌐 API Gateway

Single centralized gateway powered by **Nginx**, hiding downstream services behind one public endpoint.

### 🛡️ DDoS Protection

Built-in Nginx rate limiting automatically returns **HTTP 429 Too Many Requests** during excessive traffic.

### 🚀 Monorepo CI/CD

GitHub Actions deploy only affected applications based on commit prefixes.

| Commit Prefix | Action |
|--------------|--------|
| `backend:` | Build & Deploy Backend to Render |
| `frontend:` | Build & Deploy Frontend to Vercel |

---

# 📂 Project Structure

```text
lily-link/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── gateway/
│   ├── nginx.conf
│   └── Dockerfile
│
├── services/
│   ├── url-service/
│   │   ├── src/
│   │   └── Dockerfile
│   │
│   └── user-service/
│       ├── src/
│       └── Dockerfile
│
├── frontend/
│
├── docker-compose.yml
│
└── .env.sample
```

---

# 🚀 Local Development

## Prerequisites

- Docker
- Docker Compose
- Node.js
- pnpm

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/meheraj786/microservice-url-link-shortener.git

cd url-shortener
```

---

## 2️⃣ Configure Environment Variables

Create a `.env` file in the project root by following the `.env.sample` template.

---

## 3️⃣ Start All Services

```bash
docker compose up --build
```

---

## 4️⃣ Verify API Gateway

The Nginx API Gateway runs on **Port 80**.

Health Check:

```bash
curl http://localhost/health
```

---

# 📦 Microservices

| Service | Responsibility |
|----------|----------------|
| user-service | Authentication, User Management, JWT |
| url-service | URL Shortening, Redirects, Redis Cache |
| gateway | Reverse Proxy, CORS, Rate Limiting |

---

# ⚙️ Architecture Highlights

- Microservice Architecture
- Dockerized Infrastructure
- Shared PostgreSQL with Isolated Schemas
- Distributed Redis Cache
- Centralized API Gateway
- JWT Authentication
- Conditional GitHub Actions CI/CD
- Production Ready Deployment
- Loose Coupling Between Services

---

# 🛡️ Security

- JWT Authentication
- Secure Password Hashing
- Nginx Rate Limiting
- Custom CORS Handling
- Reverse Proxy Isolation
- Environment Variable Configuration

---

# 🚀 Deployment

| Service | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| Cache | Upstash Redis |
| Gateway | Docker + Nginx |

---

## 👨‍💻 Author

**Meheraj Hosen**

- GitHub: https://github.com/meheraj786

---

## 📄 License

This project is licensed under the **MIT License**.