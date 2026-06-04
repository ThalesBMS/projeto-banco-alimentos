const { User, Doador, Alimento } = require('./models');

async function consultar() {
    try {
        console.log('\n📋 USUÁRIOS CADASTRADOS:');
        console.log('='.repeat(50));
        const users = await User.findAll();

        if (users.length === 0) {
            console.log('Nenhum usuário cadastrado ainda.');
        } else {
            users.forEach(user => {
                console.log(`ID: ${user.id}`);
                console.log(`Nome: ${user.name}`);
                console.log(`Email: ${user.email}`);
                console.log(`Tipo: ${user.role}`);
                console.log(`Criado em: ${user.createdAt}`);
                console.log('-'.repeat(50));
            });
        }

        console.log(`\nTotal de usuários: ${users.length}`);

    } catch (error) {
        console.error('Erro:', error);
    }

    process.exit();
}

consultar();