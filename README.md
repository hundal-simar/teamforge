# TeamForge

A real-time collaborative project management tool — Kanban boards with live updates, threaded comments with @mentions, notifications, and role-based workspace management.

**Live demo:** teamforge-psi-nine.vercel.app
**Backend API:** https://teamforge-backend-z2ct.onrender.com

---

## Features

### Workspaces & Projects
- Multi-workspace support — create and switch between workspaces from a dashboard
- Role-based access control (owner / admin / member) enforced at the middleware level
- Email invitations with secure, expiring tokens — auto-joins invited users after registration
- Workspace settings: rename, manage member roles, remove members, delete workspace (with confirmation dialogs on destructive actions)

### Kanban Boards
- Drag-and-drop task management using **fractional indexing** — reordering a task only touches its own `order` value, never requires re-indexing an entire column
- Configurable columns per project (not a hardcoded status enum)
- Optimistic UI updates with automatic rollback on failure
- Client-side filtering by assignee, priority, and label
- Responsive board with horizontal scroll-snap on mobile

### Real-Time Collaboration
- Socket.io-powered live updates — task moves, new comments, and subtask changes appear instantly for every viewer, no refresh needed
- Per-project presence indicator ("3 people viewing")
- Live notification center with @mention and assignment alerts, grouped by date
- Comments update live in an open task thread when a teammate posts

### Task Details
- Rich task modal: description, priority, due date, assignee, labels
- Subtask checklists with live progress count
- File attachments via Cloudinary (images + PDFs), with server-side validation and automatic cleanup
- Threaded comments with @mention autocomplete (keyboard navigable)

### Performance & Reliability
- Redis-backed caching on the board endpoint with **write-through invalidation** — busted immediately on any task mutation, not just a TTL
- Background job queue (BullMQ + Redis) for invite emails and due-date reminders — the request/response cycle never blocks on email delivery
- Scheduled cron job scans for upcoming due dates and queues reminder emails, with duplicate-send protection
- Rate limiting: strict limits on auth routes (brute-force protection), looser limits on general API routes
- Response compression for reduced payload size

### Activity & Notifications
- Polymorphic activity log (tasks, projects, workspaces) queried via a MongoDB aggregation pipeline with pagination
- Personal, per-user notification center (mentions, assignments) — read/unread state, mark-all-as-read

### Testing
- Jest + Supertest integration test suite covering:
  - Auth flow (register, login, refresh, protected routes)
  - RBAC (non-owners cannot change member roles)
  - Task permissions (non-members cannot access or modify project tasks)
- `mongodb-memory-server` for isolated test runs — no real database touched

---

## Tech Stack

**Frontend**
- React + Redux Toolkit
- Tailwind CSS
- `@dnd-kit` (drag-and-drop)
- Socket.io-client
- React Hook Form + Zod

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- Redis (`ioredis`) — caching + BullMQ backing store
- BullMQ — background job queue
- Cloudinary — file storage
- Nodemailer — transactional email
- JWT (access + refresh tokens), bcrypt
- Zod — request validation

**Testing & Tooling**
- Jest, Supertest, `mongodb-memory-server`
- `node-cron` — scheduled jobs

---

## Architecture Highlights

A few design decisions worth calling out:

- **Fractional indexing for task ordering** — instead of storing task order as sequential integers (requiring a shift of every row below on each move), each task's `order` is a float computed as the midpoint between its two neighbors. This makes reordering an O(1) write. A periodic re-normalization pass is a known follow-up if floats get too tight after many reorders in the same gap.
- **Polymorphic activity logging** — a single `ActivityLog` collection references tasks, projects, or workspaces via `entityType` + `entityId`, avoiding a separate log table per resource.
- **Socket rooms scoped per-project and per-user** — task/comment events broadcast only to sockets in `project:<id>`, and notifications broadcast only to `user:<id>` — preventing cross-project noise and ensuring per-user data never leaks to other connected clients.
- **Write-through cache invalidation** — the board endpoint's Redis cache is busted immediately after every mutation that affects it (task create/update/move/delete, column changes), not left to expire on a TTL alone.
- **Middleware-layered permission checks** — `isMember` / `isOwner` / `isProjectMember` / `isTaskMember` each resolve the correct workspace context depending on how many references deep the requested resource sits (task → project → workspace), rather than duplicating permission logic in every controller.

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- A Cloudinary account
- A Gmail account with an App Password (for Nodemailer)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

REDIS_URL=your_redis_connection_string

GMAIL_USER=youraddress@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=development
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

### Running Tests

```bash
cd backend
npm test
```

---

## Project Structure

```
backend/
  config/          # DB, Redis, Cloudinary config
  controllers/      # Route handlers
  middlewares/       # Auth, RBAC, validation, rate limiting
  models/          # Mongoose schemas
  queues/          # BullMQ queue + worker
  jobs/            # Scheduled cron jobs
  routes/          # Express routers
  services/         # Activity logging, notifications, auth, workspace
  socket/          # Socket.io server + room logic
  utils/           # Cache wrapper, mailer, ordering helpers
  validators/        # Zod schemas
  tests/           # Jest + Supertest suite

frontend/
  src/
    components/      # Reusable UI components
    pages/          # Route-level pages
    context/         # Auth + Socket context providers
    features/        # Redux Toolkit slices
    api/            # Axios instance
    utils/           # Fractional ordering helper
```

---

## What I'd Improve Next

- Renormalize task `order` values periodically once floats get imprecise after many reorders in the same gap
- Deduplicate due-date reminder emails more robustly across timezone edge cases
- Add e2e tests (Playwright/Cypress) on top of the existing integration suite
- Move avatar/attachment uploads to direct-to-Cloudinary signed uploads to reduce backend load

---

