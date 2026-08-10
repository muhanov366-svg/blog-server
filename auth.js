// Мок база данных
let users = [];

module.exports = async (req, res) => {
    // Разрешаем CORS для разработки
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        const { action, email, password, name, userId, subscriptionAction } = req.body;
        
        // Регистрация
        if (action === 'register') {
            if (users.find(u => u.email === email)) {
                return res.status(400).json({ success: false, message: 'Пользователь уже существует' });
            }
            
            const newUser = {
                id: Date.now(),
                name,
                email,
                password,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            return res.status(200).json({ 
                success: true, 
                message: 'Регистрация успешна',
                user: { id: newUser.id, name: newUser.name, email: newUser.email }
            });
        }
        
        // Вход
        if (action === 'login') {
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                return res.status(200).json({ 
                    success: true, 
                    user: { id: user.id, name: user.name, email: user.email }
                });
            } else {
                return res.status(401).json({ success: false, message: 'Неверные данные' });
            }
        }
        
        // Подписка
        if (action === 'subscribe') {
            // В реальном приложении здесь сохранялась бы подписка в БД
            return res.status(200).json({ 
                success: true, 
                message: 'Подписка обновлена' 
            });
        }
    }
    
    // GET запросы
    if (req.method === 'GET') {
        const { action } = req.query;
        
        if (action === 'users') {
            // Возвращаем список пользователей без паролей
            const publicUsers = users.map(({ id, name, email, createdAt }) => ({
                id, name, email, createdAt
            }));
            return res.status(200).json({ success: true, users: publicUsers });
        }
    }
    
    res.status(404).json({ success: false, message: 'Метод не найден' });
};
