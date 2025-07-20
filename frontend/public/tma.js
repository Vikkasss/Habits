const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();


const user = tg.initDataUnsafe.user;
if (user) {
    document.getElementById('status').textContent = `Hello, ${user.first_name}`;
}

document.getElementById('action-btn').addEventListener('click', () => {
    tg.showPopup({
        title: 'New Habit',
        message: 'Enter your new habit:',
        buttons: [{
            id: 'save',
            type: 'default',
            text: 'Save'
        }]
    }, (btnId) => {
        if(btnId === 'save') {
            tg.sendData(JSON.stringify({action: "habit_added"}));
            tg.close();
        }
    });
});