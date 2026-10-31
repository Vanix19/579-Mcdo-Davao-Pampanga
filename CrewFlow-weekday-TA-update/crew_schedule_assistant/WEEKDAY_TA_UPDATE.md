# TA weekday selection

TA now uses Monday–Sunday checkboxes instead of a calendar. Crew must select at least one day and can select multiple days. One preferred shift (OPENER, MID, CLOSER, GY, or FLEX) and optional hours apply to all selected days.

The result is one repeating weekly TA request for manager review. Unselected days are not treated as rest days or overwritten. Approval remains a review status; the manager updates confirmed weekly availability separately.

Request Off retains its dated calendar. Historical dated TA requests remain readable.

Startup adds nullable requests.weekdays (an integer array, Monday=0 through Sunday=6) and allows requests.day to be null for new weekly TA. Existing request dates are preserved.

Extract the code-only ZIP into the matching repository folders and deploy the existing Render service. No crew names, availability CSVs, credentials, or database contents are included.

Local checks passed for seven weekday choices, multiple/all-day submission, empty and invalid weekday rejection, shift/FLEX validation, optional times, dated Request Off, admin weekday display, old TA rendering, and existing importer/calendar behavior. Database calls were mocked; this update has not been deployed or tested against live PostgreSQL.
