const API_URL = 'http://localhost:5000/api';

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
      const row = `<tr><td>${autor._id}</td><td>${autor.nombre}</td><td><button class="btn-edit" onclick="editarAutor('${autor._id}', '${autor.nombre}')">Editar</button><button class="btn-delete" onclick="eliminarAutor('${autor._id}')">Eliminar</button></td></tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    mostrarMensaje('Error cargando autores', 'error');
  }
}

async function guardarAutor(e) {
  e.preventDefault();
  const id = document.getElementById('autorId').value;
  const nombre = document.getElementById('autorNombre').value;
  
  try {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/autores/${id}` : `${API_URL}/autores`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre })
    });
    
    if (response.ok) {
      mostrarMensaje(`Autor ${id ? 'actualizado' : 'creado'} correctamente`, 'success');
      limpiarFormAutor();
      cargarAutores();
    } else {
      mostrarMensaje('Error al guardar autor', 'error');
    }
  } catch (error) {
    mostrarMensaje('Error: ' + error.message, 'error');
  }
}

function editarAutor(id, nombre) {
  document.getElementById('autorId').value = id;
  document.getElementById('autorNombre').value = nombre;
}

function limpiarFormAutor() {
  document.getElementById('formAutor').reset();
  document.getElementById('autorId').value = '';
}

async function eliminarAutor(id) {
  if (!confirm('¿Está seguro de eliminar este autor?')) return;
  try {
    const response = await fetch(`${API_URL}/autores/${id}`, { method: 'DELETE' });
    if (response.ok) {
      mostrarMensaje('Autor eliminado', 'success');
      cargarAutores();
    }
  } catch (error) {
    mostrarMensaje('Error al eliminar', 'error');
  }
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
      const row = `<tr><td>${libro._id}</td><td>${libro.titulo}</td><td>${libro.autores?.join(', ') || '-'}</td><td><button class="btn-edit" onclick="editarLibro('${libro._id}', '${libro.titulo}', '${libro.autores?.join(',')}')">Editar</button><button class="btn-delete" onclick="eliminarLibro('${libro._id}')">Eliminar</button></td></tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    mostrarMensaje('Error cargando libros', 'error');
  }
}

async function guardarLibro(e) {
  e.preventDefault();
  const id = document.getElementById('libroId').value;
  const titulo = document.getElementById('libroTitulo').value;
  const autoresStr = document.getElementById('libroAutores').value;
  const autores = autoresStr ? autoresStr.split(',').map(a => a.trim()) : [];
  
  try {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/libros/${id}` : `${API_URL}/libros`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, autores })
    });
    
    if (response.ok) {
      mostrarMensaje(`Libro ${id ? 'actualizado' : 'creado'} correctamente`, 'success');
      limpiarFormLibro();
      cargarLibros();
    } else {
      mostrarMensaje('Error al guardar libro', 'error');
    }
  } catch (error) {
    mostrarMensaje('Error: ' + error.message, 'error');
  }
}

function editarLibro(id, titulo, autores) {
  document.getElementById('libroId').value = id;
  document.getElementById('libroTitulo').value = titulo;
  document.getElementById('libroAutores').value = autores;
}

function limpiarFormLibro() {
  document.getElementById('formLibro').reset();
  document.getElementById('libroId').value = '';
}

async function eliminarLibro(id) {
  if (!confirm('¿Está seguro?')) return;
  try {
    const response = await fetch(`${API_URL}/libros/${id}`, { method: 'DELETE' });
    if (response.ok) {
      mostrarMensaje('Libro eliminado', 'success');
      cargarLibros();
    }
  } catch (error) {
    mostrarMensaje('Error al eliminar', 'error');
  }
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
      const row = `<tr><td>${ed._id}</td><td>${ed.ISBN}</td><td>${ed.año}</td><td>${ed.idioma}</td><td>${ed.libro_id}</td><td><button class="btn-edit" onclick="editarEdicion('${ed._id}', '${ed.ISBN}', ${ed.año}, '${ed.idioma}', '${ed.libro_id}')">Editar</button><button class="btn-delete" onclick="eliminarEdicion('${ed._id}')">Eliminar</button></td></tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    mostrarMensaje('Error cargando ediciones', 'error');
  }
}

async function guardarEdicion(e) {
  e.preventDefault();
  const id = document.getElementById('edicionId').value;
  const ISBN = document.getElementById('edicionISBN').value;
  const año = document.getElementById('edicionAño').value;
  const idioma = document.getElementById('edicionIdioma').value;
  const libro_id = document.getElementById('edicionLibroId').value;
  
  try {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/ediciones/${id}` : `${API_URL}/ediciones`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ISBN, año, idioma, libro_id })
    });
    
    if (response.ok) {
      mostrarMensaje(`Edición ${id ? 'actualizada' : 'creada'} correctamente`, 'success');
      limpiarFormEdicion();
      cargarEdiciones();
    } else {
      mostrarMensaje('Error al guardar edición', 'error');
    }
  } catch (error) {
    mostrarMensaje('Error: ' + error.message, 'error');
  }
}

