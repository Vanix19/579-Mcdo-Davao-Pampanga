# CrewShift — McDonald's Employee Scheduling (local development)

Independent, unofficial local scheduling web application. The name and visual theme are for the requested scheduling concept and are not affiliated with or endorsed by McDonald's.

## Windows quick start
1. Install **Python 3.11 or newer** from https://www.python.org/downloads/ (enable **Add Python to PATH**).
2. Unzip the project. Double-click `start_windows.bat`.
3. The terminal shows a **randomly generated first-run manager password**; save it! Username: `admin` (unless set otherwise).
4. Open **http://127.0.0.1:5000** in your browser.
5. Log in as manager. Go to **Employees** to create crew accounts. Then add shifts or import an exported spreadsheet.
6. Go to **Account** to change the manager password. Shut down the server with Ctrl+C.

If Windows cannot find `py`, install Python launcher or replace `py -3` with `python` in the batch file.

## Spreadsheet integration: existing Google Sheet
Original link: https://docs.google.com/spreadsheets/d/1WFqS2dwMiESsFgGnLowfxCWYTJQCgREv521vuv_O4i0/edit?gid=0#gid=0

The original spreadsheet was **not accessible during project creation**. Its structure, employee names and headers could not be verified; **no real records have been invented**. This importer is **read-only with respect to Google Sheets** and does not modify the source.

Recommended import procedure:
1. Open the Google Sheet in an account with access.
2. In Google Sheets, choose **File → Download → Microsoft Excel (.xlsx)** for all tabs, or **File → Download → Comma Separated Values (.csv)** for the selected tab.
3. In CrewShift, go to **Employees** and add accounts matching the source full names or employee IDs. Employee passwords are local and are not taken from spreadsheet data.
4. Go to **Import spreadsheet**, upload the downloaded file, choose a tab, inspect actual headers/first five rows, map headers to name/employee ID/date/start/end/break/station/type/notes, and import. No source file is overwritten.
5. The importer **skips** unmatched employees, overlapping shifts, invalid records, and exact reimports, and logs import counts. Import does not delete or overwrite local shifts.
6. Optionally use **Try reading public Sheet CSV** for the supplied `gid` if your Google Sheet permissions allow anonymous export (this is **not** private-sheet OAuth integration).

**Supported structure:** Tabular schedule with one shift per row and actual work date and start/end time columns. More complex visual weekly rosters with merged cells, days-as-columns, split shifts in a single cell or header rows further down will need adaptation after the real document becomes available. Spreadsheet workbooks can contain many tabs; imported tabs are selectable.

**Breaks:** import values must be number of minutes. **Times:** 24-hour (`09:00`), 12-hour (`9:00 AM`), or Excel time values. **Dates:** ISO (`YYYY-MM-DD`) or common numeric English formats; ambiguous `01/02/2026` is interpreted **MM/DD/YYYY**. Confirm this matches your source before importing.

## Roles and features
- Crew members: secure login, weekly/monthly schedule, shift hours and notes, time-off request/history, request a shift swap, accept/decline incoming swaps, change password.
- Managers: every schedule, search/filter, create/edit/delete shifts, accounts, deactivate/reactivate and reset credentials, approve/decline time-off and swap requests with notes, export CSV, import CSV/XLSX.
- Approved time-off requests mark affected shifts **Time off**, not automatically reassign replacements. Managers must create coverage shifts manually.
- Approved shift swaps exchange shift ownership in one database transaction after coworker acceptance and overlap checks.
- Overnight shifts are supported; a shift ending at or before start is treated as ending on the next day. Hours = shift length - break minutes.
- SQLite saves data to `schedule.db`. Back up this file before major changes.

## Configuration
- `ADMIN_USERNAME` — manager account name created on first run (default `admin`).
- `ADMIN_PASSWORD` — first-run password (optional; if unset, one is printed in the console). Set **before** first run if desired.
- `SECRET_KEY` — **required before public deployment**; set to a strong, stable, random secret.
- `DATABASE_PATH` — SQLite database location.
- `PORT` — local TCP port (default `5000`).
- `FLASK_DEBUG=1` — debug mode only for local troubleshooting; **never set in production**.

Windows PowerShell example before launch (or create these variables in Windows settings):
```
$env:ADMIN_PASSWORD='Replace-With-A-Long-Unique-Password'
$env:SECRET_KEY='Replace-With-An-Unpredictable-Random-Secret'
python app.py
```

For online deployment, use a production WSGI server such as `waitress-serve --listen=127.0.0.1:5000 app:app`, a reverse proxy with HTTPS, stable `SECRET_KEY`, durable database backups, and appropriate access controls. For multiple web instances, migrate SQLite/session imports to PostgreSQL and server-side import storage. **Do not deploy this local demo to the public internet unchanged**; add login throttling, multi-factor authentication, audit logs, secure-cookie configuration, production error monitoring, and an organizational data-protection review. This project does **not** include a real Google Sheets write-back or Google OAuth service; adding those requires explicit authorization and API credentials.

## Running tests
```
python -m unittest discover -s tests -v
```
