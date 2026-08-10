// Состояние приложения
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let posts = JSON.parse(localStorage.getItem('posts')) || [
    {
        id: 1,
        title: 'Первый пост',
        content: 'Добро пожаловать в наш блог! Здесь вы найдете много интересных статей.',
        author: 'Admin',
        date: '2024-01-01',
        tags: ['введение', 'общее'],
        isPrivate: false,
        comments: [
            { id: 1, author: 'Admin', text: 'Добро пожаловать!', date: '2024-01-01' }
        ]
    },
    {
        id: 2,
        title: 'Как создать блог',
        content: 'Сегодня мы расскажем, как создать свой блог с нуля...',
        author: 'Admin',
        date: '2024-01-02',
        tags: ['туториал', 'блог'],
        isPrivate: false,
        comments: []
    },
    {
        id: 3,
        title: 'Советы по написанию',
        content: 'Полезные советы для начинающих блогеров...',
        author: 'Admin',
        date: '2024-01-03',
        tags: ['советы', 'написание'],
        isPrivate: false,
        comments: []
    }
];

let subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];
let postIdCounter = posts.length + 1;
let commentIdCounter = 1;

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
const createPostBtn = document.getElementById('createPostBtn');
const createPostModal = document.getElementById('createPostModal');
const createPostForm = document.getElementById('createPostForm');

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
    if (e.target === createPostModal) closeModal(createPostModal);
});

// Закрытие модальных окон по крестику
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeModal(loginModal);
        closeModal(registerModal);
        closeModal(createPostModal);
    });
});

// Открытие модальных окон
loginBtn.addEventListener('click', () => openModal(loginModal));
registerBtn.addEventListener('click', () => openModal(registerModal));
createPostBtn.addEventListener('click', () => openModal(createPostModal));

// Регистрация
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (users.find(u => u.email === email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        createdAt: new Date().toISOString()
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
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
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
    sessionStorage.removeItem('currentUser');
    updateUI();
    showPosts();
});

// Обновление UI
function updateUI() {
    if (currentUser) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        createPostBtn.style.display = 'inline-block';
        welcomeMessage.textContent = `Здравствуйте, ${currentUser.name}! Добро пожаловать в блог.`;
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        createPostBtn.style.display = 'none';
        welcomeMessage.textContent = 'Пожалуйста, войдите, чтобы увидеть посты';
    }
}

// Создание поста
createPostForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему');
        return;
    }
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const tags = document.getElementById('postTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const isPrivate = document.getElementById('postPrivate').checked;
    
    const newPost = {
        id: postIdCounter++,
        title,
        content,
        author: currentUser.name,
        authorId: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        tags: tags.length ? tags : ['общее'],
        isPrivate,
        comments: [],
        createdAt: new Date().toISOString()
    };
    
    posts.unshift(newPost);
    localStorage.setItem('posts', JSON.stringify(posts));
    
    closeModal(createPostModal);
    createPostForm.reset();
    showPosts();
    alert('Пост успешно создан!');
});

// Функция подписки на пользователя
function subscribeToUser(userId) {
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему');
        return;
    }
    
    if (userId === currentUser.id) {
        alert('Нельзя подписаться на самого себя');
        return;
    }
    
    const existingSubscription = subscriptions.find(
        sub => sub.subscriberId === currentUser.id && sub.targetId === userId
    );
    
    if (existingSubscription) {
        subscriptions = subscriptions.filter(
            sub => !(sub.subscriberId === currentUser.id && sub.targetId === userId)
        );
        alert('Вы отписались от пользователя');
    } else {
        subscriptions.push({
            id: Date.now(),
            subscriberId: currentUser.id,
            targetId: userId,
            createdAt: new Date().toISOString()
        });
        alert('Вы подписались на пользователя');
    }
    
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    showPosts();
}

// Генерация ленты на основе подписок
function getFeedPosts() {
    if (!currentUser) return posts.filter(post => !post.isPrivate);
    
    const subscribedUserIds = subscriptions
        .filter(sub => sub.subscriberId === currentUser.id)
        .map(sub => sub.targetId);
    
    // Посты от подписанных пользователей + публичные посты от других
    return posts.filter(post => {
        if (post.isPrivate) {
            // Скрытые посты показываем только автору
            return post.authorId === currentUser.id;
        }
        return true;
    });
}

// Сортировка постов по тегам
function filterPostsByTag(tag) {
    if (!tag) return posts;
    return posts.filter(post => post.tags && post.tags.includes(tag));
}

