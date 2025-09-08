// Загрузка сохраненных настроек при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
    const settings = JSON.parse(localStorage.getItem('telegramSettings')) || {};
    document.getElementById('telegram-token').value = settings.token || '';
    document.getElementById('telegram-chat-id').value = settings.chatId || '';
    document.getElementById('send-daily').checked = settings.sendDaily || false;
    document.getElementById('send-weekly').checked = settings.sendWeekly || false;
    document.getElementById('send-monthly').checked = settings.sendMonthly || false;
});

// Функция сохранения настроек
function saveSettings() {
    const settings = {
        token: document.getElementById('telegram-token').value,
        chatId: document.getElementById('telegram-chat-id').value,
        sendDaily: document.getElementById('send-daily').checked,
        sendWeekly: document.getElementById('send-weekly').checked,
        sendMonthly: document.getElementById('send-monthly').checked
    };
    
    localStorage.setItem('telegramSettings', JSON.stringify(settings));
    alert('Настройки сохранены!');
}

// Функция сброса всех данных
function resetData() {
    if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
        // Очистка всех данных из localStorage
        localStorage.removeItem('transactions');
        localStorage.removeItem('telegramSettings');
        
        // Очистка полей ввода
        document.getElementById('telegram-token').value = '';
        document.getElementById('telegram-chat-id').value = '';
        document.getElementById('send-daily').checked = false;
        document.getElementById('send-weekly').checked = false;
        document.getElementById('send-monthly').checked = false;
        
        alert('Все данные успешно сброшены!');
    }
}