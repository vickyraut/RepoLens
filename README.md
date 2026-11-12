# RepoLens

**Understand Your Codebase. See the Bigger Picture.**

RepoLens is a developer-focused platform that helps developers explore, understand, and analyze code repositories. Connect your GitHub account, index public or private repositories into a vector store, and chat with your codebase using retrieval-augmented generation (RAG) with real-time streaming and source citations.

---

## Key Features

- **GitHub OAuth2 Integration**: Authenticate via GitHub (`read:user`, `repo` scopes) with encrypted access tokens persisted at rest.
- **Repository Sync & Filtering**: Sync repositories where you are an owner, collaborator, or organization member; search by name, description, or language; and filter by visibility (`All`, `Public`, `Private`) or indexing status (`Ready`, `Indexing`, `New`, `Failed`).
- **Asynchronous Code Indexing**: Indexes eligible source files from a repository's default branch via the GitHub API, filtering out dependency/build directories (`node_modules`, `.git`, `target`, `.next`, etc.), lockfiles, hidden files, and oversized files before chunking and embedding into PostgreSQL + `pgvector`.
- **Live Indexing Progress**: Tracks total files, processed files, embedded chunk counts, and errors with automatic status polling.
- **RAG Codebase Chat with SSE Streaming**: Create multiple chat sessions per indexed repository and receive streamed Markdown answers over Server-Sent Events (`text/event-stream`).
- **Source Citations**: Assistant responses include clickable citation chips linking directly to the referenced file paths (and line ranges when available) on GitHub.
- **Workspace Overview & Settings**: View workspace-wide repository and chunk statistics, manage theme preferences (Light / Dark / System), and inspect connected GitHub profile details.

---

## Tech Stack

### Backend (`backend/`)
- **Java 21** & **Spring Boot 4.1.0**
- **Spring Security & OAuth2 Client** (GitHub OAuth2 login, session-based auth, `TextEncryptor` token encryption)
- **Spring Data JPA** & **PostgreSQL**
- **Spring AI 2.0.0** (`spring-ai-starter-model-openai`, `spring-ai-starter-vector-store-pgvector`)
- **Maven** & **Lombok**

### Frontend (`client/`)
- **Next.js 16** (App Router) & **React 19**
- **TypeScript**
- **Tailwind CSS v4**, **shadcn/ui**, & **Base UI**
- **TanStack React Query**
- **Streamdown** (`streamdown`, `@streamdown/code`) for streaming Markdown and syntax-highlighted code blocks
- **next-themes** & **Lucide React**

### Infrastructure (`docker/`)
- **Docker Compose** with `pgvector/pgvector:pg16` (extensions: `vector`, `hstore`, `uuid-ossp`)

---

## Project Architecture

```text
RepoLens/
├── backend/                          # Spring Boot REST & SSE API
│   ├── src/main/java/com/repolens/backend/
│   │   ├── config/                   # Async executor, CORS, token crypto, Security & OAuth2 config
│   │   ├── controllers/              # AuthController, RepoController, ChatController
│   │   ├── dto/                      # API request/response records & DTOs
│   │   ├── entity/                   # JPA entities (User, Repository, ChatSession, ChatMessage)
│   │   ├── exceptions/               # Global exception handling
│   │   ├── repository/               # Spring Data JPA repositories
│   │   ├── security/                 # GitHub OAuth2 user service & CurrentUser helper
│   │   └── services/
│   │       ├── ai/                   # RAG retriever, prompt builder, SSE stream handler, citation mapper
│   │       ├── github/               # GitHub REST API client & rate limiter
│   │       └── indexing/             # File eligibility filter, token chunker, async indexing service
│   └── src/main/resources/
│       └── application.properties.example
├── client/                           # Next.js frontend application
│   ├── app/                          # App Router pages (/, /login, /auth/callback, /dashboard/*, /chat/[repoId])
│   ├── components/                   # Chat, dashboard, layout, icon, provider, and UI components
│   ├── hooks/                        # React Query hooks for auth, repos, indexing, and SSE chat
│   └── lib/                          # API client, SSE parser, query keys, navigation config
├── docker/postgres/                  # PostgreSQL initialization script for pgvector/hstore/uuid-ossp
├── docker-compose.yml                # Local PostgreSQL + pgvector service
└── .env.example                      # Example environment variables
```

