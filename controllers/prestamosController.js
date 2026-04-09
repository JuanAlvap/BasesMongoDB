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
    
    // Validar que la fecha de devolución no sea anterior a la fecha de préstamo
    if (fecha_devolucion && fecha_devolucion < fecha_prestamo) {
      return res.status(400).json({ error: 'La fecha de devolución no puede ser anterior a la fecha de préstamo' });
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
    
    console.log('=== UPDATE PRESTAMO ===');
    console.log('ID Antiguo:', JSON.stringify(prestamoIdAntiguo));
    console.log('Nuevos datos:', { usuario_id, copia_id, fecha_prestamo, fecha_devolucion });
    
    // Validar que al menos se proporcionen los datos del ID del préstamo
    if (!usuario_id || !copia_id || !fecha_prestamo) {
      return res.status(400).json({ error: 'usuario_id, copia_id y fecha_prestamo son obligatorios' });
    }
    
    // Validar que la fecha de devolución no sea anterior a la fecha de préstamo
    if (fecha_devolucion && fecha_devolucion < fecha_prestamo) {
      return res.status(400).json({ error: 'La fecha de devolución no puede ser anterior a la fecha de préstamo' });
    }
    
    const db = getDB();
    
    // Construir el nuevo ID del préstamo
    const prestamoIdNuevo = {
      usuario_id,
      copia_id,
      fecha_prestamo
    };
    
    // Obtener el préstamo actual para preservar fecha_devolucion si no se proporciona una nueva
    const prestamoActual = await db.collection('prestamo').findOne({ _id: prestamoIdAntiguo });
    
    if (!prestamoActual) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }
    
    // Usar la nueva fecha_devolucion si se proporciona, si no usar la actual
    const fechaDevolucionFinal = fecha_devolucion !== undefined ? fecha_devolucion : prestamoActual.fecha_devolucion;
    
    // Eliminar el préstamo antiguo
    await db.collection('prestamo').deleteOne({ _id: prestamoIdAntiguo });
    
    // Insertar el préstamo con los nuevos datos
    await db.collection('prestamo').insertOne({
      _id: prestamoIdNuevo,
      fecha_devolucion: fechaDevolucionFinal
    });
    
    console.log('Préstamo actualizado exitosamente');
    
    res.json({ message: 'Préstamo actualizado', _id: prestamoIdNuevo, fecha_devolucion: fechaDevolucionFinal });
  } catch (error) {
    console.error('ERROR en updatePrestamo:', error);
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