function editarEdicion(id, ISBN, año, idioma, libro_id) {
  document.getElementById('edicionId').value = id;
  document.getElementById('edicionISBN').value = ISBN;
  document.getElementById('edicionAño').value = año;
  document.getElementById('edicionIdioma').value = idioma;
  document.getElementById('edicionLibroId').value = libro_id;
}

function limpiarFormEdicion() {
  document.getElementById('formEdicion').reset();
  document.getElementById('edicionId').value = '';
}

async function eliminarEdicion(id) {
  if (!confirm('¿Está seguro?')) return;
  try {
    const response = await fetch(`${API_URL}/ediciones/${id}`, { method: 'DELETE' });
    if (response.ok) {
      mostrarMensaje('Edición eliminada', 'success');
      cargarEdiciones();
    }
  } catch (error) {
    mostrarMensaje('Error al eliminar', 'error');
  }
}

// ==================== COPIAS ====================
document.getElementById('formCopia')?.addEventListener('submit', guardarCopia);

async function cargarCopias() {
  try {
    const response = await fetch(`${API_URL}/copias`);
    const copias = await response.json();
    const tbody = document.querySelector('#tablCopias tbody');
    tbody.innerHTML = '';
    
    copias.forEach(copia => {
      const row = `<tr><td>${copia._id}</td><td>${copia.numero}</td><td>${copia.edicion_id}</td><td><button class="btn-edit" onclick="editarCopia('${copia._id}', ${copia.numero}, '${copia.edicion_id}')">Editar</button><button class="btn-delete" onclick="eliminarCopia('${copia._id}')">Eliminar</button></td></tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    mostrarMensaje('Error cargando copias', 'error');
  }
}

async function guardarCopia(e) {
  e.preventDefault();
  const id = document.getElementById('copiaId').value;
  const numero = document.getElementById('copiaNumero').value;
  const edicion_id = document.getElementById('copiaEdicionId').value;
  
  try {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/copias/${id}` : `${API_URL}/copias`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero, edicion_id })
    });
    
    if (response.ok) {
      mostrarMensaje(`Copia ${id ? 'actualizada' : 'creada'} correctamente`, 'success');
      limpiarFormCopia();
      cargarCopias();
    } else {
      mostrarMensaje('Error al guardar copia', 'error');
    }
  } catch (error) {
    mostrarMensaje('Error: ' + error.message, 'error');
  }
}

function editarCopia(id, numero, edicion_id) {
  document.getElementById('copiaId').value = id;
  document.getElementById('copiaNumero').value = numero;
  document.getElementById('copiaEdicionId').value = edicion_id;
}

function limpiarFormCopia() {
  document.getElementById('formCopia').reset();
  document.getElementById('copiaId').value = '';
}

async function eliminarCopia(id) {
  if (!confirm('¿Está seguro?')) return;
  try {
    const response = await fetch(`${API_URL}/copias/${id}`, { method: 'DELETE' });
    if (response.ok) {
      mostrarMensaje('Copia eliminada', 'success');
      cargarCopias();
    }
  } catch (error) {
    mostrarMensaje('Error al eliminar', 'error');
  }
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
      const row = `<tr><td>${usuario._id}</td><td>${usuario.RUT}</td><td>${usuario.nombre}</td><td><button class="btn-edit" onclick="editarUsuario('${usuario._id}', '${usuario.RUT}', '${usuario.nombre}')">Editar</button><button class="btn-delete" onclick="eliminarUsuario('${usuario._id}')">Eliminar</button></td></tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    mostrarMensaje('Error cargando usuarios', 'error');
  }
}

async function guardarUsuario(e) {
  e.preventDefault();
  const id = document.getElementById('usuarioId').value;
  const RUT = document.getElementById('usuarioRUT').value;
  const nombre = document.getElementById('usuarioNombre').value;
  
  try {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/usuarios/${id}` : `${API_URL}/usuarios`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ RUT, nombre })
    });
    
    if (response.ok) {
      mostrarMensaje(`Usuario ${id ? 'actualizado' : 'creado'} correctamente`, 'success');
      limpiarFormUsuario();
      cargarUsuarios();
    } else {
      mostrarMensaje('Error al guardar usuario', 'error');
    }
  } catch (error) {
    mostrarMensaje('Error: ' + error.message, 'error');
  }
}

