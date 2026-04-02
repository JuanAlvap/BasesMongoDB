const { getDB } = require('../config/db');

async function getUsuarios(req, res) {
  try {
    const db = getDB();
    const usuarios = await db.collection('usuario').find({}).toArray();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getUsuarioById(req, res) {
  try {
    const db = getDB();
    const usuario = await db.collection('usuario').findOne({ _id: req.params.id });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createUsuario(req, res) {
  try {
    const { rut, nombre } = req.body;
    if (!rut || !nombre) {
      return res.status(400).json({ error: 'RUT y nombre son obligatorios' });
    }
    
    const db = getDB();
    await db.collection('usuario').insertOne({
      _id: rut,
      nombre
    });
    res.status(201).json({ _id: rut, nombre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateUsuario(req, res) {
  try {
    const rutAntiguo = req.params.id;
    const { rut, nombre } = req.body;
    if (!rut || !nombre) {
      return res.status(400).json({ error: 'RUT y nombre son obligatorios' });
    }
    
    const db = getDB();
    await db.collection('usuario').deleteOne({ _id: rutAntiguo });
    await db.collection('usuario').insertOne({
      _id: rut,
      nombre
    });
    
    res.json({ message: 'Usuario actualizado', _id: rut });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteUsuario(req, res) {
  try {
    const db = getDB();
    const result = await db.collection('usuario').deleteOne({ _id: req.params.id });
    
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario };

module.exports = { getUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario };
