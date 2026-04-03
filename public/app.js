const API_URL = `${window.location.origin}/api`;

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
  cargarAutores(); // Cargar autores automáticamente al abrir la página
});

// ==================== VALIDACIONES ====================
// Mapear errores del servidor a mensajes amigables
function mapearErrorServidor(error, tipo) {
  if (error.includes('E11000') || error.includes('duplicate')) {
    return 'Este registro ya existe. No puede haber duplicados en las claves primarias.';
  }
  if (error.includes('validation')) {
    return 'Los datos ingresados no son válidos. Revisa los campos requeridos.';
  }
  if (error.includes('not found')) {
    return 'El registro no existe.';
  }
  return error;
}

// Validar que un RUT exista
async function validarRutExiste(rut) {
  try {
    const response = await fetch(`${API_URL}/usuarios/${rut}`);
    return response.ok;
  } catch {
    return false;
  }
}

// Validar que un ISBN exista
async function validarISBNExiste(isbn) {
  try {
    const response = await fetch(`${API_URL}/ediciones/${isbn}`);
    return response.ok;
  } catch {
    return false;
  }
}

// Validar que una copia exista
async function validarCopiaExiste(numero, edicion_id) {
  try {
    const response = await fetch(`${API_URL}/copias`);
    const copias = await response.json();
    return copias.some(c => c._id.numero === parseInt(numero) && c._id.edicion_id === edicion_id);
  } catch {
    return false;
  }
}

// Validar que un autor exista
async function validarAutorExiste(nombre) {
  try {
    const response = await fetch(`${API_URL}/autores`);
    const autores = await response.json();
    return autores.some(a => a._id === nombre);
  } catch {
    return false;
  }
}

// Validar que una copia no esté prestada sin devolverse
async function validarCopiaPuedePrestar(copiaNumero, copiaEdicionId) {
  try {
    const response = await fetch(`${API_URL}/prestamos`);
    const prestamos = await response.json();
    
    // Buscar si hay un préstamo activo (sin devolución) para esta copia
    const prestamoActivo = prestamos.find(p => 
      p._id.copia_id.numero === parseInt(copiaNumero) &&
      p._id.copia_id.edicion_id === copiaEdicionId &&
      !p.fecha_devolucion // Sin devolución registrada
    );
    
    // Retorna true si NO hay préstamo activo (pueda prestar)
    return !prestamoActivo;
  } catch {
    return true; // Si hay error, permitir (débil pero mejor que bloquear)
  }
}

// Validar que una fecha sea válida (formato YYYY-MM-DD)
function validarFecha(fecha) {
  if (!fecha) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(fecha)) return false;
  const date = new Date(fecha);
  return date instanceof Date && !isNaN(date);
}

// Validar que fecha de devolución sea posterior a fecha de préstamo
function validarFechasPrestamo(fechaPrestamo, fechaDevolucion) {
  if (!fechaDevolucion) return true; // Es opcional
  const prestamo = new Date(fechaPrestamo);
  const devolucion = new Date(fechaDevolucion);
  return devolucion > prestamo;
}

// ==================== TABS ====================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const tabName = e.target.getAttribute('data-tab');
    switchTab(tabName, e.target);
  });
});

function switchTab(tabName, btn) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById(tabName).classList.add('active');
  btn.classList.add('active');
  
  if (tabName === 'autores') cargarAutores();
  else if (tabName === 'libros') cargarLibros();
  else if (tabName === 'ediciones') cargarEdiciones();
  else if (tabName === 'copias') cargarCopias();
  else if (tabName === 'usuarios') cargarUsuarios();
  else if (tabName === 'prestamos') cargarPrestamos();
}

// ==================== AUTORES ====================
document.getElementById('formAutor')?.addEventListener('submit', guardarAutor);

