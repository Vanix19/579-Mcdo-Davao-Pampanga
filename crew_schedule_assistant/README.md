# CrewFlow – Scheduling Decision Support Prototype

A complementary tool for an existing crew schedule, **not a replacement scheduling system**.

> Current version uses PostgreSQL. See README_POSTGRES.md for setup,
> AUTHENTICATION.md for login/session behavior, and CHANGES_TA_SIDEBAR.md for the
> TA request and sidebar update. The SQLite instructions below are historical
> and do not apply to current app.py. DATABASE_URL is required; there is no
> hard-coded default admin password in the current application.

## New features
- Separate TA and Request Off buttons open individual calendar forms.
- TA offers OPENER, MID, CLOSER, or GY with optional exact hours.
- Admin sidebar separates Time Arrangement from Request Off & Other Requests.

## Included
- Public crew request form: Request Off, Giving, Swapping (date, reason, optional coworker).
- Admin login, request approvals/rejections, crew registry, activate/deactivate crew.
- Manually enter dated assignments from an existing roster.
- Count consecutive scheduled calendar days for each person; flag 6th and 7th+ days.
- Recommend active crew who are not already assigned or approved off, prioritizing those whose proposed shift is below Day 6.
- Upload schedule photos (JPG, PNG, WEBP) as reference files. **No automatic reading/OCR**: schedule shifts must be entered separately.

## Run locally

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
# Windows PowerShell example:
$env:SECRET_KEY="replace-with-a-long-random-secret"
$env:ADMIN_PASSWORD="your-strong-admin-password"
python app.py
```
Open http://localhost:5000. Manager page is `/login`. If you didn't set ADMIN_PASSWORD when first starting with a NEW database, the demo default is **admin / ChangeMe123!**. CHANGE IT before any deployment. Admin credentials are seeded **only when the database is first created**. To reset a demo database, delete `crewflow.sqlite3` (deletes data).

## Render deployment
- New Web Service with Python runtime, repository root set to this folder.
- Build command: `pip install -r requirements.txt`
- Start command: `waitress-serve --host=0.0.0.0 --port=$PORT app:app`
- Set environment variables: `SECRET_KEY`, `ADMIN_PASSWORD`; optional `DATABASE_PATH`.
- For retained production data, use a persistent disk for SQLite via `DATABASE_PATH` and upload storage or migrate to hosted database/object storage. **Render ephemeral filesystem can delete SQLite data and uploaded photos on redeploy/restart.** A managed database and durable image storage are recommended for production.

## Important limits
- This is a demonstration/MVP, not production-hardened: add CSRF protection, rate limiting, per-crew authentication, stronger input and upload content validation, detailed change logs, and persistent storage before real-world use.
- Anyone visiting the form can submit on behalf of a crew name; use crew accounts or verified links in production.
- Day streak uses consecutive **assigned calendar days** ending on the chosen date. It does not calculate hours, pay, legal seventh-day obligations, overnight shifts, skills, minimum rest, or overtime.
- A photo upload is **only a visual reference** and does NOT populate shifts automatically.
- Recommendations are advisory; managers must confirm competency, actual availability, and company policy.
- For accurate alerts, enter ALL relevant preceding shifts, not only the current date. E.g., a Day 7 warning requires that the preceding six days be present in the system.
- Admin approval of request doesn't auto-modify roster or coworkers' consent; changes are manually reflected.

