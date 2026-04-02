const { getDB } = require('../config/db');

// Obtener todos los autores
async function getAutores(req, res) {
  try {
    const db = getDB();
    const autores = await db.collection('autor').find({}).toArray();
    res.json(autores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener autor por nombre
async function getAutorById(req, res) {
  try {
    const db = getDB();
    const autor = await db.collection('autor').findOne({ _id: req.params.id });
    if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });
    res.json(autor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Crear autor
async function createAutor(req, res) {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    
    const db = getDB();
    await db.collection('autor').insertOne({ _id: nombre });
    res.status(201).json({ _id: nombre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Actualizar autor (cambiar nombre)
async function updateAutor(req, res) {
  try {
    const nombreAntiguo = req.params.id;
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    
    const db = getDB();
    await db.collection('autor').deleteOne({ _id: nombreAntiguo });
    await db.collection('autor').insertOne({ _id: nombre });
    
    res.json({ message: 'Autor actualizado', _id: nombre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Eliminar autor
async function deleteAutor(req, res) {
  try {
    const db = getDB();
    const result = await db.collection('autor').deleteOne({ _id: req.params.id });
    
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Autor no encontrado' });
    res.json({ message: 'Autor eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAutores, getAutorById, createAutor, updateAutor, deleteAutor };
