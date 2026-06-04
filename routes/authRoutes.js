const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rotas de cadastro
router.get('/register', authController.showRegister);
router.post('/register', authController.register);

// Rotas de login
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// Rota de logout
router.get('/logout', authController.logout);

module.exports = router;