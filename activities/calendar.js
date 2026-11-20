(() => {
  const calendar = document.querySelector('.activity-calendar');
  const view = calendar?.querySelector('.calendar-view');
  const agenda = calendar?.querySelector('.calendar-events');
  if (!view || !agenda) return;

  const events = new Map();
  const agendaRows = [...agenda.querySelectorAll('li')];
  for (const row of agendaRows) {
    const day = row.querySelector('time')?.dateTime;
    const label = row.querySelector('span')?.textContent.trim();
    if (!day || !label) continue;
    if (!events.has(day)) events.set(day, []);
    events.get(day).push(label);
  }

  const today = new Date();
  const month = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  const initial = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(calendar.dataset.month || '');
  if (initial) month.setFullYear(Number(initial[1]), Number(initial[2]) - 1, 1);
  const monthFormat = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' });
  const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'full' });

  view.innerHTML = `
    <div class="calendar-toolbar">
      <h3 class="calendar-month" id="activity-calendar-month" aria-live="polite"></h3>
      <div class="calendar-controls">
        <button type="button" aria-label="Previous month" data-step="-1">‹</button>
        <button type="button" aria-label="Next month" data-step="1">›</button>
      </div>
    </div>
    <table class="calendar-grid" aria-labelledby="activity-calendar-month">
      <thead><tr>${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        .map(day => `<th scope="col">${day}</th>`).join('')}</tr></thead>
      <tbody></tbody>
    </table>`;

  const heading = view.querySelector('.calendar-month');
  const body = view.querySelector('tbody');
  const empty = document.createElement('p');
  empty.className = 'calendar-empty';
  empty.textContent = 'No events listed for this month.';
  agenda.after(empty);

  function dayKey(date) {
    const year = String(date.getFullYear()).padStart(4, '0');
    const monthNumber = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${monthNumber}-${day}`;
  }
  const todayKey = dayKey(today);

  function renderMonth() {
    heading.textContent = monthFormat.format(month);
    const prefix = dayKey(month).slice(0, 7) + '-';
    for (const row of agendaRows) {
      row.hidden = !row.querySelector('time')?.dateTime.startsWith(prefix);
    }
    agenda.hidden = !agendaRows.some(row => !row.hidden);
    empty.hidden = !agenda.hidden;
    body.replaceChildren();
    const firstColumn = (month.getDay() + 6) % 7;
    const date = new Date(month);
    date.setMonth(date.getMonth() + 1, 0);
    const days = date.getDate();
    const cells = Math.ceil((firstColumn + days) / 7) * 7;
    let row;
    for (let cell = 0; cell < cells; cell++) {
      if (cell % 7 === 0) row = body.insertRow();
      const td = row.insertCell();
      const number = cell - firstColumn + 1;
      if (number < 1 || number > days) continue;
      date.setDate(number);
      const key = dayKey(date);
      const time = document.createElement('time');
      time.className = 'calendar-day';
      time.dateTime = key;
      time.textContent = String(number);
      if (key === todayKey) time.setAttribute('aria-current', 'date');
      td.append(time);
      const labels = events.get(key);
      if (labels) {
        td.classList.add('has-events');
        td.title = labels.join(' · ');
        td.setAttribute('aria-label', `${dateFormat.format(date)}. ${labels.join('. ')}`);
      }
    }
  }

  for (const button of view.querySelectorAll('button[data-step]')) {
    button.addEventListener('click', () => {
      month.setMonth(month.getMonth() + Number(button.dataset.step));
      renderMonth();
    });
  }
  renderMonth();
})();