async function cargarAutores() {
  try {
    const response = await fetch(`${API_URL}/autores`);
    const autores = await response.json();
    const tbody = document.querySelector('#tablAutores tbody');
    tbody.innerHTML = '';
    
    autores.forEach(autor => {
      const nombre = autor._id;
      const row = `<tr><td>${nombre}</td><td><button class="btn-edit" onclick="editarAutor('${nombre}')">Editar</button><button class="btn-delete" onclick="eliminarAutor('${nombre}')">Eliminar</button></td></tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    mostrarMensaje('Error cargando autores', 'error');
  }
}

async function guardarAutor(e) {
  e.preventDefault();
  const nombreAntiguo = document.getElementById('autorId').value;
  const nombreNuevo = document.getElementById('autorNombre').value.trim();
  
  if (!nombreNuevo) {
    mostrarMensaje('El nombre del autor es obligatorio', 'error');
    limpiarFormAutor();
    return;
  }
  
  if (nombreNuevo.length < 3) {
    mostrarMensaje('El nombre debe tener al menos 3 caracteres', 'error');
    limpiarFormAutor();
    return;
  }
  
  // Validar duplicado si es nuevo nombre
  if (!nombreAntiguo && nombreNuevo !== nombreAntiguo) {
    const existe = await validarAutorExiste(nombreNuevo);
    if (existe) {
      mostrarMensaje('Este nombre de autor ya existe. No se pueden repetir los mismos nombres.', 'error');
      limpiarFormAutor();
      return;
    }
  }
  
  try {
    const method = nombreAntiguo ? 'PUT' : 'POST';
    const url = nombreAntiguo ? `${API_URL}/autores/${nombreAntiguo}` : `${API_URL}/autores`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombreNuevo })
    });
    
    if (response.ok) {
      mostrarMensaje(`Autor ${nombreAntiguo ? 'actualizado' : 'creado'} correctamente`, 'success');
      limpiarFormAutor();
      cargarAutores();
    } else {
      const error = await response.json();
      const mensajeAmigable = mapearErrorServidor(error.error || 'No se pudo guardar', 'autor');
      mostrarMensaje('Error: ' + mensajeAmigable, 'error');
      limpiarFormAutor();
    }
  } catch (error) {
    mostrarMensaje('Error: ' + error.message, 'error');
    limpiarFormAutor();
  }
}

function editarAutor(nombre) {
  document.getElementById('autorId').value = nombre;
  document.getElementById('autorNombre').value = nombre;
}

function limpiarFormAutor() {
  document.getElementById('formAutor').reset();
  document.getElementById('autorId').value = '';
}

async function eliminarAutor(id) {
  mostrarConfirmacion('¿Está seguro de que desea eliminar este autor?', async (confirmado) => {
    if (!confirmado) return;
    try {
      const response = await fetch(`${API_URL}/autores/${id}`, { method: 'DELETE' });
      if (response.ok) {
        mostrarMensaje('Autor eliminado', 'success');
        cargarAutores();
      } else {
        mostrarMensaje('Error al eliminar', 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al eliminar', 'error');
    }
  });
}

// ==================== LIBROS ====================
document.getElementById('formLibro')?.addEventListener('submit', guardarLibro);

async function cargarLibros() {
  try {
    const response = await fetch(`${API_URL}/libros`);
    const libros = await response.json();
    const tbody = document.querySelector('#tablLibros tbody');
    tbody.innerHTML = '';
    
    libros.forEach(libro => {
      const titulo = libro._id;
      const autores = (libro.autor_ids || []).join(', ') || '-';
      const row = `<tr><td>${titulo}</td><td>${autores}</td><td><button class="btn-edit" onclick="editarLibro('${titulo}', '${(libro.autor_ids || []).join(',')}')">Editar</button><button class="btn-delete" onclick="eliminarLibro('${titulo}')">Eliminar</button></td></tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    mostrarMensaje('Error cargando libros', 'error');
  }
}

async function guardarLibro(e) {
  e.preventDefault();
  const tituloAntiguo = document.getElementById('libroId').value;
  const tituloNuevo = document.getElementById('libroTitulo').value.trim();
  const autoresStr = document.getElementById('libroAutores').value;
  const autor_ids = autoresStr ? autoresStr.split(',').map(a => a.trim()).filter(a => a) : [];
  
  if (!tituloNuevo) {
    mostrarMensaje('El título del libro es obligatorio', 'error');
    limpiarFormLibro();
    return;
  }
  
  if (!autor_ids.length) {
    mostrarMensaje('Debe ingresar al menos un autor', 'error');
    limpiarFormLibro();
    return;
  }
  
  if (tituloNuevo.length < 3) {
    mostrarMensaje('El título debe tener al menos 3 caracteres', 'error');
    limpiarFormLibro();
    return;
  }
  
  // Validar que todos los autores existan
  for (const autor of autor_ids) {
    const existe = await validarAutorExiste(autor);
    if (!existe) {
      mostrarMensaje(`El autor "${autor}" no existe en el sistema`, 'error');
      limpiarFormLibro();
      return;
    }
  }
  
  try {
    const method = tituloAntiguo ? 'PUT' : 'POST';
    const url = tituloAntiguo ? `${API_URL}/libros/${tituloAntiguo}` : `${API_URL}/libros`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: tituloNuevo, autor_ids })
    });
    
    if (response.ok) {
      mostrarMensaje(`Libro ${tituloAntiguo ? 'actualizado' : 'creado'} correctamente`, 'success');
      limpiarFormLibro();
      cargarLibros();
    } else {
      const error = await response.json();
      const mensajeAmigable = mapearErrorServidor(error.error || 'No se pudo guardar', 'libro');
      mostrarMensaje('Error: ' + mensajeAmigable, 'error');
      limpiarFormLibro();
    }
  } catch (error) {
    mostrarMensaje('Error: ' + error.message, 'error');
    limpiarFormLibro();
  }
}

