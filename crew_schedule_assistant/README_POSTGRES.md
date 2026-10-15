# CrewFlow — PostgreSQL edition

This edition uses PostgreSQL rather than SQLite. It preserves the McDo-inspired interface and original Flask routes.

## Render setup

- Runtime: Python
- Root Directory: `crew_schedule_assistant` (when uploading the contents of this ZIP into the repository root)
- Build Command: `pip install -r requirements.txt`
- Start Command: `waitress-serve --host=0.0.0.0 --port=$PORT app:app`
- Environment: `DATABASE_URL` (Render PostgreSQL Internal Database URL), `SECRET_KEY` (secure random string), `ADMIN_USERNAME` (optional; default `admin`), `ADMIN_PASSWORD` (required for initial administrator creation), `PYTHON_VERSION=3.12.10`.

The application creates its five tables automatically during startup. It does **not** automatically transfer old SQLite data. To preserve crew, requests, shifts, accounts, and upload references, back up the old SQLite database and migrate them before using the new version. Existing administrator passwords are stored as hashes in the old database.

**Note:** Uploaded schedule images are saved under `static/uploads` and are **not** made persistent by PostgreSQL. Render's ephemeral filesystem can erase them. Use a persistent object store before real-world use. Database backup, recovery, and hosting plan retention are separate considerations.

For deployments that already contain crew data, plan migration and avoid simultaneous writes to SQLite and PostgreSQL during cutover.


## Crew-entered full names
The public request form now accepts a typed full name instead of a dropdown.
Names matching an active registered crew member (case-insensitively) are linked
to that crew ID. Other names remain visible in the manager's request list
with an unmatched-name label, but are not automatically added to the crew
roster or eligible for recommendations. Managers should verify unmatched
requests before approving them. Name entry alone is not identity verification.
Earlier PostgreSQL requests are retained by an in-place schema update.
