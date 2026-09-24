# DevDeck: your engineering command center

A personal developer operations platform: projects, tasks, recurring maintenance, calendar, week planner, bugs, roadmap, clients and tenants, deployments, notes, notifications and analytics, with a **Plan my day** button that suggests what to work on.

Stack: React + Vite (client) · Node + Express + Mongoose (server) · MongoDB · JWT auth.

## Run it locally

Requirements: Node 18+ and a MongoDB (local, or a free MongoDB Atlas cluster).

```bash
# 1. install
npm run install:all

# 2. configure the server
cp server/.env.example server/.env
#   set MONGO_URI and a long random JWT_SECRET (the file explains how)

# 3. (optional) demo data: CivicSlot, SecurRoute, Fleet SaaS, AgroNjangi
npm run seed          # login: donovan@devdeck.local / ChangeMe123!  (change it in Settings)

# 4. start both (two terminals)
npm run dev:server    # http://localhost:5000
npm run dev:client    # http://localhost:5173
```

Without the seed, open the app and use **First time here? Create the account**. Registration then closes automatically (single-user); set `ALLOW_REGISTER=true` to allow more accounts later. Every record already stores an `owner`, so multi-user support needs no schema change.

## What is where

```
server/src
  config/        env + database
  models/        13 Mongoose models (users, projects, tasks, bugs, features, clients, tenants,
                 deployments, maintenanceSchedules, calendarEvents, notifications, notes, activityLogs)
  controllers/   crud.js is a generic owner-scoped CRUD; the others add the special behaviour
  services/      health, project stats, planner (Plan my day), recurring maintenance, reminders
  routes/        all API routes (everything except /auth/login|register|forgot|reset needs a JWT)
  middleware/    auth, error handling
  seed/          demo data
client/src
  pages/         Dashboard, Projects, ProjectDetail (9 tabs), Tasks, Calendar, Week planner, ...
  components/    RecordForm + EntityPage (generic create/edit/list), Modal, QuickAdd, Search, ...
  entities.js    ONE config per record type: fields, columns. Add a field here and forms + tables get it.
  services/ hooks/ context/ layouts/ utils/ api/
```

## How the smart parts work

- **Plan my day** (`server/src/services/planner.js`): scores open tasks by priority, overdue days, due dates, scheduled today, maintenance/deployment, client requests, in-progress, project status and health, then fills your working hours (Settings). It only *suggests*: you remove, resize, then press **Add to today**, which schedules them around anything that already has a time.
- **Recurring maintenance** (`services/maintenance.js`): each schedule (daily, weekly, biweekly, monthly, or custom every N days) creates real Maintenance tasks up to 14 days ahead. This runs whenever the dashboard loads, so there is no cron job to set up. Completing one updates the project's *last maintenance* date and the history.
- **Recurring tasks**: set "Repeats" on any task; completing it creates the next one.
- **Project health** (`services/health.js`): critical bug or failed deployment → 🔴; overdue tasks, overdue maintenance or a deadline within 3 days → 🟡; otherwise 🟢. Override it any time in Edit project.
- **Reminders** (`services/reminders.js`): overdue tasks, maintenance today/tomorrow, deployments, deadlines, projects unmaintained for 30+ days, client renewals. They appear in the bell and Notifications page, each created once.
- **Search** covers projects, tasks, bugs, features, clients, tenants, deployments and notes. Searching a project name also returns its tasks, bugs, features and notes.

## Deploy

- **API** (Render or similar): root `server`, build `npm install`, start `npm start`. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL), `TIMEZONE`, `NODE_ENV=production`.
- **Client** (Vercel/Netlify): root `client`, build `npm run build`, output `dist`. Set `VITE_API_URL=https://YOUR-API/api`. Add a rewrite of all routes to `/index.html`.

## Notes and known limits

- **Password reset emails:** no mail server is configured. The reset link is printed in the server log (and shown on the page outside production). Put your provider in `server/src/services/mailer.js` to send real emails.
- **Logout** forgets the token on the device (stateless JWT).
- **Dates:** "days" are stored as calendar dates in your `TIMEZONE` (default Africa/Douala).
- Not built yet (by design, per the brief): GitHub integration, infrastructure monitoring, email/push notifications, file uploads for task attachments (links are supported).
- The Tasks list filters by project, status, priority and type. A date-range filter is available through the API (`?dateField=scheduledDate&from=&to=`) and used by the Week planner.