function editarLibro(titulo, autores) {
  document.getElementById('libroId').value = titulo;
  document.getElementById('libroTitulo').value = titulo;
  document.getElementById('libroAutores').value = autores;
}

function limpiarFormLibro() {
  document.getElementById('formLibro').reset();
  document.getElementById('libroId').value = '';
}

async function eliminarLibro(id) {
  mostrarConfirmacion('¿Está seguro de que desea eliminar este libro?', async (confirmado) => {
    if (!confirmado) return;
    try {
      const response = await fetch(`${API_URL}/libros/${id}`, { method: 'DELETE' });
      if (response.ok) {
        mostrarMensaje('Libro eliminado', 'success');
        cargarLibros();
      } else {
        mostrarMensaje('Error al eliminar', 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al eliminar', 'error');
    }
  });
}

// ==================== EDICIONES ====================
document.getElementById('formEdicion')?.addEventListener('submit', guardarEdicion);

async function cargarEdiciones() {
  try {
    const response = await fetch(`${API_URL}/ediciones`);
    const ediciones = await response.json();
    const tbody = document.querySelector('#tablEdiciones tbody');
    tbody.innerHTML = '';
    
    ediciones.forEach(ed => {
      const ISBN = ed._id;
      const row = `<tr><td>${ISBN}</td><td>${ed.anio}</td><td>${ed.idioma}</td><td>${ed.libro_id}</td><td><button class="btn-edit" onclick="editarEdicion('${ISBN}', ${ed.anio}, '${ed.idioma}', '${ed.libro_id}')">Editar</button><button class="btn-delete" onclick="eliminarEdicion('${ISBN}')">Eliminar</button></td></tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    mostrarMensaje('Error cargando ediciones', 'error');
  }
}

async function guardarEdicion(e) {
  e.preventDefault();
  const ISBNAntiguo = document.getElementById('edicionId').value;
  const ISBN = document.getElementById('edicionISBN').value.trim();
  const anio = document.getElementById('edicionAño').value;
  const idioma = document.getElementById('edicionIdioma').value.trim();
  const libro_id = document.getElementById('edicionLibroId').value.trim();
  
  if (!ISBN || !anio || !idioma || !libro_id) {
    mostrarMensaje('Todos los campos son obligatorios', 'error');
    limpiarFormEdicion();
    return;
  }
  
  // Validar que el libro exista
  try {
    const response = await fetch(`${API_URL}/libros/${libro_id}`);
    if (!response.ok) {
      mostrarMensaje(`El libro "${libro_id}" no existe en el sistema`, 'error');
      limpiarFormEdicion();
      return;
    }
  } catch {
    mostrarMensaje('Error validando el libro', 'error');
    limpiarFormEdicion();
    return;
  }
  
  if (isNaN(parseInt(anio)) || parseInt(anio) < 1000 || parseInt(anio) > new Date().getFullYear()) {
    mostrarMensaje(`El año debe ser entre 1000 y ${new Date().getFullYear()}`, 'error');
    limpiarFormEdicion();
    return;
  }
  
  if (idioma.length < 2) {
    mostrarMensaje('El idioma debe tener al menos 2 caracteres', 'error');
    limpiarFormEdicion();
    return;
  }
  
  try {
    const method = ISBNAntiguo ? 'PUT' : 'POST';
    const url = ISBNAntiguo ? `${API_URL}/ediciones/${ISBNAntiguo}` : `${API_URL}/ediciones`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ISBN, anio: parseInt(anio), idioma, libro_id })
    });
    
    if (response.ok) {
      mostrarMensaje(`Edición ${ISBNAntiguo ? 'actualizada' : 'creada'} correctamente`, 'success');
      limpiarFormEdicion();
      cargarEdiciones();
    } else {
      const error = await response.json();
      const mensajeAmigable = mapearErrorServidor(error.error || 'No se pudo guardar', 'edicion');
      mostrarMensaje('Error: ' + mensajeAmigable, 'error');
      limpiarFormEdicion();
    }
  } catch (error) {
    mostrarMensaje('Error: ' + error.message, 'error');
    limpiarFormEdicion();
  }
}

function editarEdicion(ISBN, anio, idioma, libro_id) {
  document.getElementById('edicionId').value = ISBN;
  document.getElementById('edicionISBN').value = ISBN;
  document.getElementById('edicionAño').value = anio;
  document.getElementById('edicionIdioma').value = idioma;
  document.getElementById('edicionLibroId').value = libro_id;
}

function limpiarFormEdicion() {
  document.getElementById('formEdicion').reset();
  document.getElementById('edicionId').value = '';
}

async function eliminarEdicion(id) {
  mostrarConfirmacion('¿Está seguro de que desea eliminar esta edición?', async (confirmado) => {
    if (!confirmado) return;
    try {
      const response = await fetch(`${API_URL}/ediciones/${id}`, { method: 'DELETE' });
      if (response.ok) {
        mostrarMensaje('Edición eliminada', 'success');
        cargarEdiciones();
      } else {
        mostrarMensaje('Error al eliminar', 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al eliminar', 'error');
    }
  });
}

// ==================== COPIAS ====================
document.getElementById('formCopia')?.addEventListener('submit', guardarCopia);

async function cargarCopias() {
  try {
    const response = await fetch(`${API_URL}/copias`);
    const copias = await response.json();
    const tbody = document.querySelector('#tablCopias tbody');
    tbody.innerHTML = '';
    
    copias.forEach((copia, idx) => {
      const numero = copia._id.numero;
      const edicion_id = copia._id.edicion_id;
      const btnId = `copia-btn-${idx}`;
      const row = `<tr><td>${numero}</td><td>${edicion_id}</td><td><button class="btn-edit" id="edit-${btnId}" data-numero="${numero}" data-edicion="${edicion_id}" data-id='${JSON.stringify(copia._id)}'>Editar</button><button class="btn-delete" id="del-${btnId}" data-id='${JSON.stringify(copia._id)}'>Eliminar</button></td></tr>`;
      tbody.innerHTML += row;
    });
    
    // Agregar event listeners
    document.querySelectorAll('[id^="edit-copia-"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const numero = btn.dataset.numero;
        const edicion = btn.dataset.edicion;
        const id = btn.dataset.id;
        editarCopia(id, numero, edicion);
      });
    });
    
    document.querySelectorAll('[id^="del-copia-"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        eliminarCopia(id);
      });
    });
  } catch (error) {
    mostrarMensaje('Error cargando copias', 'error');
  }
}

async function guardarCopia(e) {
  e.preventDefault();
  const idAntiguo = document.getElementById('copiaId').value;
  const numero = document.getElementById('copiaNumero').value;
  const edicion_id = document.getElementById('copiaEdicionId').value.trim();
  
  if (!numero || !edicion_id) {
    mostrarMensaje('Todos los campos son obligatorios', 'error');
    limpiarFormCopia();
    return;
  }
  
  if (isNaN(parseInt(numero)) || parseInt(numero) < 1) {
    mostrarMensaje('El número de copia debe ser un entero positivo', 'error');
    limpiarFormCopia();
    return;
  }
  
  // Validar que la edición exista
  const edicionExiste = await validarISBNExiste(edicion_id);
  if (!edicionExiste) {
    mostrarMensaje(`El ISBN "${edicion_id}" no existe en el sistema`, 'error');
    limpiarFormCopia();
    return;
  }
  
  try {
    const method = idAntiguo ? 'PUT' : 'POST';
    const url = idAntiguo ? `${API_URL}/copias/${idAntiguo}` : `${API_URL}/copias`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero: parseInt(numero), edicion_id })
    });
    
    if (response.ok) {
      mostrarMensaje(`Copia ${idAntiguo ? 'actualizada' : 'creada'} correctamente`, 'success');
      limpiarFormCopia();
      cargarCopias();
    } else {
      const error = await response.json();
      const mensajeAmigable = mapearErrorServidor(error.error || 'No se pudo guardar', 'copia');
      mostrarMensaje('Error: ' + mensajeAmigable, 'error');
      limpiarFormCopia();
    }
  } catch (error) {
    mostrarMensaje('Error: ' + error.message, 'error');
    limpiarFormCopia();
  }
}

function editarCopia(idStr, numero, edicion_id) {
  // idStr es un string JSON
  try {
    const id = typeof idStr === 'string' ? JSON.parse(idStr) : idStr;
    document.getElementById('copiaId').value = JSON.stringify(id);
    document.getElementById('copiaNumero').value = id.numero;
    document.getElementById('copiaEdicionId').value = id.edicion_id;
  } catch (e) {
    mostrarMensaje('Error al cargar los datos para editar', 'error');
  }
}

function limpiarFormCopia() {
  document.getElementById('formCopia').reset();
  document.getElementById('copiaId').value = '';
}

async function eliminarCopia(idStr) {
  mostrarConfirmacion('¿Está seguro de que desea eliminar esta copia?', async (confirmado) => {
    if (!confirmado) return;
    try {
      // Parseamos el JSON string si es necesario
      const id = typeof idStr === 'string' && idStr.startsWith('{') ? JSON.parse(idStr) : idStr;
      const idEncoded = encodeURIComponent(JSON.stringify(id));
      const url = `${API_URL}/copias/${idEncoded}`;
      
      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        mostrarMensaje('Copia eliminada correctamente', 'success');
        cargarCopias();
      } else {
        const error = await response.json();
        const mensajeAmigable = mapearErrorServidor(error.error || 'No se pudo eliminar', 'copia');
        mostrarMensaje('Error: ' + mensajeAmigable, 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al eliminar: ' + error.message, 'error');
    }
  });
}

// ==================== USUARIOS ====================
document.getElementById('formUsuario')?.addEventListener('submit', guardarUsuario);

async function cargarUsuarios() {
  try {
    const response = await fetch(`${API_URL}/usuarios`);
    const usuarios = await response.json();
    const tbody = document.querySelector('#tablUsuarios tbody');
    tbody.innerHTML = '';
    
    usuarios.forEach(usuario => {
      const rut = usuario._id;
      const nombre = usuario.nombre;
      const row = `<tr><td>${rut}</td><td>${nombre}</td><td><button class="btn-edit" onclick="editarUsuario('${rut}', '${nombre}')">Editar</button><button class="btn-delete" onclick="eliminarUsuario('${rut}')">Eliminar</button></td></tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    mostrarMensaje('Error cargando usuarios', 'error');
  }
}

async function guardarUsuario(e) {
  e.preventDefault();
  const rutAntiguo = document.getElementById('usuarioId').value;
  const rut = document.getElementById('usuarioRUT').value.trim();
  const nombre = document.getElementById('usuarioNombre').value.trim();
  
  if (!rut || !nombre) {
    mostrarMensaje('Todos los campos son obligatorios', 'error');
    limpiarFormUsuario();
    return;
  }
  
  if (nombre.length < 3) {
    mostrarMensaje('El nombre debe tener al menos 3 caracteres', 'error');
    limpiarFormUsuario();
    return;
  }
  
  // Validar formato de RUT básico
  if (rut.length < 5) {
    mostrarMensaje('El RUT parece inválido', 'error');
    limpiarFormUsuario();
    return;
  }
  
  // Validar duplicado si es nuevo RUT
  if (!rutAntiguo && rut !== rutAntiguo) {
    const existe = await validarRutExiste(rut);
    if (existe) {
      mostrarMensaje('Este RUT de usuario ya existe. No se pueden repetir los mismos RUT.', 'error');
      limpiarFormUsuario();
      return;
    }
  }
  
  try {
    const method = rutAntiguo ? 'PUT' : 'POST';
    const url = rutAntiguo ? `${API_URL}/usuarios/${rutAntiguo}` : `${API_URL}/usuarios`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rut, nombre })
    });
    
    if (response.ok) {
      mostrarMensaje(`Usuario ${rutAntiguo ? 'actualizado' : 'creado'} correctamente`, 'success');
      limpiarFormUsuario();
      cargarUsuarios();
    } else {
      const error = await response.json();
      const mensajeAmigable = mapearErrorServidor(error.error || 'No se pudo guardar', 'usuario');
      mostrarMensaje('Error: ' + mensajeAmigable, 'error');
      limpiarFormUsuario();
    }
  } catch (error) {
    mostrarMensaje('Error: ' + error.message, 'error');
    limpiarFormUsuario();
  }
}

