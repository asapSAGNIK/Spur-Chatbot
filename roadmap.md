# 🛣️ Spur AI Live Chat Agent - Development Roadmap

## 📋 Project Overview

**Goal:** Build a mini AI support agent for a live chat widget — a web app where users chat with an AI-powered customer support agent that uses a real LLM (OpenAI/Claude) to generate contextual responses.

**Timeframe:** 8-12 hours (Weekend project)

---

## 🎯 Deliverables Summary

| Deliverable | Tech Stack | Status |
|-------------|------------|--------|
| Backend API | Node.js + TypeScript | ⬜ Not Started |
| Frontend Chat UI | Svelte/SvelteKit | ⬜ Not Started |
| Database | Supabase (PostgreSQL) | ⬜ Not Started |
| LLM Integration | OpenAI/Anthropic API | ⬜ Not Started |
| Documentation | README.md | ⬜ Not Started |

---

## 📦 Phase 1: Project Setup & Foundation
**Estimated Time:** 1-2 hours

### Tasks
- [ ] Create project folder structure (monorepo approach)
- [ ] Initialize Node.js + TypeScript backend (Express or Fastify)
- [ ] Initialize SvelteKit frontend
- [ ] Configure TypeScript settings
- [ ] Set up environment variables structure (`.env.example`)
- [ ] Set up ESLint/Prettier for code quality
- [ ] Set up Supabase project and get connection credentials
- [ ] Initialize Supabase client in backend

### Expected Folder Structure
```
spur/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── prisma/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   ├── routes/
│   │   └── components/
│   └── package.json
├── .env.example
└── README.md
```

---

## 🗄️ Phase 2: Database Design & Persistence
**Estimated Time:** 1-2 hours

### Tasks
- [ ] Design database schema
- [ ] Create tables in Supabase (conversations, messages)
- [ ] Set up Row Level Security (RLS) policies (optional)
- [ ] Seed fictional store FAQ data
- [ ] Create data access layer using Supabase JS client

### Database Schema

```sql
-- Conversations Table
conversations (
  id          TEXT PRIMARY KEY,
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME,
  metadata    JSON (optional)
)

-- Messages Table
messages (
  id              TEXT PRIMARY KEY,
  conversationId  TEXT REFERENCES conversations(id),
  sender          TEXT CHECK(sender IN ('user', 'ai')),
  text            TEXT NOT NULL,
  timestamp       DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### FAQ/Domain Knowledge to Seed
- **Shipping Policy:** Free shipping over $50, 5-7 business days delivery
- **Return Policy:** 30-day returns, items must be unused
- **Support Hours:** Mon-Fri 9 AM - 6 PM EST
- **Store Info:** Fictional e-commerce store details

---

## ⚙️ Phase 3: Backend API Development
**Estimated Time:** 2-3 hours

### Tasks
- [ ] Create Express/Fastify server setup
- [ ] Implement `POST /chat/message` endpoint
- [ ] Create conversation service layer
- [ ] Create message repository
- [ ] Add input validation middleware
- [ ] Add error handling middleware
- [ ] Add request logging

### API Specification

#### `POST /chat/message`

**Request:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "reply": "We offer a 30-day return policy...",
  "sessionId": "generated-or-existing-session-id"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Validation Rules
- Reject empty messages → 400 Bad Request
- Truncate messages > 2000 characters (with warning)
- Validate sessionId format if provided
- Never crash on malformed input

---

## 🤖 Phase 4: LLM Integration
**Estimated Time:** 1-2 hours

### Tasks
- [ ] Create LLM service abstraction
- [ ] Integrate with OpenAI API (primary)
- [ ] Design system prompt
- [ ] Implement conversation history inclusion
- [ ] Inject FAQ/domain knowledge into prompt
- [ ] Add error handling (timeout, rate limit, API errors)
- [ ] Add token/cost control measures

### LLM Service Interface

```typescript
interface LLMService {
  generateReply(
    conversationHistory: Message[],
    userMessage: string,
    domainKnowledge: string
  ): Promise<string>;
}
```

### System Prompt Design

```
You are a friendly and helpful customer support agent for "ShopEase", 
a small e-commerce store. Answer questions clearly and concisely.

Store Knowledge:
- Shipping: Free shipping on orders over $50. Standard delivery 5-7 business days.
- Returns: 30-day return policy. Items must be unused with original packaging.
- Support Hours: Monday-Friday, 9 AM - 6 PM EST.
- Contact: support@shopease.com

