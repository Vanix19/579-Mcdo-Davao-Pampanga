"""Parse reviewed weekly availability; unknown handwriting must be corrected."""
import csv
import io

DAYS = ('mon','tue','wed','thu','fri','sat','sun')
PERIODS = ('OPENER','MID','CLOSER','GY')
ALIASES = {'O':'OPENER','OPENER':'OPENER','MID':'MID','CL':'CLOSER','CLOSER':'CLOSER','GY':'GY'}
LABELS = ('O','MID','CL','GY','FLEX','RD','O/MID','O/CL','O/GY','MID/CL','MID/GY','CL/GY',
          'O/MID/CL','O/MID/GY','O/CL/GY','MID/CL/GY','O/MID/CL/GY')

def csv_from_grid(form):
    names=form.getlist('crew_name')
    included=set(form.getlist('include'))
    columns={key:form.getlist(key) for key in ('source_row','notes',*DAYS)}
    if len(names)>200 or any(len(values)!=len(names) for values in columns.values()):
        raise ValueError('The review table is incomplete. Preview the CSV again.')
    output=io.StringIO()
    writer=csv.DictWriter(output,fieldnames=('source_row','name',*DAYS,'notes'))
    writer.writeheader()
    for index,name in enumerate(names):
        if str(index) in included:
            writer.writerow({'name':name,**{key:values[index] for key,values in columns.items()}})
    return output.getvalue()

def parse_periods(value):
    value = value.strip().upper()
    if value == 'FLEX':
        return list(PERIODS)
    if value == 'RD':
        return []
    parts = [p.strip() for p in value.split('/')]
    if not parts or any(p not in ALIASES for p in parts):
        raise ValueError('Use O, MID, CL, GY, FLEX, RD, or combinations such as O/MID.')
    chosen = {ALIASES[p] for p in parts}
    return [p for p in PERIODS if p in chosen]

def parse_csv(text):
    if len(text.encode('utf-8')) > 128_000:
        raise ValueError('The CSV must be smaller than 128 KB.')
    text=text.lstrip('\ufeff\r\n ')
    reader=None
    # Use the header, not the data: names and notes can contain commas.
    for delimiter in (',','\t',';'):
        candidate=csv.DictReader(io.StringIO(text),delimiter=delimiter)
        fields=[field.strip().lower().lstrip('\ufeff') for field in (candidate.fieldnames or [])]
        if len(fields)==len(set(fields)) and {'name',*DAYS}.issubset(fields):
            candidate.fieldnames=fields
            reader=candidate
            break
    if reader is None:
        raise ValueError('Use a comma-separated CSV file or paste tab-separated cells from Excel. Required headers: name, mon, tue, wed, thu, fri, sat, sun (no duplicates). If the columns became spaces, upload the original CSV file instead.')
    rows, seen = [], set()
    for number, raw in enumerate(reader, 2):
        if number > 201:
            raise ValueError('Import at most 200 crew at a time.')
        name = ' '.join((raw.get('name') or '').split())
        errors = []
        if None in raw or any(raw.get(day) is None for day in DAYS):
            errors.append('Wrong number of CSV columns.')
        if not name or len(name)>120 or '?' in name:
            errors.append('Confirm the full name and remove any question mark.')
        key = name.casefold()
        if key in seen:
            errors.append('Duplicate crew name in this file.')
        seen.add(key)
        labels, periods = {}, {}
        for day in DAYS:
            labels[day] = (raw.get(day) or '').strip().upper()
            try:
                periods[day] = parse_periods(labels[day])
            except ValueError:
                errors.append(day.upper()+': unclear or missing availability.')
        rows.append(dict(name=name,source_row=raw.get('source_row') or str(number-1),
                         labels=labels,periods=periods,errors=errors,notes=raw.get('notes') or ''))
    if not rows:
        raise ValueError('The CSV contains no crew.')
    return rows

def save_rows(connection, rows):
    """Caller owns one transaction, so every crew/day is saved or none are."""
    if not rows or any(row['errors'] for row in rows):
        raise ValueError('Correct every flagged entry before saving.')
    created = 0
    for row in rows:
        matches = connection.execute(
            'SELECT id FROM crew WHERE lower(trim(name))=lower(%s)',(row['name'],)).fetchall()
        if len(matches)>1:
            raise ValueError('Multiple existing crew match '+row['name']+'. Resolve the duplicate first.')
        if matches:
            cid = matches[0]['id']
        else:
            cid = connection.execute('INSERT INTO crew(name,role) VALUES (%s,%s) RETURNING id',
                                     (row['name'],'Crew')).fetchone()['id']
            created += 1
        for weekday, day in enumerate(DAYS):
            connection.execute(
                """INSERT INTO crew_weekly_availability(crew_id,weekday,periods,source_label)
                   VALUES (%s,%s,%s,%s) ON CONFLICT(crew_id,weekday)
                   DO UPDATE SET periods=EXCLUDED.periods, source_label=EXCLUDED.source_label,
                                 updated_at=CURRENT_TIMESTAMP""",
                (cid,weekday,row['periods'][day],row['labels'][day]))
    return created