function editarUsuario(rut, nombre) {
  document.getElementById('usuarioId').value = rut;
  document.getElementById('usuarioRUT').value = rut;
  document.getElementById('usuarioNombre').value = nombre;
}

function limpiarFormUsuario() {
  document.getElementById('formUsuario').reset();
  document.getElementById('usuarioId').value = '';
}

async function eliminarUsuario(id) {
  mostrarConfirmacion('¿Está seguro de que desea eliminar este usuario?', async (confirmado) => {
    if (!confirmado) return;
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' });
      if (response.ok) {
        mostrarMensaje('Usuario eliminado', 'success');
        cargarUsuarios();
      } else {
        mostrarMensaje('Error al eliminar', 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al eliminar', 'error');
    }
  });
}

// ==================== PRÉSTAMOS ====================
document.getElementById('formPrestamo')?.addEventListener('submit', guardarPrestamo);

async function cargarPrestamos() {
  try {
    // Cargar usuarios primero para obtener los nombres
    const usuariosRes = await fetch(`${API_URL}/usuarios`);
    const usuarios = await usuariosRes.json();
    const usuariosMap = {};
    usuarios.forEach(u => {
      usuariosMap[u._id] = u.nombre;
    });

    const response = await fetch(`${API_URL}/prestamos`);
    const prestamos = await response.json();
    const tbody = document.querySelector('#tablPrestamos tbody');
    tbody.innerHTML = '';
    
    prestamos.forEach((prestamo, idx) => {
      const usuario_id = prestamo._id.usuario_id;
      const usuario_nombre = usuariosMap[usuario_id] || usuario_id;
      const numero = prestamo._id.copia_id.numero;
      const isbn = prestamo._id.copia_id.edicion_id;
      const fecha_prestamo = prestamo._id.fecha_prestamo;
      const fecha_devolucion = prestamo.fecha_devolucion || '-';
      const btnId = `prestamo-btn-${idx}`;
      const row = `<tr><td>${usuario_id}</td><td>${usuario_nombre}</td><td>${numero}</td><td>${isbn}</td><td>${fecha_prestamo}</td><td>${fecha_devolucion}</td><td><button class="btn-edit" id="edit-${btnId}" data-prestamo='${JSON.stringify(prestamo)}' data-id='${JSON.stringify(prestamo._id)}'>Editar</button><button class="btn-delete" id="del-${btnId}" data-id='${JSON.stringify(prestamo._id)}'>Eliminar</button></td></tr>`;
      tbody.innerHTML += row;
    });
    
    // Agregar event listeners para editar
    document.querySelectorAll('[id^="edit-prestamo-"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prestamoData = btn.dataset.prestamo;
        editarPrestamo(prestamoData);
      });
    });
    
    // Agregar event listeners para eliminar
    document.querySelectorAll('[id^="del-prestamo-"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        eliminarPrestamo(id);
      });
    });
  } catch (error) {
    mostrarMensaje('Error cargando préstamos', 'error');
  }
}

