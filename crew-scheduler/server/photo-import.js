// Conservative parser: does not guess ambiguous roster tables. Manager reviews all imported rows.
const clean=s=>s.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
function parseRoster(text,crew){const rows=[];const pattern=/(\d{4}-\d{2}-\d{2})\s+([01]\d|2[0-3]):([0-5]\d)\s*[-–—]\s*([01]\d|2[0-3]):([0-5]\d)/;
 for(const line of text.split(/\r?\n/)){const m=line.match(pattern);if(!m)continue;const name=clean(line.slice(0,m.index));const person=crew.find(c=>clean(c.name)===name);if(!person)continue;const start=m[2]+':'+m[3],end=m[4]+':'+m[5];if(start>=end)continue;rows.push({employeeId:person.id,name:person.name,date:m[1],start,end,station:person.position||''})}return rows;}
module.exports={parseRoster};