### API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/auth/login-url` | Returns the GitHub OAuth2 authorization URL |
| `GET` | `/api/auth/me` | Returns the authenticated user's profile |
| `POST` | `/api/auth/logout` | Invalidates the session and clears `REPOLENS_SESSION` |
| `GET` | `/api/repos?refresh=true\|false` | Syncs repositories from GitHub or lists stored repositories |
| `GET` | `/api/repos/{id}` | Retrieves details for a single repository |
| `POST` | `/api/repos/{id}/index` | Starts asynchronous indexing for a repository (`202 Accepted`) |
| `GET` | `/api/repos/{id}/status` | Polls indexing status and file/chunk progress |
| `POST` | `/api/chat/sessions` | Creates a new chat session for an indexed repository |
| `GET` | `/api/chat/sessions?repositoryId=...` | Lists chat sessions for a repository |
| `GET` | `/api/chat/sessions/{id}` | Lists messages in a chat session |
| `POST` | `/api/chat/sessions/{id}/messages` | Streams assistant replies over SSE (`text/event-stream`) |

---

## Prerequisites

- **Java 21+**
- **Maven 3.9+** (or Maven Wrapper)
- **Node.js 20+** and **npm**
- **Docker & Docker Compose** (for PostgreSQL + `pgvector`)
- A **GitHub OAuth App** (with callback URL `http://localhost:8080/login/oauth2/code/github`)
- An **OpenAI API Key**

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/vickyraut/RepoLens.git
cd RepoLens
```

### 2. Start PostgreSQL with `pgvector`

```bash
docker compose up -d
```

This starts a `pgvector/pgvector:pg16` container (`repolens-postgres`) exposed on port `5433` with database `repolens` and extensions `vector`, `hstore`, and `uuid-ossp`.

### 3. Configure environment variables and backend properties

Copy the example configuration files and fill in your credentials:

```bash
cp .env.example .env
cp backend/src/main/resources/application.properties.example backend/src/main/resources/application.properties
```

Key configuration values:

| Variable / Property | Description | Default / Example |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` / `spring.security.oauth2.client.registration.github.client-id` | GitHub OAuth App Client ID | — |
| `GITHUB_CLIENT_SECRET` / `spring.security.oauth2.client.registration.github.client-secret` | GitHub OAuth App Client Secret | — |
| `OPENAI_API_KEY` / `spring.ai.openai.api-key` | OpenAI API key for chat and embeddings | — |
| `APP_TOKEN_ENCRYPTOR_PASSWORD` / `app.token-encryptor-password` | Password used to encrypt GitHub OAuth tokens | — |
| `APP_TOKEN_ENCRYPTOR_SALT` / `app.token-encryptor-salt` | Hex salt used by `TextEncryptor` | `0123456789abcdef` |
| `APP_FRONTEND_URL` / `app.frontend-url` | Frontend URL for OAuth redirect targets | `http://localhost:3000` |
| `APP_CORS_ALLOWED_ORIGINS` / `app.cors.allowed-origins` | Comma-separated allowed CORS origins | `http://localhost:3000` |
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL used by the Next.js client | `http://localhost:8080` |

> **Note:** Never commit `.env` or `backend/src/main/resources/application.properties` with real secrets. Both are ignored by `.gitignore`.

### 4. Install frontend dependencies

```bash
cd client
npm install
```

---

## Running in Development

### Start the Backend

From the `backend/` directory (ensure your environment variables or `application.properties` are configured):

```bash
cd backend
mvn spring-boot:run
```

The backend listens on `http://localhost:8080` by default.

### Start the Frontend

From the `client/` directory:

```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. Open **RepoLens** at `http://localhost:3000` and click **Continue with GitHub**.
2. Authorize the GitHub OAuth application to grant access to your repositories.
3. On the **Repositories** dashboard (`/dashboard`), click **Sync** if needed to fetch your GitHub repositories.
4. Click **Index** on a repository to fetch eligible source files, split them into chunks, and generate `pgvector` embeddings.
5. Once indexing reaches `READY`, click **Chat** or **Open** to open `/chat/[repoId]` and ask questions about the codebase.
6. Switch between chat sessions in the sidebar, inspect clickable GitHub source citations below assistant replies, or view workspace metrics under **Overview** (`/dashboard/overview`).

---

## Future Improvements

- Automatic re-indexing via GitHub webhooks on repository pushes.
- Support for selecting non-default branches when indexing a repository.
- Automated unit and integration test suites using mocked GitHub/OpenAI clients or Testcontainers.

