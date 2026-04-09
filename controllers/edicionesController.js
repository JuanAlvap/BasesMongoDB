const { getDB } = require('../config/db');

async function getEdiciones(req, res) {
  try {
    const db = getDB();
    const ediciones = await db.collection('edicion').find({}).toArray();
    res.json(ediciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getEdicionById(req, res) {
  try {
    const db = getDB();
    const edicion = await db.collection('edicion').findOne({ _id: req.params.id });
    if (!edicion) return res.status(404).json({ error: 'Edición no encontrada' });
    res.json(edicion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createEdicion(req, res) {
  try {
    const { ISBN, anio, idioma, libro_id } = req.body;
    if (!ISBN || !anio || !idioma || !libro_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    const db = getDB();
    await db.collection('edicion').insertOne({
      _id: ISBN,
      anio: parseInt(anio),
      idioma,
      libro_id
    });
    res.status(201).json({ _id: ISBN, anio, idioma, libro_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateEdicion(req, res) {
  try {
    const isbnAntiguo = req.params.id;
    const { ISBN, anio, idioma, libro_id } = req.body;
    if (!ISBN || !anio || !idioma || !libro_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    const db = getDB();
    
    // Obtener los préstamos asociados al ISBN antiguo antes de eliminar
    const prestamosAsociados = await db.collection('prestamo').find({
      '_id.copia_id.edicion_id': isbnAntiguo
    }).toArray();
    
    // Actualizar en la colección de copias (cascada)
    const copias = await db.collection('copia').find({ '_id.edicion_id': isbnAntiguo }).toArray();
    for (const copia of copias) {
      await db.collection('copia').deleteOne({ _id: copia._id });
      await db.collection('copia').insertOne({
        _id: { numero: copia._id.numero, edicion_id: ISBN }
      });
    }
    
    // Actualizar en la colección de préstamos (cascada)
    for (const prestamo of prestamosAsociados) {
      // Eliminar préstamo antiguo
      await db.collection('prestamo').deleteOne({ _id: prestamo._id });
      // Crear préstamo nuevo con el nuevo ISBN
      await db.collection('prestamo').insertOne({
        _id: {
          usuario_id: prestamo._id.usuario_id,
          copia_id: {
            numero: prestamo._id.copia_id.numero,
            edicion_id: ISBN
          },
          fecha_prestamo: prestamo._id.fecha_prestamo
        },
        fecha_devolucion: prestamo.fecha_devolucion
      });
    }
    
    // Actualizar la edición
    await db.collection('edicion').deleteOne({ _id: isbnAntiguo });
    await db.collection('edicion').insertOne({
      _id: ISBN,
      anio: parseInt(anio),
      idioma,
      libro_id
    });
    
    res.json({ message: 'Edición actualizada', _id: ISBN });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteEdicion(req, res) {
  try {
    const db = getDB();
    const result = await db.collection('edicion').deleteOne({ _id: req.params.id });
    
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Edición no encontrada' });
    res.json({ message: 'Edición eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getEdiciones, getEdicionById, createEdicion, updateEdicion, deleteEdicion };

module.exports = { getEdiciones, getEdicionById, createEdicion, updateEdicion, deleteEdicion };
