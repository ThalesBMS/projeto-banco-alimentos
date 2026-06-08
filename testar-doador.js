const { sequelize, Doador } = require('./models');

async function testar() {
  console.log('=== TESTE COMPLETO DO MODELO DOADOR ===\n');
  
  try {
    // 1. Sincronizar banco
    console.log('1. Sincronizando banco...');
    await sequelize.sync({ force: true });
    console.log('   ✅ Banco sincronizado\n');
    
    // 2. Criar um doador
    console.log('2. Criando doador...');
    const novoDoador = await Doador.create({
      nome: 'Empresa Teste',
      telefone: '(11) 99999-9999',
      endereco: 'Rua Teste, 123'
    });
    console.log('   ✅ Doador criado com ID:', novoDoador.id);
    console.log('   Dados:', novoDoador.toJSON(), '\n');
    
    // 3. Buscar o doador
    console.log('3. Buscando doador por ID...');
    const doadorEncontrado = await Doador.findByPk(novoDoador.id);
    console.log('   ✅ Doador encontrado:', doadorEncontrado.nome);
    console.log('   Dados completos:', doadorEncontrado.toJSON(), '\n');
    
    // 4. Listar todos
    console.log('4. Listando todos os doadores...');
    const todos = await Doador.findAll();
    console.log('   ✅ Total de doadores:', todos.length);
    
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('Se você chegou até aqui, o modelo Doador está funcionando perfeitamente.');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('Detalhes:', error);
  }
  
  process.exit();
}

testar();