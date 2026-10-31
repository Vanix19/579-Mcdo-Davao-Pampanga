(() => {
  const input = document.getElementById('selectedDate');
  const days = document.getElementById('calendarDays');
  const title = document.getElementById('monthTitle');
  let selected = input.value;
  let view = new Date(selected + 'T12:00:00');
  view.setDate(1);
  const iso = (y, m, d) => [y, String(m+1).padStart(2,'0'), String(d).padStart(2,'0')].join('-');
  function render() {
    days.replaceChildren();
    title.textContent = view.toLocaleDateString(undefined, {month:'long',year:'numeric'});
    const year = view.getFullYear(), month = view.getMonth();
    for (let i=0; i<view.getDay(); i++) {
      const blank = document.createElement('span');
      blank.setAttribute('aria-hidden','true');
      days.append(blank);
    }
    for (let day=1; day<=new Date(year,month+1,0).getDate(); day++) {
      const value = iso(year,month,day);
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = day;
      button.setAttribute('aria-label',new Date(value+'T12:00:00').toLocaleDateString(undefined,{dateStyle:'full'}));
      button.setAttribute('aria-pressed',String(value===selected));
      button.addEventListener('click',()=>{
        selected = input.value = value;
        render();
        days.querySelector('[aria-pressed="true"]').focus();
      });
      days.append(button);
    }
  }
  document.getElementById('prevMonth').addEventListener('click',()=>{view.setMonth(view.getMonth()-1);render();});
  document.getElementById('nextMonth').addEventListener('click',()=>{view.setMonth(view.getMonth()+1);render();});
  input.addEventListener('change',()=>{
    if (!input.value) return;
    selected=input.value;view=new Date(selected+'T12:00:00');view.setDate(1);render();
  });
  const start=document.getElementById('startTime'), end=document.getElementById('endTime');
  if(start && end) {
    const sync=()=>{
      start.required=!!end.value;end.required=!!start.value;
      end.setCustomValidity(start.value && start.value===end.value ? 'Start and end times must be different.' : '');
    };
    start.addEventListener('input',sync);end.addEventListener('input',sync);
  }
  document.getElementById('calendar').classList.remove('hidden');
  render();
})();
