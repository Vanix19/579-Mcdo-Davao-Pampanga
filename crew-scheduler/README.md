# CrewFlow — McDonald's Crew Scheduling & Shift Request Management

An **independent educational project**, not affiliated with or endorsed by McDonald's.

## Requirements

- Windows 10/11, Node.js **20 or newer**, npm, a web browser.
- For Google Sheets mode: a Google Cloud project with Sheets API enabled, a service account and access to the target spreadsheet.

## Quick start (local demo)

1. Open this project folder in VS Code or PowerShell.
2. Copy `.env.example` to `.env` (`copy .env.example .env`).
3. Change `JWT_SECRET` to a long random string, and change `BOOTSTRAP_MANAGER_PASSWORD` to a strong password.
4. Run `npm run install:all`.
5. Run `npm run dev`.
6. Open **http://localhost:5173**.
7. Sign in as `manager@example.test` using the password in `.env`.
8. Open **Crew Management → Create account** to assign a login to a demo crew member; sign out to test crew role.

The demo contains fictitious crew members and simulated shifts. It saves test changes to `server/demo-data.json` (automatically generated). **Never use these fictitious records as actual employee data.**

## Configure your actual Google Sheet

The supplied Google Sheet could not be read publicly when this project was prepared, so its real tabs/headers were **not verified**. The integration discovers existing tabs and searches for common crew headers at startup. Do **not** assume the sample data matches your actual spreadsheet.

1. Open https://console.cloud.google.com/ and enable **Google Sheets API** for your Google Cloud project.
2. Create a service account, then obtain its email and private key (store them only in `.env`, never in client code).
3. Share your existing spreadsheet with the service account email as **Editor**. Preserve existing source data.
4. Set `SHEETS_MODE=google`, `GOOGLE_SERVICE_ACCOUNT_EMAIL=...`, `GOOGLE_PRIVATE_KEY=...` (the key can contain literal `\\n` escapes), and `GOOGLE_SHEET_ID=1WFqS2dwMiESsFgGnLowfxCWYTJQCgREv521vuv_O4i0` in `.env`.
5. If your roster resides in a particular tab, optionally set `CREW_SOURCE_TAB=YourTabName`.
6. Run `npm run dev` again. The backend creates **separate** `users`, `shifts`, `requests`, `notifications` and `audit` tabs **if missing**. Existing crew source rows and column names are never rewritten by this application.
7. As manager, go to **Settings → Inspect spreadsheet mapping** to view discovered tabs and matched columns. If required name/ID headers are unrecognized, update `CREW_SOURCE_TAB` or the `aliases` mapping in `server/store.js` and restart.

**Important:** If the source sheet has no consistent unique employee ID column, fallback row-based IDs (`ROW-2`, etc.) will be used. These are fragile if source rows are moved, so introduce stable IDs in the source spreadsheet **only with the owner's permission** before production usage. Existing sheet tab names `users`, `shifts`, `requests`, `notifications`, `audit` are reserved; if your spreadsheet already uses them for other content, **make a copy or rename configuration before connecting**. This app does not overwrite the header when the tab already exists, but its schema assumes these names and columns.

## Core workflows

- **Manager:** create crew login accounts, assign/edit/clear roster shifts, save drafts, publish weekly roster, inspect warnings, review requests, approve/reject, export requests CSV or print roster.
- **Crew:** view published shifts, request a day off or swap, inspect request status and notifications.
- **Day off approval:** cancels shifts assigned on requested date. **Swap approval:** exchanges the requester's shift on the original date with the selected coworker's published shift on the replacement date. Approval checks that both shifts exist and neither assignment conflicts. If a coworker has not agreed, the manager must independently confirm their consent before approval.
- **6th/7th-day recommendations:** calculated from dated assignments including previous weeks. Drafts count as projected work; published assignments count as confirmed scheduled work. Actual attendance is not captured by this system and must not be inferred from scheduled shifts.

## Architecture

`React + Vite browser → Express REST API (JWT auth / role checks) → store service → Google Sheets API`

Modules: `server/index.js` (REST routes, auth, approvals), `server/store.js` (Google Sheets adapters and demo persistence), `server/rules.js` (consecutive-day analysis), `client/src` (responsive React UI).

## Important production limitations / security checklist

- This is a locally runnable prototype, **not a certified production HR system**. The Google Sheets API is not a transactional relational database. Multi-step swap approvals and concurrent updates from different servers may partially apply. For real deployment, implement distributed locking, idempotency and rollback/reconciliation, or move transactional data to PostgreSQL.
- Sheets holds hashed account passwords, but other employee and shift data remain readable to everyone with Editor/Viewer access to the underlying spreadsheet. Restrict sheet sharing and Google service-account permissions. Never commit `.env` or service-account JSON.
- `JWT_SECRET` must be randomly generated and kept private. Use HTTPS when deployed; enforce allowed CORS origins and production security headers. Disable bootstrap manager credentials after setup.
- This prototype has account creation but no password-reset/change screens, shift-swap recipient acceptance, attendance data, SMS/email delivery, or fully validated labor-policy rules. Add these before operational use.
- Do not put actual employee contact details in public links. Test the system using fictitious crew data first and seek company permission before operating with real staff records or brand identity.


## Photo roster import (manager only)
Enable the **Google Cloud Vision API** in your Google Cloud project and grant the existing service-account permission to invoke it; keep credentials on the server. The manager can use **Import Schedule Photo** to upload JPG/PNG/WebP (up to 7 MB). OCR does not guarantee correct extraction: currently it only recognizes lines in the explicit format `Full Name 2026-10-19 08:00-16:00`, with an exact crew-name match. An arbitrary photographed weekly table may not parse; use the Weekly Scheduling editor for those rows. The manager must review every proposed assignment, correct/delete rows, then explicitly save them as **drafts**. The application checks for duplicate assignments and refreshes consecutive-day recommendations; it does not auto-publish. Do not upload sensitive real schedules until credentials, permissions and retention have been evaluated.

## Request types
Crew can submit **Request Off**, **Giving** (offer their published shift to another crew member), or **Swapping** (exchange published shifts). Manager approval is required before any schedule updates.