function editarUsuario(id, RUT, nombre) {
  document.getElementById('usuarioId').value = id;
  document.getElementById('usuarioRUT').value = RUT;
  document.getElementById('usuarioNombre').value = nombre;
}

function limpiarFormUsuario() {
  document.getElementById('formUsuario').reset();
  document.getElementById('usuarioId').value = '';
}

async function eliminarUsuario(id) {
  if (!confirm('¿Está seguro?')) return;
  try {
    const response = await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' });
    if (response.ok) {
      mostrarMensaje('Usuario eliminado', 'success');
      cargarUsuarios();
    }
  } catch (error) {
    mostrarMensaje('Error al eliminar', 'error');
  }
}

// ==================== PRÉSTAMOS ====================
document.getElementById('formPrestamo')?.addEventListener('submit', guardarPrestamo);

async function cargarPrestamos() {
  try {
    const response = await fetch(`${API_URL}/prestamos`);
    const prestamos = await response.json();
    const tbody = document.querySelector('#tablPrestamos tbody');
    tbody.innerHTML = '';
    
    prestamos.forEach(prestamo => {
      const row = `<tr><td>${prestamo._id}</td><td>${prestamo.copia_id}</td><td>${prestamo.usuario_id}</td><td>${new Date(prestamo.fecha_prestamo).toLocaleString()}</td><td>${prestamo.fecha_devolucion ? new Date(prestamo.fecha_devolucion).toLocaleString() : '-'}</td><td><button class="btn-edit" onclick="editarPrestamo('${prestamo._id}', '${prestamo.copia_id}', '${prestamo.usuario_id}', '${prestamo.fecha_prestamo}', '${prestamo.fecha_devolucion || ''}')">Editar</button><button class="btn-delete" onclick="eliminarPrestamo('${prestamo._id}')">Eliminar</button></td></tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    mostrarMensaje('Error cargando préstamos', 'error');
  }
}

async function guardarPrestamo(e) {
  e.preventDefault();
  const id = document.getElementById('prestamoId').value;
  const copia_id = document.getElementById('prestamoCopiaId').value;
  const usuario_id = document.getElementById('prestamoUsuarioId').value;
  const fecha_prestamo = document.getElementById('prestamoFechaPrestamo').value;
  const fecha_devolucion = document.getElementById('prestamoFechaDevolucion').value;
  
  try {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/prestamos/${id}` : `${API_URL}/prestamos`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ copia_id, usuario_id, fecha_prestamo, fecha_devolucion })
    });
    
    if (response.ok) {
      mostrarMensaje(`Préstamo ${id ? 'actualizado' : 'creado'} correctamente`, 'success');
      limpiarFormPrestamo();
      cargarPrestamos();
    } else {
      mostrarMensaje('Error al guardar préstamo', 'error');
    }
  } catch (error) {
    mostrarMensaje('Error: ' + error.message, 'error');
  }
}

function editarPrestamo(id, copia_id, usuario_id, fecha_prestamo, fecha_devolucion) {
  document.getElementById('prestamoId').value = id;
  document.getElementById('prestamoCopiaId').value = copia_id;
  document.getElementById('prestamoUsuarioId').value = usuario_id;
  document.getElementById('prestamoFechaPrestamo').value = fecha_prestamo.replace('Z', '').slice(0, 16);
  if (fecha_devolucion) {
    document.getElementById('prestamoFechaDevolucion').value = fecha_devolucion.replace('Z', '').slice(0, 16);
  }
}

function limpiarFormPrestamo() {
  document.getElementById('formPrestamo').reset();
  document.getElementById('prestamoId').value = '';
}

async function eliminarPrestamo(id) {
  if (!confirm('¿Está seguro?')) return;
  try {
    const response = await fetch(`${API_URL}/prestamos/${id}`, { method: 'DELETE' });
    if (response.ok) {
      mostrarMensaje('Préstamo eliminado', 'success');
      cargarPrestamos();
    }
  } catch (error) {
    mostrarMensaje('Error al eliminar', 'error');
  }
}

// ==================== MENSAJES ====================
function mostrarMensaje(texto, tipo) {
  const msg = document.createElement('div');
  msg.className = `message ${tipo}`;
  msg.textContent = texto;
  document.body.insertBefore(msg, document.body.firstChild);
  setTimeout(() => msg.remove(), 3000);
}

// Cargar autores al iniciar
window.addEventListener('load', () => {
  cargarAutores();
});
