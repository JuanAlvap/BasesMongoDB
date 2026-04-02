const { getDB } = require('../config/db');

async function getPrestamos(req, res) {
  try {
    const db = getDB();
    const prestamos = await db.collection('prestamo').find({}).toArray();
    res.json(prestamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPrestamoById(req, res) {
  try {
    const db = getDB();
    const prestamoId = JSON.parse(req.params.id);
    const prestamo = await db.collection('prestamo').findOne({ _id: prestamoId });
    if (!prestamo) return res.status(404).json({ error: 'Préstamo no encontrado' });
    res.json(prestamo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createPrestamo(req, res) {
  try {
    const { usuario_id, copia_id, fecha_prestamo, fecha_devolucion } = req.body;
    if (!usuario_id || !copia_id || !fecha_prestamo) {
      return res.status(400).json({ error: 'usuario_id, copia_id y fecha_prestamo son obligatorios' });
    }
    
    const db = getDB();
    const prestamoId = {
      usuario_id,
      copia_id,
      fecha_prestamo
    };
    
    await db.collection('prestamo').insertOne({
      _id: prestamoId,
      fecha_devolucion: fecha_devolucion || null
    });
    
    res.status(201).json({ _id: prestamoId, fecha_devolucion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updatePrestamo(req, res) {
  try {
    const prestamoIdAntiguo = JSON.parse(req.params.id);
    const { usuario_id, copia_id, fecha_prestamo, fecha_devolucion } = req.body;
    if (!usuario_id || !copia_id || !fecha_prestamo) {
      return res.status(400).json({ error: 'usuario_id, copia_id y fecha_prestamo son obligatorios' });
    }
    
    const db = getDB();
    const prestamoIdNuevo = {
      usuario_id,
      copia_id,
      fecha_prestamo
    };
    
    await db.collection('prestamo').deleteOne({ _id: prestamoIdAntiguo });
    await db.collection('prestamo').insertOne({
      _id: prestamoIdNuevo,
      fecha_devolucion: fecha_devolucion || null
    });
    
    res.json({ message: 'Préstamo actualizado', _id: prestamoIdNuevo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deletePrestamo(req, res) {
  try {
    const db = getDB();
    const prestamoId = JSON.parse(req.params.id);
    const result = await db.collection('prestamo').deleteOne({ _id: prestamoId });
    
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Préstamo no encontrado' });
    res.json({ message: 'Préstamo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getPrestamos, getPrestamoById, createPrestamo, updatePrestamo, deletePrestamo };

module.exports = { getPrestamos, getPrestamoById, createPrestamo, updatePrestamo, deletePrestamo };