async function guardarPrestamo(e) {
  e.preventDefault();
  const prestamoIdAntiguo = document.getElementById('prestamoId').value;
  const usuario_id = document.getElementById('prestamoUsuarioId').value.trim();
  const copiaNumero = document.getElementById('prestamoCopiaNumero').value;
  const copiaEdicionId = document.getElementById('prestamoCopiaEdicionId').value.trim();
  const fecha_prestamo = document.getElementById('prestamoFechaPrestamo').value;
  const fecha_devolucion = document.getElementById('prestamoFechaDevolucion').value || null;
  
  if (!usuario_id || !copiaNumero || !copiaEdicionId || !fecha_prestamo) {
    mostrarMensaje('Los campos obligatorios no pueden estar vacíos', 'error');
    limpiarFormPrestamo();
    return;
  }
  
  // Validar que el RUT exista
  const rutExiste = await validarRutExiste(usuario_id);
  if (!rutExiste) {
    mostrarMensaje(`El RUT "${usuario_id}" no existe en el sistema`, 'error');
    limpiarFormPrestamo();
    return;
  }
  
  // Validar que el ISBN exista
  const isbnExiste = await validarISBNExiste(copiaEdicionId);
  if (!isbnExiste) {
    mostrarMensaje(`El ISBN "${copiaEdicionId}" no existe en el sistema`, 'error');
    limpiarFormPrestamo();
    return;
  }
  
  // Validar que la copia exista
  const copiaExiste = await validarCopiaExiste(copiaNumero, copiaEdicionId);
  if (!copiaExiste) {
    mostrarMensaje(`La copia número ${copiaNumero} del ISBN ${copiaEdicionId} no existe`, 'error');
    limpiarFormPrestamo();
    return;
  }
  
  // Validar que la copia no esté prestada sin devolverse (solo si es nuevo préstamo)
  if (!prestamoIdAntiguo) {
    const puedePrestar = await validarCopiaPuedePrestar(copiaNumero, copiaEdicionId);
    if (!puedePrestar) {
      mostrarMensaje(`La copia número ${copiaNumero} ya está prestada y aún no ha sido devuelta`, 'error');
      limpiarFormPrestamo();
      return;
    }
  }
  
  // Validar formato de fechas
  if (!validarFecha(fecha_prestamo)) {
    mostrarMensaje('La fecha de préstamo no es válida', 'error');
    limpiarFormPrestamo();
    return;
  }
  
  if (fecha_devolucion && !validarFecha(fecha_devolucion)) {
    mostrarMensaje('La fecha de devolución no es válida', 'error');
    limpiarFormPrestamo();
    return;
  }
  
  // Validar que fecha de devolución sea posterior a prestamo
  if (fecha_devolucion && !validarFechasPrestamo(fecha_prestamo, fecha_devolucion)) {
    mostrarMensaje('La fecha de devolución debe ser posterior a la fecha de préstamo', 'error');
    limpiarFormPrestamo();
    return;
  }
  
  try {
    const copia_id = { numero: parseInt(copiaNumero), edicion_id: copiaEdicionId };
    const method = prestamoIdAntiguo ? 'PUT' : 'POST';
    const url = prestamoIdAntiguo ? `${API_URL}/prestamos/${prestamoIdAntiguo}` : `${API_URL}/prestamos`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id, copia_id, fecha_prestamo, fecha_devolucion })
    });
    
    if (response.ok) {
      mostrarMensaje(`Préstamo ${prestamoIdAntiguo ? 'actualizado' : 'creado'} correctamente`, 'success');
      limpiarFormPrestamo();
      cargarPrestamos();
    } else {
      const error = await response.json();
      const mensajeAmigable = mapearErrorServidor(error.error || 'No se pudo guardar', 'prestamo');
      mostrarMensaje('Error: ' + mensajeAmigable, 'error');
      limpiarFormPrestamo();
    }
  } catch (error) {
    mostrarMensaje('Error: ' + error.message, 'error');
    limpiarFormPrestamo();
  }
}

