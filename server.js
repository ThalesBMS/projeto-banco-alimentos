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

// Middleware para disponibilizar usuário em todas as views
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Rotas públicas (sem autenticação)
app.use('/', authRoutes);

// Rota pública de teste
app.get('/', (req, res) => {
  res.send('Sistema de Banco de Alimentos - Estrutura Base OK');
});

// ========== ROTAS PROTEGIDAS (requerem autenticação) ==========

// Dashboard - página inicial após login
app.get('/dashboard', authMiddleware, (req, res) => {
  res.render('dashboard', { 
    title: 'Dashboard',
    currentPage: 'dashboard',
    user: req.user
  });
});

// Rota de exemplo protegida para perfil do usuário
app.get('/perfil', authMiddleware, (req, res) => {
  res.render('perfil', { 
    title: 'Meu Perfil',
    currentPage: 'perfil',
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