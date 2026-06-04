require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');

// Importar rotas
const authRoutes = require('./routes/authRoutes');

// Importar middlewares
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rotas públicas (sem autenticação)
app.use('/', authRoutes);

// Rota pública de teste
app.get('/', (req, res) => {
    res.send('Sistema de Banco de Alimentos - Estrutura Base OK');
});

// ========== ROTAS PROTEGIDAS (requerem autenticação) ==========

// Dashboard - página inicial após login
app.get('/dashboard', authMiddleware, (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Dashboard - Banco de Alimentos</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                margin: 0;
                padding: 20px;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 800px;
                margin: 0 auto;
            }
            h1 { color: #333; }
            .user-info { 
                background: #f0f0f0; 
                padding: 15px; 
                border-radius: 5px;
                margin: 20px 0;
            }
            .menu {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin: 20px 0;
            }
            .menu a {
                background: #667eea;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
            }
            .menu a:hover { background: #5a67d8; }
            .logout {
                background: #e53e3e;
            }
            .logout:hover { background: #c53030; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🍽️ Banco de Alimentos Comunitário</h1>
            
            <div class="user-info">
                <strong>Bem-vindo, ${req.user.email}!</strong><br>
                <strong>Tipo:</strong> ${req.user.role === 'admin' ? 'Administrador' : 'Voluntário'}
            </div>
            
            <div class="menu">
                <a href="/dashboard">🏠 Início</a>
                <a href="/doadores">🤝 Doadores</a>
                <a href="/alimentos">🍎 Alimentos</a>
                ${req.user.role === 'admin' ? '<a href="/usuarios">👥 Usuários</a>' : ''}
                <a href="/logout" class="logout">🚪 Sair</a>
            </div>
            
            <h2>Sistema de Coleta, Armazenamento e Distribuição</h2>
            <p>Este sistema ajuda a gerenciar doadores, alimentos e distribuições para a comunidade.</p>
            <p><em>As funcionalidades completas serão implementadas pelos próximos commits.</em></p>
        </div>
    </body>
    </html>
  `);
});

// Rota de exemplo protegida para perfil do usuário
app.get('/perfil', authMiddleware, (req, res) => {
    res.json({
        message: 'Seus dados',
        user: req.user
    });
});

// Rota de exemplo que só admin pode acessar
app.get('/admin-only', authMiddleware, (req, res, next) => {
    const { isAdmin } = require('./middlewares/authMiddleware');
    isAdmin(req, res, next);
}, (req, res) => {
    res.send('🎉 Área restrita para administradores! Você tem acesso especial.');
});

// Rota de API protegida (exemplo)
app.get('/api/usuario/logado', authMiddleware, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// ========== FIM DAS ROTAS PROTEGIDAS ==========

// Conectar ao banco e sincronizar
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Banco de dados conectado com sucesso!');

        await sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados com o banco de dados!');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco:', error);
    }
})();