function editarPrestamo(prestamoDataStr) {
  try {
    const prestamoData = typeof prestamoDataStr === 'string' ? JSON.parse(prestamoDataStr) : prestamoDataStr;
    const usuario_id = prestamoData._id.usuario_id;
    const copiaNumero = prestamoData._id.copia_id.numero;
    const copiaEdicionId = prestamoData._id.copia_id.edicion_id;
    const fecha_prestamo = prestamoData._id.fecha_prestamo;
    const fecha_devolucion = prestamoData.fecha_devolucion || '';
    
    document.getElementById('prestamoId').value = JSON.stringify(prestamoData._id);
    document.getElementById('prestamoUsuarioId').value = usuario_id;
    document.getElementById('prestamoCopiaNumero').value = copiaNumero;
    document.getElementById('prestamoCopiaEdicionId').value = copiaEdicionId;
    document.getElementById('prestamoFechaPrestamo').value = fecha_prestamo;
    document.getElementById('prestamoFechaDevolucion').value = fecha_devolucion;
  } catch (e) {
    mostrarMensaje('Error al cargar los datos para editar', 'error');
  }
}

function limpiarFormPrestamo() {
  document.getElementById('formPrestamo').reset();
  document.getElementById('prestamoId').value = '';
}

async function eliminarPrestamo(idStr) {
  mostrarConfirmacion('¿Está seguro de que desea eliminar este préstamo?', async (confirmado) => {
    if (!confirmado) return;
    try {
      // Parseamos el JSON string si es necesario
      const id = typeof idStr === 'string' && idStr.startsWith('{') ? JSON.parse(idStr) : idStr;
      const idEncoded = encodeURIComponent(JSON.stringify(id));
      const url = `${API_URL}/prestamos/${idEncoded}`;
      
      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        mostrarMensaje('Préstamo eliminado correctamente', 'success');
        cargarPrestamos();
      } else {
        const error = await response.json();
        const mensajeAmigable = mapearErrorServidor(error.error || 'No se pudo eliminar', 'prestamo');
        mostrarMensaje('Error: ' + mensajeAmigable, 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al eliminar: ' + error.message, 'error');
    }
  });
}

// ==================== UTILIDADES ====================
function mostrarMensaje(texto, tipo = 'info') {
  const modal = document.getElementById('modalMensaje');
  const modalTitulo = document.getElementById('mensajeTitulo');
  const modalTexto = document.getElementById('mensajeTexto');
  
  // Definir título según tipo
  let titulo = 'Mensaje';
  if (tipo === 'error') titulo = '⚠️ Error';
  else if (tipo === 'success') titulo = '✅ Éxito';
  else if (tipo === 'info') titulo = 'ℹ️ Información';
  
  modalTitulo.textContent = titulo;
  modalTexto.textContent = texto;
  
  // Eliminar clases de color previas
  modal.classList.remove('error', 'success', 'info');
  // Agregar clase del tipo actual
  modal.classList.add(tipo);
  modal.classList.add('show');
  
  // Función para cerrar el modal
  const cerrarModal = () => {
    modal.classList.remove('show');
    modal.classList.remove('error', 'success', 'info');
  };
  
  // Cerrar automáticamente después de 2 segundos
  setTimeout(cerrarModal, 1500);
  
  // Cerrar al hacer clic fuera del modal
  const handleClickFuera = (e) => {
    if (e.target === modal) {
      cerrarModal();
      modal.removeEventListener('click', handleClickFuera);
    }
  };
  
  modal.addEventListener('click', handleClickFuera);
}

// Modal de confirmación personalizado
function mostrarConfirmacion(mensaje, callback) {
  const modal = document.getElementById('modalConfirm');
  const modalMensaje = modal.querySelector('.modal-mensaje');
  const btnSi = document.getElementById('btnSi');
  const btnNo = document.getElementById('btnNo');
  
  modalMensaje.textContent = mensaje;
  modal.classList.add('show');
  
  const handleSi = () => {
    modal.classList.remove('show');
    btnSi.removeEventListener('click', handleSi);
    btnNo.removeEventListener('click', handleNo);
    callback(true);
  };
  
  const handleNo = () => {
    modal.classList.remove('show');
    btnSi.removeEventListener('click', handleSi);
    btnNo.removeEventListener('click', handleNo);
    callback(false);
  };
  
  btnSi.addEventListener('click', handleSi);
  btnNo.addEventListener('click', handleNo);
  
  // Cerrar al hacer clic fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) handleNo();
  });
}
