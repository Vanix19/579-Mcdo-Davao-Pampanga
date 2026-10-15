const d=s=>new Date(`${s}T12:00:00Z`);
const iso=x=>new Date(x).toISOString().slice(0,10);
const plus=(s,n)=>iso(d(s).getTime()+n*86400000);
function analyze(crew,shifts,start,days=14){
 const active=shifts.filter(s=>s.employeeId===crew.id&&s.status!=='cancelled');
 const dates=new Set(active.map(s=>s.date));
 const output=[];
 for(let i=0;i<days;i++){
  const date=plus(start,i);if(!dates.has(date))continue;
  let count=1;for(let j=1;j<100&&dates.has(plus(date,-j));j++) count++;
  const s=active.filter(x=>x.date===date);
  output.push({date,count,actual:date<=iso(Date.now()),published:s.every(x=>x.published),shift:s.map(x=>`${x.start}-${x.end}`).join(', ')});
 }
 const max=Math.max(0,...output.map(x=>x.count));
 const issues=[];
 for(const [date,arr] of Object.entries(Object.groupBy(active,x=>x.date))){
  if(arr.length>1)issues.push({date,message:'Multiple shifts assigned on the same date'});
  if(arr.some(x=>x.end<=x.start))issues.push({date,message:'Shift end must be after start (overnight shifts not configured)'});
 }
 return {employeeId:crew.id,name:crew.name,position:crew.position,max,days:output,issues,level:max>=7?'urgent':max>=6?'warning':'available',nextOff:(()=>{for(let i=0;i<14;i++){let date=plus(start,i);if(!dates.has(date))return date}return null})()};
}
function recommendations(crew,shifts,start){return crew.filter(x=>x.status!=='Inactive').map(x=>analyze(x,shifts,start));}
module.exports={plus,iso,analyze,recommendations};
