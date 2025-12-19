# Spur AI Live Chat Agent

An interactive AI support agent for a live chat widget, built with Node.js, TypeScript, SvelteKit, Supabase, and Groq (Llama 3.3).

![Chat Demo](https://via.placeholder.com/600x400?text=Spur+AI+Agent+Preview)

## 🛠️ How to Run Locally

### Prerequisites
- Node.js v18+
- [Supabase](https://supabase.com) account
- [Groq](https://groq.com) API Key (free tier available)

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd spur
```

### Step 2: Database Setup (Supabase)
1. Create a new project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `supabase-schema.sql` (found in the root of this repo) and run it to create the `conversations` and `messages` tables.
4. Go to **Project Settings -> API** and copy:
   - `Project URL`
   - `anon` / `public` Key

### Step 3: Configure Environment Variables
Navigate to the `backend` folder and create a `.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your keys:
```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=gsk_your_groq_api_key
```

### Step 4: Install & Run Backend
In the `backend` directory:
```bash
npm install
npm run dev
```
*Server will start on http://localhost:3001*

### Step 5: Install & Run Frontend
Open a new terminal, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
*Open http://localhost:5173 to see the app!*

---

## 🏗️ Architecture Overview

The application follows a clean **client-server architecture** with a clear separation of concerns.

### Backend Structure (`/backend`)
- **Layers**:
  - **Routes** (`src/routes`): Handles HTTP requests, input validation, and invokes services.
  - **Services** (`src/services`): Contains business logic.
    - `llmService.ts`: Manages prompts and calls the AI provider.
    - `conversationService.ts`: Handles database operations via Supabase.
  - **Config** (`src/config`): Centralized configuration for external clients (OpenAI/Groq, Supabase).
- **Design Decisions**:
  - **Service-Repository Pattern**: Business logic is decoupled from the API layer, making it easier to test or switch frameworks (e.g., from Express to Fastify).
  - **Stateless Backend**: The server is stateless; conversation state is managed via `sessionId` passed from the client and persisted in the DB.

### Frontend Structure (`/frontend`)
- **Framework**: SvelteKit for reactive, component-based UI.
- **Components**:
  - `ChatWidget.svelte`: The main container managing state (Landing vs. Chat view) and history.
  - `EvaRobot.svelte`: Custom 3D CSS robot with mouse-tracking interactivity.
- **Persistence**: Hybrid approach.
  - **Local**: `localStorage` keeps track of *user identity* (session IDs) to allow "no-login" history retrieval.
  - **Remote**: Full message history is fetched from the backend on demand.

---

## 🤖 LLM Notes

### Provider
- **Provider**: **Groq**
- **Model**: `llama-3.3-70b-versatile`
- **Reasoning**: Chosen for its incredible speed (low latency) which is crucial for a "real-time" chat feel, and its high reasoning capabilities comparable to GPT-4 class models, but with lower cost/friction for this demo.

### Prompt Engineering
- **System Prompt**: 
  - Defined in `backend/src/services/llmService.ts`.
  - **Persona**: "Alex", a friendly and professional support agent for "ShopEase".
  - **Context Injection**: Store policies (Shipping, Returns, Hours) are hardcoded into the prompt context.
  - **Guardrails**: Strict instructions to **reject off-topic queries** (like weather or math) with a single polite sentence, enforcing the bot's scope as a shopping assistant.

---

## ⚖️ Trade-offs & "If I had more time..."

### 1. Persistence Strategy
- **Trade-off**: For this MVP, I used `localStorage` to store a list of session IDs to simulate a "logged-in" experience without actual authentication.
- **Improvement**: Implement real **User Auth** (Supabase Auth) so history syncs across devices.

### 2. Knowledge Base
- **Trade-off**: Store policies are hardcoded in the system prompt string. This is simple but doesn't scale if the FAQ grows large.
- **Improvement**: Implement **RAG (Retrieval-Augmented Generation)** using a vector store (e.g., Supabase pgvector) to dynamically fetch only relevant policy documents based on the user's query.

### 3. Frontend Polish
- **Trade-off**: Used vanilla CSS for the 3D robot to minimize dependencies.
- **Improvement**: Use **Three.js** or **React Three Fiber** (if React) for more complex 3D interactions and smoother animations.

### 4. Code Sharing
- **Trade-off**: Some types (e.g., `Message` interface) are duplicated between frontend and backend.
- **Improvement**: Use a **Monorepo** (Turborepo/Nx) with a shared `packages/types` workspace to share TypeScript interfaces directly.
