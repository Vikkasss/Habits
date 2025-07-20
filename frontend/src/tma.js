const tg = window.Telegram.WebApp;

tg.expand();  // Развернуть на весь экран
tg.MainButton.setText("Сохранить").show();  // Кнопка действия

// Get user info
const user = tg.initDataUnsafe.user;
console.log(user.first_name); // Shows user's name

// Пример работы с данными
document.getElementById('add-task').addEventListener('click', () => {
    const task = prompt("Введите задачу:");
    if (task) {
        const tasksDiv = document.getElementById('tasks');
        tasksDiv.innerHTML += `<div>${task}</div>`;
    }
});

// Отправка данных в бота
tg.MainButton.onClick(() => {
    const tasks = Array.from(document.querySelectorAll('#tasks div')).map(t => t.textContent);
    tg.sendData(JSON.stringify({ tasks: tasks }));
    tg.close();
});