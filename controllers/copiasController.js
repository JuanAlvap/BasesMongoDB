const { getDB } = require('../config/db');

async function getCopias(req, res) {
  try {
    const db = getDB();
    const copias = await db.collection('copia').find({}).toArray();
    res.json(copias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getCopiaById(req, res) {
  try {
    const db = getDB();
    const copiaId = JSON.parse(req.params.id);
    const copia = await db.collection('copia').findOne({ _id: copiaId });
    if (!copia) return res.status(404).json({ error: 'Copia no encontrada' });
    res.json(copia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createCopia(req, res) {
  try {
    const { numero, edicion_id } = req.body;
    if (!numero || !edicion_id) {
      return res.status(400).json({ error: 'Número y edición_id son obligatorios' });
    }
    
    const db = getDB();
    const copiaId = { numero: parseInt(numero), edicion_id };
    await db.collection('copia').insertOne({ _id: copiaId });
    res.status(201).json({ _id: copiaId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateCopia(req, res) {
  try {
    const copiaIdAntigua = JSON.parse(req.params.id);
    const { numero, edicion_id } = req.body;
    if (!numero || !edicion_id) {
      return res.status(400).json({ error: 'Número y edición_id son obligatorios' });
    }
    
    const db = getDB();
    const copiaIdNueva = { numero: parseInt(numero), edicion_id };
    await db.collection('copia').deleteOne({ _id: copiaIdAntigua });
    await db.collection('copia').insertOne({ _id: copiaIdNueva });
    
    res.json({ message: 'Copia actualizada', _id: copiaIdNueva });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteCopia(req, res) {
  try {
    const db = getDB();
    const copiaId = JSON.parse(req.params.id);
    const result = await db.collection('copia').deleteOne({ _id: copiaId });
    
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Copia no encontrada' });
    res.json({ message: 'Copia eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getCopias, getCopiaById, createCopia, updateCopia, deleteCopia };

module.exports = { getCopias, getCopiaById, createCopia, updateCopia, deleteCopia };
