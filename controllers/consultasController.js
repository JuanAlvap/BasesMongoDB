const { getDB } = require('../config/db');

// CONSULTA 1: Listado de todas las copias con información de Autor, Libro, Edición y Copia
async function getConsulta1(req, res) {
  try {
    const db = getDB();
    
    // Obtener todas las copias
    const copias = await db.collection('copia').find({}).toArray();
    
    // Para cada copia, enriquecer con datos de edición, libro y autores
    const resultado = [];
    
    for (const copia of copias) {
      // Obtener edición
      const edicion = await db.collection('edicion').findOne({ _id: copia._id.edicion_id });
      if (!edicion) continue;
      
      // Obtener libro
      const libro = await db.collection('libro').findOne({ _id: edicion.libro_id });
      if (!libro) continue;
      
      // Obtener autores
      let autoresNombre = [];
      const autorIds = Array.isArray(libro.autor_ids) ? libro.autor_ids : [libro.autor_ids];
      for (const autorId of autorIds) {
        const autor = await db.collection('autor').findOne({ _id: autorId });
        if (autor) autoresNombre.push(autor._id);
      }
      
      resultado.push({
        autor: autoresNombre.join(', '),
        libro: libro._id,
        isbn: edicion._id,
        anio: edicion.anio,
        idioma: edicion.idioma,
        numeroCopia: copia._id.numero
      });
    }
    
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// CONSULTA 2: Libros prestados por un usuario específico
async function getConsulta2(req, res) {
  try {
    const db = getDB();
    const { usuarioId } = req.query;
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId es requerido' });
    }
    
    // Obtener todas las copias y ediciones para reference
    const ediciones = await db.collection('edicion').find({}).toArray();
    const libros = await db.collection('libro').find({}).toArray();
    const autores = await db.collection('autor').find({}).toArray();
    
    // Crear mapas para acceso rápido
    const edicionesMap = {};
    ediciones.forEach(e => edicionesMap[e._id] = e);
    
    const librosMap = {};
    libros.forEach(l => librosMap[l._id] = l);
    
    const autoresMap = {};
    autores.forEach(a => autoresMap[a._id] = a);
    
    // Obtener usuario
    const usuario = await db.collection('usuario').findOne({ _id: usuarioId });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Obtener préstamos del usuario - buscar por _id.usuario_id
    const prestamos = await db.collection('prestamo').find({ '_id.usuario_id': usuarioId }).toArray();
    
    const resultado = [];
    for (const prestamo of prestamos) {
      const edicion = edicionesMap[prestamo._id.copia_id.edicion_id];
      if (!edicion) continue;
      
      const libro = librosMap[edicion.libro_id];
      if (!libro) continue;
      
      // Obtener autores
      let autoresNombre = [];
      const autorIds = Array.isArray(libro.autor_ids) ? libro.autor_ids : [libro.autor_ids];
      for (const autorId of autorIds) {
        const autor = autoresMap[autorId];
        if (autor) autoresNombre.push(autor._id);
      }
      
      resultado.push({
        usuarioRut: prestamo._id.usuario_id,
        usuarioNombre: usuario._id,
        autor: autoresNombre.join(', '),
        libro: libro._id,
        isbn: edicion._id,
        numeroCopia: prestamo._id.copia_id.numero,
        fechaPrestamo: prestamo._id.fecha_prestamo,
        fechaDevolucion: prestamo.fecha_devolucion || 'No devuelto'
      });
    }
    
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET todos los usuarios (para el selector en consulta 2)
async function getUsuariosParaConsulta(req, res) {
  try {
    const db = getDB();
    const usuarios = await db.collection('usuario').find({}).toArray();
    
    const resultado = usuarios.map(u => ({
      rut: u._id,
      nombre: u.nombre
    }));
    
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getConsulta1, getConsulta2, getUsuariosParaConsulta };
