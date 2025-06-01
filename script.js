// --- DOM Elements ---
// Global elements
const feedbackMessage = document.getElementById('feedback-message');
const navLinks = document.querySelectorAll('.nav-links a');
const appSections = document.querySelectorAll('.app-section');

// Dashboard elements
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const emptyMessage = document.querySelector('.empty-message');

// --- Global State ---
let transactions = [];

// --- Utility Functions ---

// Show feedback message
function showFeedback(message, type = 'info', duration = 3000) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = `feedback-message show ${type}`;
    setTimeout(() => {
        feedbackMessage.classList.remove('show');
    }, duration);
}

// Format currency
function formatCurrency(value) {
    // Default currency symbol to 'Rs' since settings are removed
    const currencySymbol = 'Rs';
    const parsedAmount = parseFloat(value);
    if (isNaN(parsedAmount)) {
        return `${currencySymbol}0.00`;
    }
    return `${currencySymbol}${parsedAmount.toFixed(2)}`;
}

// Update local storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// --- Navigation and Section Switching (Simplified) ---

function showSection(sectionId) {
    appSections.forEach(section => {
        section.classList.remove('active-section');
    });
    document.getElementById(sectionId).classList.add('active-section');

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId.replace('-section', '')) {
            link.classList.add('active');
        }
    });

    if (sectionId === 'dashboard-section') {
        initDashboard();
    }
}

// --- Dashboard Logic ---

// Load transactions from local storage for dashboard
function loadTransactionsForDashboard() {
    const storedTransactions = JSON.parse(localStorage.getItem('transactions'));
    transactions = storedTransactions ? storedTransactions : [];
}

// Add transaction to DOM
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? 'minus' : 'plus';
    const item = document.createElement('li');
    item.classList.add(sign);
    item.classList.add('new-transaction'); // For animation

    item.innerHTML = `
        ${transaction.text} <span>${formatCurrency(transaction.amount)}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})"><i class="fas fa-times"></i></button>
    `;
    list.appendChild(item);

    setTimeout(() => {
        item.classList.remove('new-transaction');
    }, 400);
}

// Update the balance, income, and expense on dashboard
function updateDashboardValues() {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
    const expense = amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0);

    balance.innerText = formatCurrency(total);
    money_plus.innerText = formatCurrency(income);
    money_minus.innerText = formatCurrency(expense);

    if (transactions.length === 0) {
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
    }
}

// Remove transaction by ID
function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    initDashboard(); // Re-initialize dashboard to update UI
    showFeedback('Transaction deleted.', 'info');
}

// Handle Add Transaction form submission
function handleAddTransaction(e) {
    e.preventDefault();

    if (text.value.trim() === '' || amount.value.trim() === '') {
        showFeedback('Please add a description and amount.', 'error');
        return;
    }

    const transaction = {
        id: Math.floor(Math.random() * 100000000), // Simple ID generation
        text: text.value,
        amount: +amount.value,
        date: new Date().toISOString()
    };

    transactions.push(transaction);
    updateLocalStorage();
    initDashboard(); // Re-initialize dashboard to update UI

    text.value = '';
    amount.value = '';
    showFeedback('Transaction added successfully!', 'info');
}

// Initialize Dashboard UI
function initDashboard() {
    loadTransactionsForDashboard(); // Load latest transactions
    list.innerHTML = ''; // Clear current list
    transactions.forEach(addTransactionDOM); // Re-render all transactions
    updateDashboardValues(); // Recalculate and display values
}

// --- Event Listeners ---

// Navigation (simplified to only dashboard)
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = `${e.target.dataset.section}-section`;
        showSection(sectionId);
    });
});

// Dashboard
form.addEventListener('submit', handleAddTransaction);

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initDashboard(); // Initialize Dashboard on load
    showSection('dashboard-section'); // Always start on Dashboard
});