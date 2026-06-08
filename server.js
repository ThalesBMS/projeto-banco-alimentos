require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { sequelize, User, Doador, Alimento, ensureDatabaseSchema } = require('./models');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const doadorRoutes = require('./routes/doadorRoutes');
const alimentoRoutes = require('./routes/alimentoRoutes');

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
  res.locals.user = req.user || null;
  next();
});

// ========== ROTAS PÚBLICAS ==========
app.use('/', authRoutes);

app.get('/', (req, res) => {
  res.redirect('/login');
});

// ========== ROTAS PROTEGIDAS ==========

// Rotas de Doadores (CRUD)
app.use('/', doadorRoutes);

// Rotas de Alimentos (CRUD)
app.use('/', alimentoRoutes);

// Dashboard - com estatísticas reais
app.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Buscar os números reais do banco
    const totalDoadores = await Doador.count();
    const totalAlimentos = await Alimento.count({ where: { status: 'disponivel' } });
    const totalDistribuidos = await Alimento.count({ where: { status: 'distribuido' } });
    const totalUsuarios = await User.count();
    
    // Buscar últimos 5 doadores
    const ultimosDoadores = await Doador.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });
    
    // Buscar alimentos próximos ao vencimento (próximos 7 dias)
    const hoje = new Date();
    const semanaQueVem = new Date();
    semanaQueVem.setDate(hoje.getDate() + 7);
    
    const alimentosProximos = await Alimento.findAll({
      where: {
        status: 'disponivel',
        data_validade: {
          $between: [hoje, semanaQueVem]
        }
      },
      include: [{ model: Doador, as: 'Doador' }],
      limit: 5,
      order: [['data_validade', 'ASC']]
    });
    
    res.render('dashboard', { 
      title: 'Dashboard',
      currentPage: 'dashboard',
      user: req.user,
      totalDoadores: totalDoadores,
      totalAlimentos: totalAlimentos,
      totalDistribuidos: totalDistribuidos,
      totalUsuarios: totalUsuarios,
      ultimosDoadores: ultimosDoadores,
      alimentosProximos: alimentosProximos
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.render('dashboard', { 
      title: 'Dashboard',
      currentPage: 'dashboard',
      user: req.user,
      totalDoadores: 0,
      totalAlimentos: 0,
      totalDistribuidos: 0,
      totalUsuarios: 1,
      ultimosDoadores: [],
      alimentosProximos: []
    });
  }
});

// Perfil - busca dados completos do usuário
app.get('/perfil', authMiddleware, async (req, res) => {
  try {
    const userCompleto = await User.findById(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
    
    res.render('perfil', { 
      title: 'Meu Perfil',
      currentPage: 'perfil',
      user: userCompleto
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.render('perfil', { 
      title: 'Meu Perfil',
      currentPage: 'perfil',
      user: req.user
    });
  }
});

// Usuários - área administrativa
app.get('/usuarios', authMiddleware, authMiddleware.isAdmin, async (req, res) => {
  try {
    const usuarios = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.render('usuarios/index', {
      title: 'Usuários',
      currentPage: 'usuarios',
      user: req.user,
      usuarios
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).send('Erro ao carregar usuários: ' + error.message);
  }
});

// Rota admin (exemplo)
app.get('/admin-only', authMiddleware, authMiddleware.isAdmin, (req, res) => {
  res.send('🎉 Área restrita para administradores!');
});

// API protegida
app.get('/api/usuario/logado', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// ========== CONEXÃO COM BANCO ==========
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Banco de dados conectado com sucesso!');
    
    await ensureDatabaseSchema();
    console.log('✅ Modelos sincronizados com o banco de dados!');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
