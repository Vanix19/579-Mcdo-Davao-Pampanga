# Manage Crew review and confirmed Time Arrangement

- Manage Crew now contains the crew roster, manual add/activate/deactivate controls, draft import, and editable review table.
- Weekly Crew TA is removed from the sidebar. Old links redirect to Manage Crew; existing saved drafts remain available.
- Confirming a valid reviewed import saves the crew profiles and redirects to Time Arrangement. That page shows confirmed Monday–Sunday availability above TA requests.
- Drafts are not displayed as confirmed availability.
- The review table uses compact weekday columns. Errors and notes appear below each row, so Sunday is not pushed out by a large notes column. Smaller screens can scroll horizontally; headers remain visible while scrolling vertically.
- The update retains weekday-based crew TA requests, FLEX, and CSV/TSV import support.

Deploy all included files into the matching crew_schedule_assistant directory. No crew CSVs or credentials are included. Existing database records are preserved.

Local checks passed for legacy-link redirects, manager access, review and confirmation controls, redirect to Time Arrangement after confirmation, seven-day availability display, parser validation, and existing weekday/date request behavior. Database calls were mocked. The update has not been deployed or visually verified in the live browser.
