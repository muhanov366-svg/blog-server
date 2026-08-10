const axios = require('axios');

// URL вашего JSON Server (замените на ваш)
const API_URL = process.env.API_URL || 'http://localhost:3000';

module.exports = async (req, res) => {
    // CORS настройки
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { action } = req.body;

        // РЕГИСТРАЦИЯ
        if (action === 'register') {
            const { email, password, name } = req.body;
            
            // Проверка существующего пользователя
            const usersResponse = await axios.get(`${API_URL}/users?email=${email}`);
            if (usersResponse.data.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Пользователь с таким email уже существует' 
                });
            }

            // Создание пользователя
            const newUser = {
                id: Date.now(),
                name,
                email,
                password,
                createdAt: new Date().toISOString()
            };

            await axios.post(`${API_URL}/users`, newUser);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Регистрация успешна',
                user: { id: newUser.id, name: newUser.name, email: newUser.email }
            });
        }

        // ВХОД
        if (action === 'login') {
            const { email, password } = req.body;
            
            const usersResponse = await axios.get(`${API_URL}/users?email=${email}`);
            const user = usersResponse.data.find(u => u.password === password);

            if (user) {
                return res.status(200).json({ 
                    success: true, 
                    user: { id: user.id, name: user.name, email: user.email }
                });
            } else {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Неверный email или пароль' 
                });
            }
        }

        // ПОЛУЧЕНИЕ ПОСТОВ
        if (action === 'getPosts') {
            const postsResponse = await axios.get(`${API_URL}/posts`);
            return res.status(200).json({ 
                success: true, 
                posts: postsResponse.data 
            });
        }

        // СОЗДАНИЕ ПОСТА
        if (action === 'createPost') {
            const { title, content, author, authorId, tags, isPrivate } = req.body;
            
            const newPost = {
                id: Date.now(),
                title,
                content,
                author,
                authorId,
                date: new Date().toISOString().split('T')[0],
                tags: tags || ['общее'],
                isPrivate: isPrivate || false,
                comments: [],
                createdAt: new Date().toISOString()
            };

            await axios.post(`${API_URL}/posts`, newPost);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Пост создан',
                post: newPost
            });
        }

        // ПОДПИСКА
        if (action === 'subscribe') {
            const { subscriberId, targetId } = req.body;
            
            // Проверка существующей подписки
            const subsResponse = await axios.get(
                `${API_URL}/subscriptions?subscriberId=${subscriberId}&targetId=${targetId}`
            );

            if (subsResponse.data.length > 0) {
                // Отписка
                await axios.delete(`${API_URL}/subscriptions/${subsResponse.data[0].id}`);
                return res.status(200).json({ 
                    success: true, 
                    message: 'Отписка успешна',
                    subscribed: false
                });
            } else {
                // Подписка
                const newSubscription = {
                    id: Date.now(),
                    subscriberId,
                    targetId,
                    createdAt: new Date().toISOString()
                };
                await axios.post(`${API_URL}/subscriptions`, newSubscription);
                return res.status(200).json({ 
                    success: true, 
                    message: 'Подписка успешна',
                    subscribed: true
                });
            }
        }

        // ДОБАВЛЕНИЕ КОММЕНТАРИЯ
        if (action === 'addComment') {
            const { postId, author, text } = req.body;
            
            const postsResponse = await axios.get(`${API_URL}/posts?id=${postId}`);
            const post = postsResponse.data[0];
            
            if (!post) {
                return res.status(404).json({ success: false, message: 'Пост не найден' });
            }

            const newComment = {
                id: Date.now(),
                author,
                text,
                date: new Date().toISOString().split('T')[0]
            };

            post.comments.push(newComment);
            await axios.put(`${API_URL}/posts/${postId}`, post);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Комментарий добавлен',
                comment: newComment
            });
        }

        // УДАЛЕНИЕ ПОСТА
        if (action === 'deletePost') {
            const { postId, userId } = req.body;
            
            const postsResponse = await axios.get(`${API_URL}/posts?id=${postId}`);
            const post = postsResponse.data[0];
            
            if (!post) {
                return res.status(404).json({ success: false, message: 'Пост не найден' });
            }

            if (post.authorId !== userId) {
                return res.status(403).json({ success: false, message: 'Нет прав на удаление' });
            }

            await axios.delete(`${API_URL}/posts/${postId}`);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Пост удален'
            });
        }

        // РЕДАКТИРОВАНИЕ ПОСТА
        if (action === 'editPost') {
            const { postId, userId, title, content, tags } = req.body;
            
            const postsResponse = await axios.get(`${API_URL}/posts?id=${postId}`);
            const post = postsResponse.data[0];
            
            if (!post) {
                return res.status(404).json({ success: false, message: 'Пост не найден' });
            }

            if (post.authorId !== userId) {
                return res.status(403).json({ success: false, message: 'Нет прав на редактирование' });
            }

            // Обновление поста
            post.title = title || post.title;
            post.content = content || post.content;
            post.tags = tags || post.tags;
            post.date = new Date().toISOString().split('T')[0];

            await axios.put(`${API_URL}/posts/${postId}`, post);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Пост обновлен',
                post
            });
        }

        return res.status(400).json({ success: false, message: 'Неизвестное действие' });

    } catch (error) {
        console.error('Ошибка:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера',
            error: error.message 
        });
    }
};
