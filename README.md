# University Service Charter & SLA Escalation Portal

Presentation-ready React + Vite + Tailwind CSS + Lucide proof of concept.

## Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

## Free deployment

- **Vercel:** Import the repository, select Vite (auto-detected), and deploy. Build command: `npm run build`; output directory: `dist`.
- **Netlify:** Import the repository, use build command `npm run build`, publish directory `dist`, and deploy.

## Demonstration script

1. Use the top persona switcher to present as Aarav Sharma or Dr. Priya Verma.
2. Submit a new service request and inspect the exact SLA deadline and ticket audit history.
3. Switch to L1 Resolver and pause/resume a ticket or resolve one with remarks.
4. Open **VC Demo Controls** and click **+ Fast-Forward 24 Hours** one or more times.
5. Switch to L2 Supervisor to view breached tickets and take corrective action.
6. Switch to VC Executive to inspect compliance KPIs, departmental performance, escalations, and Audit Trail.
7. Click **Reset Demo Data** to restore the original presentation state.

## Architecture and PoC constraints

- `src/data.js`: charter definitions, role definitions, seed tickets, time math, and deterministic escalation policy.
- `src/App.jsx`: application state, workflows, dashboards, forms, and event log.
- `src/styles.css`: Tailwind component styles.
- Data persists in browser `localStorage` under `university-sla-demo-v1`.
- The clock begins at 15 November 2026, 12:00 IST and increments each second. Fast-forward adds 24 virtual hours.
- SLA warnings occur at 80% elapsed. L2 escalation occurs at 100% elapsed; L3 at 200%. Paused time is excluded from the clock. All ticket events carry virtual timestamps.
- A file attachment stores **filename only**; no file contents are uploaded.
- Personas are a **demo switcher**, not authentication or authorization.
- Audit history is demonstrative and **not tamper-proof**: localStorage is user-editable. No real NAAC/UGC certification or compliance is claimed.
- The L2 corrective action records an official reprimand/reassignment instruction in the audit log. It does not change a named resolver because demo personas are fixed.

## Production migration

For Supabase/PostgreSQL, replace the `localStorage` state repository with a backend API and tables for `users`, `service_charter`, `tickets`, `ticket_events`, and `feedback`. Use server-side role-based access control, immutable audit event append, authenticated file storage, scheduled escalation jobs, transactional state transitions, and a trusted server clock. Real deployment must not expose the demo role switcher to unauthorized users.