Guidelines:
- Be helpful, friendly, and professional
- Keep responses concise (2-3 sentences when possible)
- If unsure, offer to connect with a human agent
- Never make up information not in your knowledge base
```

### Error Handling
| Error Type | User-Facing Message |
|------------|---------------------|
| API Timeout | "I'm having trouble thinking right now. Please try again in a moment." |
| Rate Limit | "We're experiencing high demand. Please wait a moment and try again." |
| Invalid Key | "There's a configuration issue. Please contact support." |
| Generic Error | "Something went wrong. Please try again." |

---

## 🎨 Phase 5: Frontend Chat UI
**Estimated Time:** 2-3 hours

### Tasks
- [ ] Create main chat page layout
- [ ] Build ChatWidget component
- [ ] Build MessageList component (scrollable)
- [ ] Build MessageBubble component (user vs AI styling)
- [ ] Build ChatInput component (input + send button)
- [ ] Implement API integration with backend
- [ ] Add auto-scroll to latest message
- [ ] Add "Agent is typing..." indicator
- [ ] Disable send button during request
- [ ] Handle and display error messages
- [ ] Persist sessionId in localStorage
- [ ] Load conversation history on page load

### Component Hierarchy
```
ChatPage
└── ChatWidget
    ├── ChatHeader
    ├── MessageList
    │   └── MessageBubble (multiple)
    └── ChatInput
```

### UX Requirements
- ✅ Enter key sends message
- ✅ Clear visual distinction: user (right, blue) vs AI (left, gray)
- ✅ Auto-scroll on new messages
- ✅ Loading state while AI responds
- ✅ Error toast/message on failures
- ✅ Responsive design (mobile-friendly)

---

## 🛡️ Phase 6: Robustness & Edge Cases
**Estimated Time:** 1 hour

### Test Cases to Cover
- [ ] Empty message submission → Show validation error
- [ ] Very long message (>2000 chars) → Truncate with warning
- [ ] LLM API timeout → Graceful error message
- [ ] LLM rate limiting → Friendly retry message
- [ ] Invalid/missing API key → Configuration error message
- [ ] Server crash recovery → Backend never crashes
- [ ] Invalid sessionId → Create new session gracefully
- [ ] Network failure → Frontend handles gracefully
- [ ] Rapid message sending → Queue or debounce
- [ ] Page refresh → Conversation history loads

### Security Checklist
- [ ] No hardcoded API keys in code
- [ ] `.env` in `.gitignore`
- [ ] Input sanitization (XSS prevention)
- [ ] Rate limiting on API endpoints (optional)

---

## 📝 Phase 7: Documentation & Polish
**Estimated Time:** 1 hour

### README.md Structure
- [ ] Project title and description
- [ ] Tech stack overview
- [ ] Prerequisites (Node.js version, etc.)
- [ ] Local setup instructions
  - [ ] Clone repo
  - [ ] Install dependencies
  - [ ] Configure environment variables
  - [ ] Run database migrations
  - [ ] Start backend server
  - [ ] Start frontend dev server
- [ ] Environment variables documentation
- [ ] Architecture overview with diagram
- [ ] LLM integration notes
- [ ] Trade-offs and assumptions
- [ ] "If I had more time..." section

### Files to Create
- [ ] `README.md` - Comprehensive documentation
- [ ] `.env.example` - Template for environment variables
- [ ] `ARCHITECTURE.md` - Optional deep dive

---

## ✅ Evaluation Criteria Mapping

| Criteria | How We Address It |
|----------|-------------------|
| **Correctness** | End-to-end testing, persistence verification |
| **Code Quality** | TypeScript, clear folder structure, separation of concerns |
| **Architecture** | Service layers, repository pattern, encapsulated LLM |
| **Robustness** | Comprehensive error handling, input validation |
| **UX Sense** | Modern chat UI, loading states, helpful AI personality |

---

## 🚀 Getting Started

Once this roadmap is approved, we'll proceed in order:

1. **Phase 1** → Set up the project skeleton
2. **Phase 2** → Database and data layer
3. **Phase 3** → Backend API
4. **Phase 4** → LLM integration
5. **Phase 5** → Frontend chat UI
6. **Phase 6** → Testing & hardening
7. **Phase 7** → Documentation

---

## 📌 Notes & Assumptions

- Using **Supabase** (PostgreSQL) for database - provides hosted DB, easy setup, and real-time capabilities
- OpenAI GPT-4 or GPT-3.5-turbo as primary LLM (Claude as backup option)
- No authentication required (as per assignment)
- Session management via localStorage + server-side persistence
- Monorepo structure with separate frontend/backend folders

---

*Last Updated: December 19, 2024*
