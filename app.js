// Состояние приложения
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let posts = [
    {
        id: 1,
        title: 'Первый пост',
        content: 'Добро пожаловать в наш блог! Здесь вы найдете много интересных статей.',
        author: 'Admin',
        date: '2024-01-01'
    },
    {
        id: 2,
        title: 'Как создать блог',
        content: 'Сегодня мы расскажем, как создать свой блог с нуля...',
        author: 'Admin',
        date: '2024-01-02'
    },
    {
        id: 3,
        title: 'Советы по написанию',
        content: 'Полезные советы для начинающих блогеров...',
        author: 'Admin',
        date: '2024-01-03'
    }
];

// DOM элементы
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const welcomeMessage = document.getElementById('welcomeMessage');
const postsContainer = document.getElementById('postsContainer');

// Функции модальных окон
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

// Закрытие модальных окон при клике вне контента
window.addEventListener('click', (e) => {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === registerModal) closeModal(registerModal);
});

// Закрытие модальных окон по крестику
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeModal(loginModal);
        closeModal(registerModal);
    });
});

// Открытие модальных окон
loginBtn.addEventListener('click', () => openModal(loginModal));
registerBtn.addEventListener('click', () => openModal(registerModal));

// Регистрация
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    // Проверка существующего пользователя
    if (users.find(u => u.email === email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }
    
    // Создание нового пользователя
    const newUser = {
        id: Date.now(),
        name,
        email,
        password // В реальном приложении пароль нужно хешировать!
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Регистрация успешна! Теперь войдите в аккаунт.');
    closeModal(registerModal);
    registerForm.reset();
});

// Вход
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        updateUI();
        closeModal(loginModal);
        loginForm.reset();
        showPosts();
    } else {
        alert('Неверный email или пароль');
    }
});

// Выход
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    updateUI();
    showPosts();
});

// Обновление UI
function updateUI() {
    if (currentUser) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        welcomeMessage.textContent = `Здравствуйте, ${currentUser.name}! Добро пожаловать в блог.`;
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        welcomeMessage.textContent = 'Пожалуйста, войдите, чтобы увидеть посты';
    }
}

// Отображение постов
function showPosts() {
    let html = '';
    
    posts.forEach(post => {
        html += `
            <div class="post-card">
                <h3>${post.title}</h3>
                <div class="post-meta">
                    <span>Автор: ${post.author}</span>
                    <span>${post.date}</span>
                </div>
                <div class="post-content">
                    ${post.content}
                </div>
            </div>
        `;
    });
    
    postsContainer.innerHTML = html;
}

// Инициализация
updateUI();
showPosts();

// Сохранение сессии (для примера, можно добавить)
// Проверка сессии при загрузке страницы
const savedUser = JSON.parse(sessionStorage.getItem('currentUser'));
if (savedUser) {
    currentUser = savedUser;
    updateUI();
    showPosts();
}

// Сохранение сессии при входе
const originalSubmit = loginForm.onsubmit;
loginForm.onsubmit = function(e) {
    e.preventDefault();
    // ... существующий код входа ...
    // После успешного входа
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
};