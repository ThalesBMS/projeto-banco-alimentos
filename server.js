require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');

// Importar rotas
const authRoutes = require('./routes/authRoutes');

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

// Rotas
app.use('/', authRoutes);

// Rota temporária para dashboard (será substituída depois)
app.get('/dashboard', (req, res) => {
    res.send(`
    <h1>Dashboard</h1>
    <p>Bem-vindo ao sistema! (Área protegida - em desenvolvimento)</p>
    <a href="/logout">Sair</a>
  `);
});

// Rota de teste
app.get('/', (req, res) => {
    res.send('Sistema de Banco de Alimentos - Estrutura Base OK');
});

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