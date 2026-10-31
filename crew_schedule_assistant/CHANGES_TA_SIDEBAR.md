# Separate TA and Request Off calendars

## Latest update

The crew home page now offers two buttons: TA and Request Off. Each opens its own monthly calendar and form. Select one date per request; use the arrows to move between months or use the date field.

TA requires OPENER, MID, CLOSER, or GY. Exact start/end hours are optional; no store-specific hours are assumed. If supplied, both times must be valid and different. Request Off has no shift or hours fields.

The manager sidebar separates Time Arrangement from Request Off & Other Requests. Existing Giving and Swapping requests remain reviewable under Other Requests, and older TA records without a shift label still display.

Startup also adds a nullable shift_period column using ADD COLUMN IF NOT EXISTS. This preserves all prior requests. No additional dependencies are required.

Checks passed: six sidebar sections, separate crew forms, all four TA choices, optional/invalid/overnight hours, Off field isolation, legacy TA display, manager access controls, admin list filtering and approval return navigation. Calendar checks passed for leap years, date selection, focus, month/year changes, and optional time validation. Database calls are mocked; real PostgreSQL migration and browser layout remain unverified. Nothing has been pushed or deployed.

The notes below describe the original version; this latest update supersedes its combined request form and five-section navigation.

- Crew can select Time Arrangement (TA), enter a date, start/end times, and reason.
- Managers review TA requests in Crew Requests & TA using the existing approval controls.
- Overnight ranges are marked (+1 day); equal start/end times are rejected.
- TA is a request for preferred hours, not an automatic roster assignment or recurring availability.
- The sidebar shows separate pages for Dashboard, Crew Requests & TA, Schedule, Manage Crew, and Schedule Photos. Navigation wraps on small screens.
- Startup adds nullable start_time and end_time columns to requests using ALTER TABLE ... ADD COLUMN IF NOT EXISTS. Existing requests are preserved.

## Deploy on Render

Replace the application source with this folder's contents, preserving your service's existing root-directory setting. Keep DATABASE_URL, SECRET_KEY, and the existing PostgreSQL database. Do not delete or recreate the database. Back it up before deployment.

Use pip install -r requirements.txt for the build and the existing Waitress start command. The database user needs permission to alter requests. On startup, the application adds the two optional time columns.

The existing administrator password hash is retained. Setting ADMIN_PASSWORD again does not reset it.

After deployment, submit a TA request in a staging environment, check that the time range appears under Crew Requests & TA, and verify the approval control and all sidebar pages.

## Verification

Local checks passed: Python syntax; unauthenticated manager-route redirects; invalid TA time rejection; daytime and overnight request inserts; all five sidebar template sections; crew form rendering. Database calls were mocked. A real PostgreSQL migration and browser layout of this changed version have not been verified. The live app was inspected without changing business records.
