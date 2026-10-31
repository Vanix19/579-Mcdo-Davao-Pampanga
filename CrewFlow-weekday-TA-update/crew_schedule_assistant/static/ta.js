(() => {
  const days = [...document.querySelectorAll('input[name="weekdays"]')];
  const summary = document.getElementById('workdaySummary');
  function syncDays() {
    const selected = days.filter(day => day.checked);
    days[0].setCustomValidity(selected.length ? '' : 'Choose at least one workday.');
    summary.textContent = selected.length
      ? selected.map(day => day.closest('label').querySelector('span').textContent).join(', ')
      : 'No workdays selected.';
  }
  days.forEach(day => day.addEventListener('change', syncDays));
  syncDays();
  const start = document.getElementById('startTime'), end = document.getElementById('endTime');
  function syncTimes() {
    start.required = !!end.value;
    end.required = !!start.value;
    end.setCustomValidity(start.value && start.value === end.value ? 'Start and end times must be different.' : '');
  }
  start.addEventListener('input', syncTimes);
  end.addEventListener('input', syncTimes);
})();
