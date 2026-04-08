# nodejs-service

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![License](https://img.shields.io/badge/License-ISC-blue.svg)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)


A production-ready Node.js microservice generated with **MVC** and **MySQL**. 
This project follows a strict **7-Step Production-Ready Process** to ensure quality and scalability from day one.

---

## 🚀 7-Step Production-Ready Process

1.  **Initialize Git**: `git init` (Required for Husky hooks and security gates).
2.  **Install Dependencies**: `npm install`.
3.  **Configure Environment**: Copy `.env.example` to `.env`.
4.  **Start Infrastructure**: `docker-compose up -d db redis`.
5.  **Run Development**: `npm run dev`.
6.  **Verify Standards**: `npm run lint` and `npm test` (Enforce 80% coverage).
7.  **Build & Deploy**: `npm run build` followed by `npm run deploy` (via PM2).

---

## 🚀 Key Features

-   **Architecture**: MVC (MVC Pattern).
-   **Database**: MySQL (via Sequelize).
-   **Security**: Helmet, CORS, Rate Limiting, HPP, Snyk SCA.
-   **Quality**: 80%+ Test Coverage, Eslint, Prettier, Husky.
-   **DevOps**: Multi-stage Docker, CI/CD ready (GitHub/GitLab/Jenkins/Bitbucket/CircleCI).


## 📂 Project Structure

The project follows **MVC** principles.
- **Model**: Database schemas and data logic.
- **View**: Template engines or API responders.
- **Controller**: Orchestrates flow between Model and View.

---

## 🛠️ Detailed Getting Started

Follow the **🚀 7-Step Production-Ready Process** summary at the top, or follow these detailed instructions:

### 1. Prerequisites
-   Node.js (v18+)
-   Docker & Docker Compose

### 2. Environment Setup
Copy the example environment file and adjust the values as needed:
```bash
cp .env.example .env
```

### 3. Infrastructure & App Launch
```bash
# Initialize Git for security hooks
git init

# Install dependencies
npm install

# Start required services
docker-compose up -d db redis

# Run the app in development mode
npm run dev
```

### 4. Quality & Standards
```bash
# Lint & Format
npm run lint
npm run format

# Run Unit/Integration Tests
npm test
npm run test:coverage
```

API is exposed via **REST**.
A Swagger UI for API documentation is available at:
- **URL**: `http://localhost:3000/api-docs` (Dynamic based on PORT)

### 🛣️ User Endpoints:
- `GET /api/users`: List all users.
- `POST /api/users`: Create a new user.
- `PATCH /api/users/:id`: Partially update a user.
- `DELETE /api/users/:id`: Delete a user (Soft Delete).


## ⚡ Caching
This project uses **Redis** for caching.
- **Client**: `ioredis`
- **Connection**: Configured via `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` in `.env`.

## 📝 Logging
This project uses **Winston** for structured logging.
- **Development**: Logs are printed to the console.
- **Production**: Logs are saved to files:
  - `error.log`: Only error level logs.
  - `combined.log`: All logs.

## 🐳 Docker Deployment
This project uses a **Multi-Stage Dockerfile** for optimized production images.

### 1. Running Locally (Development)
To run the Node.js application locally while using Docker for the infrastructure (Database, Redis, Kafka, etc.):

```bash
# Start infrastructure
docker-compose up -d db redis

# Start the application
npm run dev
```

### 2. Running the App Container with Compose Infrastructure
If you want to run the application itself inside a Docker container while connecting to the infrastructure managed by your `docker-compose.yml`:

```bash
# First, ensure your infrastructure is running
docker-compose up -d

# Build Production Image
docker build -t nodejs-service .

# Run Container (attached to the compose network)
docker run -p 3000:3000 --network nodejs-service_default \
  -e DB_HOST=db \
  -e REDIS_HOST=redis \
  nodejs-service
```
## 🚀 PM2 Deployment (VPS/EC2)
This project is pre-configured for direct deployment to a VPS/EC2 instance using **PM2** (via `ecosystem.config.js`).
1. Install dependencies
```bash
npm install
```
2. **Start Infrastructure (DB, Redis, Kafka, etc.) in the background**
*(This specifically starts the background services without running the application inside Docker, allowing PM2 to handle it).*
```bash
docker-compose up -d db redis
```
3. **Wait 5-10s** for the database to fully initialize.
4. **Deploy the App using PM2 in Cluster Mode**
```bash
npm run build
npm run deploy
```
5. **Check logs**
```bash
npx pm2 logs
```
6. Stop and remove the PM2 application
```bash
npx pm2 delete nodejs-service
```
7. Stop and remove the Docker infrastructure
```bash
docker-compose down
```

## 🔒 Security Features
-   **Helmet**: Sets secure HTTP headers.
-   **CORS**: Configured for cross-origin requests.
-   **Rate Limiting**: Protects against DDoS / Brute-force.
-   **HPP**: Prevents HTTP Parameter Pollution attacks.

## 🤖 AI-Native Development

This project is "AI-Ready" out of the box. We have pre-configured industry-leading AI context files to bridge the gap between "Generated Code" and "AI-Assisted Development."

- **Magic Defaults**: We've automatically tailored your AI context to focus on **nodejs-service** and its specific architectural stack (MVC, MySQL, etc.).
- **Use Cursor?** We've configured **`.cursorrules`** at the root. It enforces project standards (80% coverage, MVC/Clean) directly within the editor. 
  - *Pro-tip*: You can customize the `Project Goal` placeholder in `.cursorrules` to help the AI understand your specific business logic!
- **Use ChatGPT/Gemini/Claude?** Check the **`prompts/`** directory. It contains highly-specialized Agent Skill templates. You can copy-paste these into any LLM to give it a "Senior Developer" understanding of your codebase immediately.