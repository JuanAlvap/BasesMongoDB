const { MongoClient } = require('mongodb');

let db;

async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    db = client.db('biblioteca');
    console.log('✅ Conectado a MongoDB');
    return db;
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error);
    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    throw new Error('Base de datos no conectada');
  }
  return db;
}

module.exports = { connectDB, getDB };
