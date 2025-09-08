// Хранилище транзакций в памяти (в реальном приложении это будет база данных)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let filteredTransactions = [];

// DOM элементы
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const descriptionInput = document.getElementById('description');
const transactionList = document.getElementById('transaction-list');
const balanceElement = document.getElementById('balance');
const totalIncomeElement = document.getElementById('total-income');
const totalExpenseElement = document.getElementById('total-expense');

// Элементы фильтрации
const dateFromInput = document.getElementById('date-from');
const dateToInput = document.getElementById('date-to');

// Инициализация приложения
function init() {
    updateSummary();
    renderTransactions();
}

// Добавление новой транзакции
function addTransaction() {
    const amount = parseFloat(amountInput.value);
    const type = typeSelect.value;
    const description = descriptionInput.value;
    
    if (isNaN(amount) || amount <= 0) {
        alert('Пожалуйста, введите корректную сумму');
        return;
    }
    
    if (!description.trim()) {
        alert('Пожалуйста, введите описание');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        amount: type === 'expense' ? -amount : amount,
        type: type,
        description: description,
        date: new Date().toISOString()
    };
    
    transactions.push(transaction);
    saveTransactions();
    updateSummary();
    renderTransactions();
    
    // Очистка полей ввода
    amountInput.value = '';
    descriptionInput.value = '';
    typeSelect.value = 'income';
}

// Применение фильтра по датам
function applyDateFilter() {
    const dateFrom = dateFromInput.value;
    const dateTo = dateToInput.value;
    
    if (!dateFrom && !dateTo) {
        alert('Пожалуйста, выберите хотя бы одну дату');
        return;
    }
    
    // Фильтрация транзакций по датам
    filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;
        
        // Установим время на конец дня для toDate
        if (toDate) {
            toDate.setHours(23, 59, 59, 999);
        }
        
        let isValid = true;
        
        if (fromDate && toDate) {
            isValid = transactionDate >= fromDate && transactionDate <= toDate;
        } else if (fromDate) {
            isValid = transactionDate >= fromDate;
        } else if (toDate) {
            isValid = transactionDate <= toDate;
        }
        
        return isValid;
    });
    
    // Обновление отображения с отфильтрованными данными
    updateSummary();
    renderTransactions();
}

// Сброс фильтра по датам
function resetDateFilter() {
    dateFromInput.value = '';
    dateToInput.value = '';
    filteredTransactions = [];
    updateSummary();
    renderTransactions();
}

// Обновление сводки
function updateSummary() {
    // Используем отфильтрованные данные, если фильтр применен, иначе все транзакции
    const data = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    
    const totalIncome = data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalExpense = data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
    const balance = totalIncome - totalExpense;
    
    totalIncomeElement.textContent = totalIncome.toFixed(2);
    totalExpenseElement.textContent = totalExpense.toFixed(2);
    balanceElement.textContent = balance.toFixed(2);
}

// Отображение списка транзакций
function renderTransactions() {
    transactionList.innerHTML = '';
    
    // Используем отфильтрованные данные, если фильтр применен, иначе все транзакции
    const data = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    
    // Сортировка по дате (новые первыми)
    const sortedTransactions = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedTransactions.forEach(transaction => {
        const li = document.createElement('li');
        li.className = transaction.type === 'income' ? 'income-item' : 'expense-item';
        
        const date = new Date(transaction.date).toLocaleDateString('ru-RU');
        
        li.innerHTML = `
            <div>
                <div>${transaction.description}</div>
                <div class="date">${date}</div>
            </div>
            <div class="${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
                ${transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)} грн
            </div>
        `;
        
        transactionList.appendChild(li);
    });
}

// Сохранение транзакций в localStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Отправка отчета
function sendReport(days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredTransactions = transactions.filter(t => new Date(t.date) >= cutoffDate);
    
    if (filteredTransactions.length === 0) {
        alert(`Нет транзакций за последние ${days} дней`);
        return;
    }
    
    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
    const balance = totalIncome - totalExpense;
    
    const report = `
Отчет за последние ${days} дней:
Период: ${cutoffDate.toLocaleDateString('ru-RU')} - ${new Date().toLocaleDateString('ru-RU')}

Доходы: ${totalIncome.toFixed(2)} грн
Расходы: ${totalExpense.toFixed(2)} грн
Баланс: ${balance.toFixed(2)} грн

Детали:
${filteredTransactions.map(t => {
    const date = new Date(t.date).toLocaleDateString('ru-RU');
    return `${date} | ${t.description} | ${t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)} грн`;
}).join('\n')}
    `.trim();
    
    // В реальном приложении здесь будет интеграция с Telegram API
    alert(`Отчет готов к отправке в Telegram:\n\n${report}`);
    console.log('Отправка в Telegram:', report);
}

// Отправка сообщения в Telegram
function sendToTelegram(message) {
    // Загрузка настроек из localStorage
    const settings = JSON.parse(localStorage.getItem('telegramSettings')) || {};
    const botToken = settings.token || 'YOUR_BOT_TOKEN';
    const chatId = settings.chatId || 'YOUR_CHAT_ID';
    
    if (botToken === 'YOUR_BOT_TOKEN' || chatId === 'YOUR_CHAT_ID') {
        alert('Пожалуйста, настройте Telegram в разделе настроек');
        return;
    }
    
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const data = {
        chat_id: chatId,
        text: message
    };
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            alert('Отчет успешно отправлен в Telegram!');
        } else {
            alert('Ошибка отправки в Telegram: ' + data.description);
        }
    })
    .catch(error => {
        alert('Ошибка отправки в Telegram: ' + error.message);
    });
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', init);