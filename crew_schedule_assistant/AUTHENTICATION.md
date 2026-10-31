# Authentication and request flow

Reviewed against repository main commit 103c1fa2a7e1b8901f6222b076cbdd3b1d1496c0.

## Components

- Flask routes and the login_required decorator in app.py implement manager authentication.
- templates/login.html collects username and password; templates/base.html displays login/logout navigation.
- PostgreSQL admins stores a username and password_hash. Crew roster entries are not accounts.
- Werkzeug generate_password_hash and check_password_hash create and verify salted password hashes.
- Flask session stores the administrator ID in a signed client-side session cookie.

## Startup and credentials

DATABASE_URL is required and passed to psycopg.connect. This is the database connection credential, not a browser login token. Keep it in server environment variables.

init_db creates tables. If admins is empty, it requires ADMIN_PASSWORD, reads ADMIN_USERNAME (default admin), hashes the password, and inserts the administrator. Changing these environment variables later does not reset an existing administrator account.

SECRET_KEY signs session cookies. The current code has a known development fallback. A deployment must supply a strong random SECRET_KEY; otherwise an attacker who knows the fallback could forge an authenticated cookie. The key and database URL must never be sent to the browser.

## Login and protected requests

1. GET /login renders the form.
2. POST /login sends username and password as form fields. Use HTTPS.
3. The server looks up the username with a parameterized SQL query and verifies password_hash with check_password_hash.
4. Success clears the prior session, sets session['admin'] to the database administrator ID, and redirects to /admin. Failure displays a generic error.
5. Flask returns a signed session cookie. The cookie is signed, not encrypted; do not store passwords or other secrets in it.
6. On subsequent /admin requests, Flask validates the cookie signature. login_required checks whether session['admin'] is truthy before allowing the handler.
7. POST /logout clears the session and returns to the public form.

There are no JWTs, OAuth tokens, API bearer tokens, refresh tokens, or server-side session records in this app. The UUID used for an uploaded filename is not an authentication token.

## Crew requests and TA

GET / and POST /request are public. A typed full name is optionally matched to an active roster entry, case-insensitively. This is not identity verification; unmatched names are retained for review.

Time Arrangement adds a requested date, start time, end time, and reason. It uses the existing Pending / Approved / Rejected workflow. Earlier end times mean the following day; equal times are rejected. TA approval does not automatically add or change shifts, and does not count as approved leave.

The admin sidebar selects Dashboard, Crew Requests & TA, Schedule, Manage Crew, or Schedule Photos through /admin?section=... . Every section remains behind login_required; hiding a section is not the access-control mechanism.

## Existing security limitations

- No CSRF protection or login rate limiting.
- The session check does not reload the administrator record, so deleting an administrator does not immediately revoke an already-issued cookie.
- Logout clears the browser cookie but does not revoke copied cookies server-side.
- Cookie Secure and SameSite settings and a deliberate session-expiration policy are not configured explicitly.
- Crew have no authenticated accounts.
- Uploaded files are served through public static URLs; manager-only upload does not make viewing private.

## Documentation discrepancy

The original README described SQLite, DATABASE_PATH, and a demo default password. Current app.py uses PostgreSQL, requires DATABASE_URL, and requires ADMIN_PASSWORD when seeding an empty admins table. README_POSTGRES.md is the closer match. There is no working default administrator password hard-coded in the current application.
