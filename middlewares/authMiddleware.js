const jwt = require('jsonwebtoken');

// Middleware para verificar se o usuário está autenticado
module.exports = (req, res, next) => {
    // Tentar pegar o token do cookie ou do header Authorization
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    // Se não tem token, redireciona para o login
    if (!token) {
        // Se for uma requisição de API, retorna JSON
        if (req.path.startsWith('/api')) {
            return res.status(401).json({ error: 'Token não fornecido. Faça login primeiro.' });
        }
        // Se for uma página normal, redireciona para o login
        return res.redirect('/login');
    }

    try {
        // Verificar se o token é válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Salvar os dados do usuário na requisição para usar nas rotas
        req.user = decoded;

        // Continuar para a próxima função
        next();
    } catch (error) {
        // Token inválido ou expirado
        if (req.path.startsWith('/api')) {
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }
        // Limpar o cookie inválido e redirecionar para o login
        res.clearCookie('token');
        res.redirect('/login');
    }
};