function generateCalendar() {
    const calendar = document.getElementById('calendar-display');
    calendar.innerHTML = '';
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysinMonth = new Date(year, month + 1, 0).getDate();

    document.getElementById('current-month').textContent = now.toLocaleString('default', {month: 'long', year: 'numeric'});
    const firstDay = new Date(year, month, 1).getDay();

    for (let i = 0; i < firstDay; i++) {
        const emptycell = document.createElement('div');
        emptycell.className = 'calendar-day';
        calendar.appendChild(emptycell);
    }

    for (let day = 1; day <= daysinMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);

        const hasCompletions = habits.some(habit =>
                habit.completions?.includes(dateStr)
        );

        if (hasCompletions) {
            const activityDot = document.createElement('div');
            activityDot.className = 'activity-dot';
            dayCell.appendChild(activityDot);
        }

        const today = new Date();
        if (today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year) {
            dayCell.classList.add('active');
        }
        calendar.appendChild(dayCell);
    }

}

