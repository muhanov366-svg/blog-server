module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { action, email, password, name } = req.body;
        
        // Простая имитация базы данных
        let users = [];
        
        if (action === 'register') {
            users.push({ id: Date.now(), name, email, password });
            res.status(200).json({ success: true, message: 'Регистрация успешна' });
        } else if (action === 'login') {
            // Поиск пользователя
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                res.status(200).json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
            } else {
                res.status(401).json({ success: false, message: 'Неверные данные' });
            }
        }
    }
};