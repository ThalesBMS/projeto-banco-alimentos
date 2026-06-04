const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Mostrar página de cadastro
exports.showRegister = (req, res) => {
    res.render('register', { error: null });
};

// Mostrar página de login
exports.showLogin = (req, res) => {
    res.render('login', { error: null });
};

// Processar cadastro
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Verificar se usuário já existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.render('register', { error: 'E-mail já cadastrado' });
        }

        // Criptografar a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar usuário
        await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'voluntario'
        });

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.render('register', { error: 'Erro ao cadastrar usuário' });
    }
};

// Processar login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuário pelo e-mail
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.render('login', { error: 'Usuário ou senha inválidos' });
        }

        // Verificar a senha
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.render('login', { error: 'Usuário ou senha inválidos' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Salvar token no cookie
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'Erro ao fazer login' });
    }
};

// Logout
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
};