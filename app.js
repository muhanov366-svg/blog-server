// API URL
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://ваш-проект.vercel.app/api';

// Функция для API запросов
async function apiRequest(action, data = {}) {
    try {
        const response = await fetch(`${API_URL}/api/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, ...data })
        });
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Ошибка соединения с сервером' };
    }
}

// РЕГИСТРАЦИЯ (обновленная)
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    const result = await apiRequest('register', { name, email, password });
    
    if (result.success) {
        alert('Регистрация успешна! Теперь войдите в аккаунт.');
        closeModal(registerModal);
        registerForm.reset();
    } else {
        alert(result.message || 'Ошибка регистрации');
    }
});

// ВХОД (обновленный)
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = await apiRequest('login', { email, password });
    
    if (result.success) {
        currentUser = result.user;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUI();
        closeModal(loginModal);
        loginForm.reset();
        await loadPosts();
    } else {
        alert(result.message || 'Неверный email или пароль');
    }
});

// ЗАГРУЗКА ПОСТОВ
async function loadPosts() {
    const result = await apiRequest('getPosts');
    if (result.success) {
        posts = result.posts;
        localStorage.setItem('posts', JSON.stringify(posts));
        showPosts();
    }
}

// СОЗДАНИЕ ПОСТА (обновленное)
createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему');
        return;
    }
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const tags = document.getElementById('postTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const isPrivate = document.getElementById('postPrivate').checked;
    
    const result = await apiRequest('createPost', {
        title,
        content,
        author: currentUser.name,
        authorId: currentUser.id,
        tags,
        isPrivate
    });
    
    if (result.success) {
        closeModal(createPostModal);
        createPostForm.reset();
        await loadPosts();
        alert('Пост успешно создан!');
    } else {
        alert(result.message || 'Ошибка создания поста');
    }
});

// ПОДПИСКА (обновленная)
async function subscribeToUser(userId) {
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему');
        return;
    }
    
    if (userId === currentUser.id) {
        alert('Нельзя подписаться на самого себя');
        return;
    }
    
    const result = await apiRequest('subscribe', {
        subscriberId: currentUser.id,
        targetId: userId
    });
    
    if (result.success) {
        alert(result.message);
        await loadPosts();
    } else {
        alert(result.message || 'Ошибка');
    }
}

// ДОБАВЛЕНИЕ КОММЕНТАРИЯ (обновленное)
async function addComment(postId) {
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
    
    const result = await apiRequest('addComment', {
        postId,
        author: currentUser.name,
        text
    });
    
    if (result.success) {
        textarea.value = '';
        await loadPosts();
    } else {
        alert(result.message || 'Ошибка добавления комментария');
    }
}

// РЕДАКТИРОВАНИЕ ПОСТА (обновленное)
async function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post || post.authorId !== currentUser.id) {
        alert('У вас нет прав на редактирование этого поста');
        return;
    }
    
    const newTitle = prompt('Новый заголовок:', post.title);
    const newContent = prompt('Новое содержание:', post.content);
    const newTags = prompt('Теги (через запятую):', post.tags.join(', '));
    
    if (newTitle !== null && newContent !== null) {
        const result = await apiRequest('editPost', {
            postId,
            userId: currentUser.id,
            title: newTitle,
            content: newContent,
            tags: newTags ? newTags.split(',').map(tag => tag.trim()).filter(tag => tag) : post.tags
        });
        
        if (result.success) {
            await loadPosts();
            alert('Пост обновлен!');
        } else {
            alert(result.message || 'Ошибка редактирования');
        }
    }
}

// УДАЛЕНИЕ ПОСТА (обновленное)
async function deletePost(postId) {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post || post.authorId !== currentUser.id) {
        alert('У вас нет прав на удаление этого поста');
        return;
    }
    
    const result = await apiRequest('deletePost', {
        postId,
        userId: currentUser.id
    });
    
    if (result.success) {
        await loadPosts();
        alert('Пост удален');
    } else {
        alert(result.message || 'Ошибка удаления');
    }
}

// ИНИЦИАЛИЗАЦИЯ
async function init() {
    const savedUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (savedUser) {
        currentUser = savedUser;
        updateUI();
    }
    
    await loadPosts();
    updateUI();
}

// Запуск
init();
