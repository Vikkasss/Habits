// import './calendar'
// import './app'

const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();


let habits = [];
let tasks = [];
let userId = ''
const storageKey = {
    habits: 'habits',
    tasks: 'tasks'};

const views = {
    habits: document.getElementById('habits-view'),
    calendar: document.getElementById('calendar-view'),
    add: document.getElementById('add-view'),
    tasks: document.getElementById('tasks-view'),
}
const buttons = {
    habits: document.getElementById('habits-btn'),
    calendar: document.getElementById('calendar-btn'),
    add: document.getElementById('add-btn'),
    tasks: document.getElementById('tasks-btn'),
}

async function initApp() {
    userId = tg.initDataUnsafe.user?.id || 'anonymous';
    await loadHabits();
    setupViewNavigation();
    document.getElementById('add-habit-btn').addEventListener('click', () => switchView('add'));
    document.getElementById('save-btn').addEventListener('click', saveNewHabit);
    document.getElementById('cancel-btn').addEventListener('click', () => switchView('habits'));

    generateCalendar();

    renderHabits();
    // renderTasks();
}

async function loadHabits() {
    try {
        const data = await tg.CloudStorage.getItem(storageKey.habits);
        if (data) {
            habits = JSON.parse(data);
        } else {
            habits = [];
            await saveHabits();
        }
    } catch (error) {
        console.error('Error loading habits', error);
        tg.showPopup({
            title: 'Error',
            message: 'Failed to load habits. Please try again.',
            buttons: [{id: 'ok', type: 'default', text: 'OK'}]
        });
    }
}

async function saveHabits() {
    try {
        await tg.CloudeStorage.setItem(storageKey.habits, JSON.stringify(habits));
    } catch (error) {
        console.error('Error saving habits:', error);
        tg.showPopup({
            title: 'Error',
            message: 'Failed to save habits. Please try again.',
            buttons: [{ id: 'ok', type: 'default', text: 'OK' }]
        });
    }
}

function renderHabits() {
    const habitsList = document.getElementById('habits-list');

    if (habits.length === 0) {
        habitsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No habits yet</p>
                <p>Click the + button to add your first habit</p>
                </div>
            `;
        return;
    }

    habitsList.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];

    habits.forEach(habit => {
        const isCompletedToday = habit.completions?.includes(today);
        const habitItem = document.createElement('li');
        habitItem.className = 'habit-item';
        habitItem.innerHTML = `
        <div class='habit-info'>
            <div class='habit-name'>
            <div class='habit-meta'>
                <span class='strak-badge'> ${habit.streak || 0} day streak </span> 
            </div>
                <span>Last: ${habit.lastCompleted || 'Never'}</span>
            </div> 
            <div class='habit-actions'>
                <button class="action-btn complete-btn" data-id="${habit.id}">
                    ${isCompletedToday ? '✓' : '○'}
                </button>
                <button class="action-btn delete-btn" data-id="${habit.id}">✕</button>
            </div>
        </div>`
        habitsList.appendChild(habitItem);
    });

    document.querySelectorAll('.complete-btn').forEach(button => {
        button.AddEventListener('click', toggleHabitCompletion);
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteHabit);
    });
}

async function toggleHabitCompletion(event) {
    const habitId = event.target.dataset.id;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];

    if (!habit.completions) {
        habit.completions = [];
    }

    if (habit.completions.includes(today)) {
        habit.completions = habit.completions.filter(date => date !== today);
        habit.streak = Math.max(0, habit.streak - 1);
    } else {
        habit.completions.push(today);
        habit.lastCompleted = today;

        if (habit.lastCompleted && isYesterday(habit.lastCompleted)) {
            habit.streak = (habit.streak || 0) + 1;
        } else {
            habit.streak = 1;
        }
    }
    await saveHabits();
    renderHabits();
    generateCalendar();
}

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

function isYesterday(dateString) {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
}

function setupViewNavigation() {
    Object.keys(buttons).forEach(view => {
        buttons[view].addEventListener('click', () => switchView(view));});
}

function switchView(view) {
    // Remove active class from all views and buttons
    Object.values(views).forEach(v => v.classList.remove('active'));
    Object.values(buttons).forEach(b => b.classList.remove('active'));

    // Add active class to selected view and button
    views[view].classList.add('active');
    buttons[view].classList.add('active');

    // Refresh view content if needed
    if (view === 'activities') {
        renderAllActivities();
    }
}

async function saveNewHabit() {
    const nameInput = document.getElementById('habit-name');
    const name = nameInput.value.trim();

    if (!name) {
        tg.showPopup({
            title: 'Error',
            message: 'Please enter a habit name',
            buttons: [{ id: 'ok', type: 'default', text: 'OK' }]
        });
        return;
    }

    const newHabit = {
        id: `habit_${Date.now()}_${userId}`,
        name: name,
        category: document.getElementById('habit-category').value.trim() || 'Uncategorized',
        createdAt: new Date().toISOString(),
        streak: 0,
        completions: []
    };

    habits.push(newHabit);
    await saveHabits();

    // Clear form
    nameInput.value = '';
    document.getElementById('habit-category').value = '';

    // Switch to habits view and refresh
    switchView('habits');
    renderHabits();
}
        // Delete habit
async function deleteHabit(event) {
    const habitId = event.target.dataset.id;
    const habit = habits.find(h => h.id === habitId);

    if (!habit) return;

    tg.showPopup({
        title: 'Delete Habit',
        message: `Delete "${habit.name}"?`,
        buttons: [
            { id: 'cancel', type: 'cancel', text: 'Cancel' },
            { id: 'delete', type: 'destructive', text: 'Delete' }
        ]
    }, async (btnId) => {
        if (btnId === 'delete') {
            habits = habits.filter(h => h.id !== habitId);
            await saveHabits();
            renderHabits();
            // renderAllActivities();
            generateCalendar();
        }
    });
}