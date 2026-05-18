const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

prisma.$connect()
  .then(() => console.log('✅ MySQL connecté via Prisma'))
  .catch((err) => {
    console.error('❌ Erreur connexion MySQL :', err.message);
    console.error('👉 Vérifie DATABASE_URL dans ton .env');
    process.exit(1);
  });

module.exports = prisma;