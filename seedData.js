require('dotenv').config();
const { MongoClient } = require('mongodb');

async function seedData() {
  const client = new MongoClient(process.env.MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db('biblioteca');
    
    console.log('🧹 Limpiando colecciones...');
    await db.collection('autores').deleteMany({});
    await db.collection('libros').deleteMany({});
    await db.collection('ediciones').deleteMany({});
    await db.collection('copias').deleteMany({});
    await db.collection('usuarios').deleteMany({});
    await db.collection('prestamos').deleteMany({});
    
    console.log('📝 Insertando autores...');
    const autoresResult = await db.collection('autores').insertMany([
      { nombre: 'Gabriel García Márquez' },
      { nombre: 'Jorge Luis Borges' },
      { nombre: 'Isabel Allende' }
    ]);
    const autorIds = Object.values(autoresResult.insertedIds);
    
    console.log('📚 Insertando libros...');
    const librosResult = await db.collection('libros').insertMany([
      { titulo: 'Cien años de soledad', autores: [autorIds[0]] },
      { titulo: 'Ficciones', autores: [autorIds[1]] },
      { titulo: 'La casa de los espíritus', autores: [autorIds[2]] }
    ]);
    const libroIds = Object.values(librosResult.insertedIds);
    
    console.log('📖 Insertando ediciones...');
    const edicionesResult = await db.collection('ediciones').insertMany([
      { ISBN: '9780060883287', año: 1967, idioma: 'Español', libro_id: libroIds[0] },
      { ISBN: '9780811200738', año: 1944, idioma: 'Español', libro_id: libroIds[1] },
      { ISBN: '9780553283357', año: 1982, idioma: 'Español', libro_id: libroIds[2] }
    ]);
    const edicionIds = Object.values(edicionesResult.insertedIds);
    
    console.log('🏷️ Insertando copias...');
    await db.collection('copias').insertMany([
      { numero: 1, edicion_id: edicionIds[0] },
      { numero: 2, edicion_id: edicionIds[0] },
      { numero: 1, edicion_id: edicionIds[1] },
      { numero: 1, edicion_id: edicionIds[2] }
    ]);
    
    console.log('👤 Insertando usuarios...');
    const usuariosResult = await db.collection('usuarios').insertMany([
      { RUT: '12.345.678-9', nombre: 'Juan Pérez' },
      { RUT: '87.654.321-0', nombre: 'María García' }
    ]);
    const usuarioIds = Object.values(usuariosResult.insertedIds);
    
    console.log('🔄 Insertando préstamos...');
    await db.collection('prestamos').insertMany([
      {
        copia_id: edicionIds[0],
        usuario_id: usuarioIds[0],
        fecha_prestamo: new Date('2024-03-01'),
        fecha_devolucion: null
      },
      {
        copia_id: edicionIds[1],
        usuario_id: usuarioIds[1],
        fecha_prestamo: new Date('2024-02-15'),
        fecha_devolucion: new Date('2024-03-01')
      }
    ]);
    
    console.log('✅ Datos de prueba insertados correctamente');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

seedData();