// Отображение постов
function showPosts(tagFilter = null) {
    let html = '';
    let displayPosts = getFeedPosts();
    
    if (tagFilter) {
        displayPosts = filterPostsByTag(tagFilter);
    }
    
    if (displayPosts.length === 0) {
        postsContainer.innerHTML = '<p class="no-posts">Нет постов для отображения</p>';
        return;
    }
    
    displayPosts.forEach(post => {
        const isAuthor = currentUser && post.authorId === currentUser.id;
        const isPrivate = post.isPrivate ? '🔒 ' : '';
        const tagsHtml = post.tags && post.tags.length ? 
            `<div class="post-tags">${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}</div>` : '';
        
        // Кнопка подписки (если автор не текущий пользователь)
        const subscriptionBtn = !isAuthor && currentUser ? 
            `<button onclick="subscribeToUser(${post.authorId})" class="btn btn-secondary btn-small">
                ${subscriptions.some(sub => sub.subscriberId === currentUser.id && sub.targetId === post.authorId) ? 'Отписаться' : 'Подписаться'}
            </button>` : '';
        
        // Комментарии
        const commentsHtml = post.comments && post.comments.length ? 
            `<div class="comments-section">
                <h4>Комментарии (${post.comments.length})</h4>
                ${post.comments.map(comment => `
                    <div class="comment">
                        <strong>${comment.author}</strong>
                        <span class="comment-date">${comment.date}</span>
                        <p>${comment.text}</p>
                    </div>
                `).join('')}
            </div>` : '';
        
        html += `
            <div class="post-card" data-post-id="${post.id}">
                <h3>${isPrivate}${post.title}</h3>
                <div class="post-meta">
                    <span>Автор: ${post.author}</span>
                    <span>${post.date}</span>
                    ${subscriptionBtn}
                    ${isAuthor ? `
                        <button onclick="editPost(${post.id})" class="btn btn-primary btn-small">Редактировать</button>
                        <button onclick="deletePost(${post.id})" class="btn btn-danger btn-small">Удалить</button>
                    ` : ''}
                </div>
                <div class="post-content">
                    ${post.content}
                </div>
                ${tagsHtml}
                ${commentsHtml}
                ${currentUser ? `
                    <div class="comment-form">
                        <textarea id="commentText_${post.id}" placeholder="Написать комментарий..." rows="2"></textarea>
                        <button onclick="addComment(${post.id})" class="btn btn-primary btn-small">Комментировать</button>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    postsContainer.innerHTML = html;
}

// Добавление комментария
function addComment(postId) {
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему');
        return;
    }
    
    const textarea = document.getElementById(`commentText_${postId}`);
    const text = textarea.value.trim();
    
    if (!text) {
        alert('Введите текст комментария');
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    post.comments.push({
        id: commentIdCounter++,
        author: currentUser.name,
        text,
        date: new Date().toISOString().split('T')[0]
    });
    
    localStorage.setItem('posts', JSON.stringify(posts));
    textarea.value = '';
    showPosts();
}

// Редактирование поста
function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post || post.authorId !== currentUser.id) {
        alert('У вас нет прав на редактирование этого поста');
        return;
    }
    
    const newTitle = prompt('Новый заголовок:', post.title);
    if (newTitle !== null) post.title = newTitle;
    
    const newContent = prompt('Новое содержание:', post.content);
    if (newContent !== null) post.content = newContent;
    
    const newTags = prompt('Теги (через запятую):', post.tags.join(', '));
    if (newTags !== null) {
        post.tags = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    post.date = new Date().toISOString().split('T')[0];
    localStorage.setItem('posts', JSON.stringify(posts));
    showPosts();
    alert('Пост обновлен!');
}

// Удаление поста
function deletePost(postId) {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post || post.authorId !== currentUser.id) {
        alert('У вас нет прав на удаление этого поста');
        return;
    }
    
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('posts', JSON.stringify(posts));
    showPosts();
    alert('Пост удален');
}

// Поиск и фильтрация по тегам
document.getElementById('searchTags')?.addEventListener('input', function() {
    const tag = this.value.trim();
    showPosts(tag);
});

// Инициализация
function init() {
    // Проверка сессии
    const savedUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (savedUser) {
        currentUser = savedUser;
        updateUI();
    }
    
    showPosts();
    updateUI();
}

// Запуск
init();
