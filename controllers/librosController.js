const { getDB } = require('../config/db');

async function getLibros(req, res) {
  try {
    const db = getDB();
    const libros = await db.collection('libro').find({}).toArray();
    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getLibroById(req, res) {
  try {
    const db = getDB();
    const libro = await db.collection('libro').findOne({ _id: req.params.id });
    if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
    res.json(libro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createLibro(req, res) {
  try {
    const { titulo, autor_ids } = req.body;
    if (!titulo) return res.status(400).json({ error: 'Título es obligatorio' });
    
    const db = getDB();
    await db.collection('libro').insertOne({
      _id: titulo,
      autor_ids: autor_ids || []
    });
    res.status(201).json({ _id: titulo, autor_ids });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateLibro(req, res) {
  try {
    const tituloAntiguo = req.params.id;
    const { titulo, autor_ids } = req.body;
    if (!titulo) return res.status(400).json({ error: 'Título es obligatorio' });
    
    const db = getDB();
    await db.collection('libro').deleteOne({ _id: tituloAntiguo });
    await db.collection('libro').insertOne({
      _id: titulo,
      autor_ids: autor_ids || []
    });
    
    res.json({ message: 'Libro actualizado', _id: titulo, autor_ids });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteLibro(req, res) {
  try {
    const db = getDB();
    const result = await db.collection('libro').deleteOne({ _id: req.params.id });
    
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Libro no encontrado' });
    res.json({ message: 'Libro eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getLibros, getLibroById, createLibro, updateLibro, deleteLibro };

module.exports = { getLibros, getLibroById, createLibro, updateLibro, deleteLibro };
