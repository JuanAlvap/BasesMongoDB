const API_URL = `${window.location.origin}/api`;

// Estado global
let currentWindow = 'libros';
let currentSubtab = 'autores';
let currentEntity = 'autores';

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupSubtabs();
  setupMenuButtons();
  setupModals();
  cargarDatos('autores');
});

function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const window = e.target.getAttribute('data-window');
      switchWindow(window);
    });
  });
  
  // Mostrar la primera ventana por defecto
  switchWindow('libros');
}

function switchWindow(window) {
  // Limpiar consulta 2 si estamos saliendo de la ventana de consultas
  if (currentWindow === 'consultas') {
    limpiarConsulta2();
  }
  
  // Ocultar todas las ventanas
  document.querySelectorAll('.main-window').forEach(w => {
    w.classList.add('hidden');
  });
  
  // Mostrar ventana seleccionada
  document.getElementById(`window-${window}`).classList.remove('hidden');
  currentWindow = window;
  
  // Actualizar botones de navegación
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-window') === window) {
      btn.classList.add('active');
    }
  });
  
  // Cargar datos según la ventana seleccionada
  if (window === 'usuarios') {
    cargarDatos('usuarios');
  } else if (window === 'prestamos') {
    cargarDatos('prestamos');
  } else if (window === 'consultas') {
    // Limpiar consulta 2 al entrar a la ventana de consultas
    limpiarConsulta2();
    // Resetear a consulta 1 por defecto
    currentSubtab = 'consulta1';
    // Mostrar consulta 1 subtab
    document.querySelectorAll('.subtab-content').forEach(content => {
      content.classList.remove('active');
      content.classList.add('hidden');
    });
    document.getElementById('subtab-consulta1').classList.remove('hidden');
    document.getElementById('subtab-consulta1').classList.add('active');
    // Actualizar botones de subtab
    document.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-subtab') === 'consulta1') {
        btn.classList.add('active');
      }
    });
    // Cargar datos de consulta 1
    cargarConsulta1();
    // Configurar evento para búsqueda en consulta 2
    setupConsulta2();
  }
}

function setupSubtabs() {
  document.querySelectorAll('.subtab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const subtab = e.target.getAttribute('data-subtab');
      switchSubtab(subtab);
    });
  });
}

function switchSubtab(subtab) {
  // Funciona en ventana de libros y consultas
  if (currentWindow !== 'libros' && currentWindow !== 'consultas') return;
  
  // Limpiar consulta 2 si estamos saliendo de ella
  if (currentWindow === 'consultas' && currentSubtab === 'consulta2' && subtab !== 'consulta2') {
    limpiarConsulta2();
  }
  
  // Ocultar todos los subtabs
  document.querySelectorAll('.subtab-content').forEach(content => {
    content.classList.remove('active');
    content.classList.add('hidden');
  });
  
  // Mostrar subtab seleccionado
  document.getElementById(`subtab-${subtab}`).classList.remove('hidden');
  document.getElementById(`subtab-${subtab}`).classList.add('active');
  
  // Actualizar botones
  document.querySelectorAll('.subtab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-subtab') === subtab) {
      btn.classList.add('active');
    }
  });
  
  currentSubtab = subtab;
  
  // Si es consulta, cargar los datos correspondientes
  if (currentWindow === 'consultas') {
    if (subtab === 'consulta1') {
      cargarConsulta1();
    } else if (subtab === 'consulta2') {
      // Limpiar formulario cuando se abre consulta 2
      limpiarConsulta2();
    }
  } else {
    currentEntity = subtab;
    cargarDatos(subtab);
  }
}

function setupMenuButtons() {
  document.getElementById('btnMenuLibros').addEventListener('click', (e) => {
    mostrarMenu(e, 'libros');
  });
  
  document.getElementById('btnMenuUsuarios').addEventListener('click', (e) => {
    mostrarMenu(e, 'usuarios');
  });
  
  document.getElementById('btnMenuPrestamos').addEventListener('click', (e) => {
    mostrarMenu(e, 'prestamos');
  });
}

function mostrarMenu(e, window) {
  const menu = document.getElementById('menuContexto');
  const rect = e.target.getBoundingClientRect();
  
  // Determinar la entidad actual
  if (window === 'libros') {
    currentEntity = currentSubtab;
  } else if (window === 'usuarios') {
    currentEntity = 'usuarios';
  } else if (window === 'prestamos') {
    currentEntity = 'prestamos';
  }
  
  // Posicionar menú
  menu.style.top = (rect.bottom + 5) + 'px';
  menu.style.left = rect.left + 'px';
  menu.classList.remove('hidden');
  menu.classList.add('show');
  
  // Cerrar menú al hacer clic afuera
  document.addEventListener('click', cerrarMenuAfuera);
}

function cerrarMenuAfuera(e) {
  const menu = document.getElementById('menuContexto');
  if (!e.target.closest('.btn-menu') && !e.target.closest('.menu-context')) {
    menu.classList.add('hidden');
    menu.classList.remove('show');
    document.removeEventListener('click', cerrarMenuAfuera);
  }
}

function setupModals() {
  // Opciones del menú
  document.getElementById('menuOpcionInsertar').addEventListener('click', () => {
    document.getElementById('menuContexto').classList.add('hidden');
    abrirModalInsertar();
  });
  
  document.getElementById('menuOpcionEditar').addEventListener('click', () => {
    document.getElementById('menuContexto').classList.add('hidden');
    abrirModalEditar();
  });
  
  document.getElementById('menuOpcionEliminar').addEventListener('click', () => {
    document.getElementById('menuContexto').classList.add('hidden');
    abrirModalEliminar();
  });
  
  // Cerrar botones
  document.querySelectorAll('.btn-close, .btn-close-modal').forEach(btn => {
    btn.addEventListener('click', cerrarTodosModales);
  });
  
  // Botones de acción (usando onclick en HTML ahora, no addEventListener)
}

// ==================== VALIDACIONES ====================
function validarFecha(fecha) {
  if (!fecha) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(fecha)) return false;
  const date = new Date(fecha);
  return date instanceof Date && !isNaN(date);
}

function validarFechasPrestamo(fechaPrestamo, fechaDevolucion) {
  if (!fechaDevolucion) return true;
  const prestamo = new Date(fechaPrestamo);
  const devolucion = new Date(fechaDevolucion);
  return devolucion > prestamo;
}

async function validarRutExiste(rut) {
  try {
    const response = await fetch(`${API_URL}/usuarios/${rut}`);
    return response.ok;
  } catch {
    return false;
  }
}

async function validarISBNExiste(isbn) {
  try {
    const response = await fetch(`${API_URL}/ediciones/${isbn}`);
    return response.ok;
  } catch {
    return false;
  }
}

async function validarCopiaExiste(numero, edicion_id) {
  try {
    const response = await fetch(`${API_URL}/copias`);
    const copias = await response.json();
    return copias.some(c => c._id.numero === parseInt(numero) && c._id.edicion_id === edicion_id);
  } catch {
    return false;
  }
}

async function validarAutorExiste(nombre) {
  try {
    const response = await fetch(`${API_URL}/autores`);
    const autores = await response.json();
    return autores.some(a => a._id === nombre);
  } catch {
    return false;
  }
}

async function validarCopiaPuedePrestar(copiaNumero, copiaEdicionId) {
  try {
    const response = await fetch(`${API_URL}/prestamos`);
    const prestamos = await response.json();
    
    const prestamoActivo = prestamos.find(p => 
      p._id.copia_id.numero === parseInt(copiaNumero) &&
      p._id.copia_id.edicion_id === copiaEdicionId &&
      !p.fecha_devolucion
    );
    
    return !prestamoActivo;
  } catch {
    return true;
  }
}

// ==================== CARGAR DATOS ====================
async function cargarDatos(entity) {
  try {
    let url = `${API_URL}/${getUrlEntity(entity)}`;
    const response = await fetch(url);
    let data = await response.json();
    
    // Enriquecer datos de préstamos con nombres de usuarios
    if (entity === 'prestamos') {
      data = await enriquecerPrestamosConUsuarios(data);
    }
    
    mostrarTabla(entity, data);
  } catch (error) {
    mostrarMensaje(`Error al cargar ${entity}`, 'error');
  }
}

function getUrlEntity(entity) {
  const map = {
    'autores': 'autores',
    'libros': 'libros',
    'ediciones': 'ediciones',
    'copias': 'copias',
    'usuarios': 'usuarios',
    'prestamos': 'prestamos'
  };
  return map[entity] || entity;
}

// Obtener texto personalizado para búsquedas
function obtenerTextoPersonalizado(entity) {
  const textos = {
    'autores': 'Buscar por nombre del autor',
    'libros': 'Buscar por título del libro',
    'ediciones': 'Buscar por ISBN',
    'copias': 'Buscar por número e ISBN',
    'usuarios': 'Buscar por RUT',
    'prestamos': 'Buscar por RUT del usuario'
  };
  return textos[entity] || 'Buscar por clave primaria';
}

// Enriquecer datos de préstamos con nombre del usuario
async function enriquecerPrestamosConUsuarios(prestamos) {
  try {
    const response = await fetch(`${API_URL}/usuarios`);
    const usuarios = await response.json();
    const usuariosMap = {};
    
    usuarios.forEach(u => {
      usuariosMap[u._id] = u.nombre;
    });
    
    return prestamos.map(p => ({
      ...p,
      usuario_nombre: usuariosMap[p._id.usuario_id] || 'Desconocido'
    }));
  } catch {
    return prestamos;
  }
}

function mostrarTabla(entity, data) {
  const tableId = `tabla${entity.charAt(0).toUpperCase() + entity.slice(1)}`;
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';
  
  data.forEach(item => {
    const row = document.createElement('tr');
    
    switch(entity) {
      case 'autores':
        row.innerHTML = `<td>${item._id}</td>`;
        break;
      case 'libros':
        const autores = Array.isArray(item.autor_ids) ? item.autor_ids.join(', ') : item.autor_ids;
        row.innerHTML = `<td>${item._id}</td><td>${autores}</td>`;
        break;
      case 'ediciones':
        row.innerHTML = `
          <td>${item._id}</td>
          <td>${item.anio}</td>
          <td>${item.idioma}</td>
          <td>${item.libro_id}</td>
        `;
        break;
      case 'copias':
        row.innerHTML = `
          <td>${item._id.numero}</td>
          <td>${item._id.edicion_id}</td>
        `;
        break;
      case 'usuarios':
        row.innerHTML = `<td>${item._id}</td><td>${item.nombre}</td>`;
        break;
      case 'prestamos':
        row.innerHTML = `
          <td>${item._id.usuario_id}</td>
          <td>${item.usuario_nombre || '-'}</td>
          <td>${item._id.copia_id.numero}</td>
          <td>${item._id.copia_id.edicion_id}</td>
          <td>${item._id.fecha_prestamo}</td>
          <td>${item.fecha_devolucion || 'Pendiente'}</td>
        `;
        break;
    }
    
    tbody.appendChild(row);
  });
}

// ==================== MODAL INSERTAR ====================
function abrirModalInsertar() {
  const modal = document.getElementById('modalInsertar');
  const body = document.getElementById('modalInsertarBody');
  const titulo = document.getElementById('modalInsertarTitulo');
  
  titulo.textContent = `Insertar nuevo ${currentEntity}`;
  body.innerHTML = generarFormuarioInsertar(currentEntity);
  
  modal.classList.remove('hidden');
}

function generarFormuarioInsertar(entity) {
  switch(entity) {
    case 'autores':
      return `
        <div class="form-group">
          <label>Nombre del Autor:</label>
          <input type="text" id="insertAutorNombre" placeholder="Ej: Gabriel García Márquez">
        </div>
      `;
    case 'libros':
      return `
        <div class="form-group">
          <label>Título del Libro:</label>
          <input type="text" id="insertLibroTitulo" placeholder="Ej: Cien años de soledad">
        </div>
        <div class="form-group">
          <label>Autores (separados por comas):</label>
          <input type="text" id="insertLibroAutores" placeholder="Ej: García Márquez, Otro Autor">
        </div>
      `;
    case 'ediciones':
      return `
        <div class="form-group">
          <label>ISBN:</label>
          <input type="text" id="insertEdicionISBN" placeholder="Ej: 978-3-16-148410">
        </div>
        <div class="form-group">
          <label>Año:</label>
          <input type="number" id="insertEdicionAnio" placeholder="Ej: 2023">
        </div>
        <div class="form-group">
          <label>Idioma:</label>
          <input type="text" id="insertEdicionIdioma" placeholder="Ej: Español">
        </div>
        <div class="form-group">
          <label>Título del Libro:</label>
          <input type="text" id="insertEdicionLibroId" placeholder="Ej: Cien años de soledad">
        </div>
      `;
    case 'copias':
      return `
        <div class="form-group">
          <label>Número de la Copia:</label>
          <input type="number" id="insertCopiaNumeroo" placeholder="Ej: 1">
        </div>
        <div class="form-group">
          <label>ISBN de la Edición:</label>
          <input type="text" id="insertCopiaEdicionId" placeholder="Ej: 978-3-16-148410">
        </div>
      `;
    case 'usuarios':
      return `
        <div class="form-group">
          <label>RUT:</label>
          <input type="text" id="insertUsuarioRUT" placeholder="Ej: 12345678">
        </div>
        <div class="form-group">
          <label>Nombre:</label>
          <input type="text" id="insertUsuarioNombre" placeholder="Ej: Juan Pérez">
        </div>
      `;
    case 'prestamos':
      return `
        <div class="form-group">
          <label>RUT del Usuario:</label>
          <input type="text" id="insertPrestamoRUT" placeholder="Ej: 12345678">
        </div>
        <div class="form-group">
          <label>Número de la Copia:</label>
          <input type="number" id="insertPrestamoCopiaNumero" placeholder="Ej: 1">
        </div>
        <div class="form-group">
          <label>ISBN de la Edición:</label>
          <input type="text" id="insertPrestamoCopiaEdicionId" placeholder="Ej: 978-3-16-148410">
        </div>
        <div class="form-group">
          <label>Fecha Préstamo:</label>
          <input type="date" id="insertPrestamoFechaPrestamo">
        </div>
        <div class="form-group">
          <label>Fecha Devolución (opcional):</label>
          <input type="date" id="insertPrestamoFechaDevolucion">
        </div>
      `;
    default:
      return '';
  }
}

async function guardarInsertar() {
  try {
    let datos = {};
    let url = `${API_URL}/${getUrlEntity(currentEntity)}`;
    
    switch(currentEntity) {
      case 'autores':
        const nombre = document.getElementById('insertAutorNombre').value.trim();
        if (!nombre) {
          mostrarMensaje('El nombre del autor es requerido', 'error');
          return;
        }
        datos = { nombre };
        break;
        
      case 'libros':
        const titulo = document.getElementById('insertLibroTitulo').value.trim();
        const autoresStr = document.getElementById('insertLibroAutores').value.trim();
        if (!titulo) {
          mostrarMensaje('El título del libro es requerido', 'error');
          return;
        }
        const autor_ids = autoresStr ? autoresStr.split(',').map(a => a.trim()) : [];
        
        // Validar que todos los autores existan
        for (const autor of autor_ids) {
          if (!(await validarAutorExiste(autor))) {
            mostrarMensaje(`El autor "${autor}" no existe en el sistema`, 'error');
            return;
          }
        }
        datos = { titulo, autor_ids };
        break;
        
      case 'ediciones':
        const isbn = document.getElementById('insertEdicionISBN').value.trim();
        const anio = parseInt(document.getElementById('insertEdicionAnio').value);
        const idioma = document.getElementById('insertEdicionIdioma').value.trim();
        const libro_id = document.getElementById('insertEdicionLibroId').value.trim();
        
        if (!isbn || !anio || !idioma || !libro_id) {
          mostrarMensaje('Todos los campos son requeridos', 'error');
          return;
        }
        
        if (anio < 1000 || anio > 2100) {
          mostrarMensaje('El año debe ser válido', 'error');
          return;
        }
        
        datos = { isbn, anio, idioma, libro_id };
        break;
        
      case 'copias':
        const numero = parseInt(document.getElementById('insertCopiaNumeroo').value);
        const edicion_id = document.getElementById('insertCopiaEdicionId').value.trim();
        
        if (!numero || !edicion_id) {
          mostrarMensaje('Todos los campos son requeridos', 'error');
          return;
        }
        
        if (!(await validarISBNExiste(edicion_id))) {
          mostrarMensaje(`El ISBN "${edicion_id}" no existe`, 'error');
          return;
        }
        
        datos = { _id: { numero, edicion_id } };
        break;
        
      case 'usuarios':
        const rut = document.getElementById('insertUsuarioRUT').value.trim();
        const usuarioNombre = document.getElementById('insertUsuarioNombre').value.trim();
        
        if (!rut || !usuarioNombre) {
          mostrarMensaje('Todos los campos son requeridos', 'error');
          return;
        }
        
        datos = { rut, nombre: usuarioNombre };
        break;
        
      case 'prestamos':
        const prestamoRUT = document.getElementById('insertPrestamoRUT').value.trim();
        const prestamoCopiaNum = parseInt(document.getElementById('insertPrestamoCopiaNumero').value);
        const prestamoCopiaEd = document.getElementById('insertPrestamoCopiaEdicionId').value.trim();
        const fechaPrestamo = document.getElementById('insertPrestamoFechaPrestamo').value;
        const fechaDevolucion = document.getElementById('insertPrestamoFechaDevolucion').value || null;
        
        if (!prestamoRUT || !prestamoCopiaNum || !prestamoCopiaEd || !fechaPrestamo) {
          mostrarMensaje('Los campos obligatorios no están completos', 'error');
          return;
        }
        
        if (!validarFecha(fechaPrestamo)) {
          mostrarMensaje('La fecha de préstamo no es válida', 'error');
          return;
        }
        
        if (fechaDevolucion && !validarFecha(fechaDevolucion)) {
          mostrarMensaje('La fecha de devolución no es válida', 'error');
          return;
        }
        
        if (fechaDevolucion && !validarFechasPrestamo(fechaPrestamo, fechaDevolucion)) {
          mostrarMensaje('La fecha de devolución debe ser posterior a la de préstamo', 'error');
          return;
        }
        
        if (!(await validarRutExiste(prestamoRUT))) {
          mostrarMensaje(`El RUT "${prestamoRUT}" no existe`, 'error');
          return;
        }
        
        if (!(await validarISBNExiste(prestamoCopiaEd))) {
          mostrarMensaje(`El ISBN "${prestamoCopiaEd}" no existe`, 'error');
          return;
        }
        
        if (!(await validarCopiaExiste(prestamoCopiaNum, prestamoCopiaEd))) {
          mostrarMensaje(`La copia no existe`, 'error');
          return;
        }
        
        if (!(await validarCopiaPuedePrestar(prestamoCopiaNum, prestamoCopiaEd))) {
          mostrarMensaje(`La copia ya está prestada`, 'error');
          return;
        }
        
        datos = {
          usuario_id: prestamoRUT,
          copia_id: { numero: prestamoCopiaNum, edicion_id: prestamoCopiaEd },
          fecha_prestamo: fechaPrestamo,
          fecha_devolucion: fechaDevolucion
        };
        break;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    
    if (response.ok) {
      mostrarMensaje(`${currentEntity} insertado correctamente`, 'success');
      cerrarTodosModales();
      cargarDatos(currentEntity);
    } else {
      const error = await response.json();
      mostrarMensaje(`Error: ${error.error || 'No se pudo guardar'}`, 'error');
    }
  } catch (error) {
    mostrarMensaje(`Error: ${error.message}`, 'error');
  }
}

// ==================== MODAL EDITAR ====================
function abrirModalEditar() {
  const modal = document.getElementById('modalEditar');
  const titulo = document.getElementById('modalEditarTitulo');
  const buscarContainer = document.getElementById('buscarEditarContainer');
  
  titulo.textContent = `Editar ${currentEntity}`;
  
  // Si es préstamo, mostrar formulario especial
  if (currentEntity === 'prestamos') {
    buscarContainer.innerHTML = `
      <label>Buscar préstamo por:</label>
      <div class="form-group">
        <label>RUT del Usuario:</label>
        <input type="text" id="prestamoRutBusca" placeholder="Ej: 12345678">
      </div>
      <div class="form-group">
        <label>Número de Copia:</label>
        <input type="number" id="prestamoCopiaNumBusca" placeholder="Ej: 1">
      </div>
      <div class="form-group">
        <label>ISBN de la Edición:</label>
        <input type="text" id="prestamoCopiaEdBusca" placeholder="Ej: 978-3-16-148410">
      </div>
      <div class="form-group">
        <label>Fecha del Préstamo:</label>
        <input type="date" id="prestamoFechaBusca">
      </div>
      <button class="btn btn-secondary" style="width: 100%; margin-top: 10px;" onclick="buscarParaEditar()">Buscar</button>
    `;
  } else if (currentEntity === 'copias') {
    buscarContainer.innerHTML = `
      <label>Buscar copia por:</label>
      <div class="form-group">
        <label>Número de Copia:</label>
        <input type="number" id="copiasNumBusca" placeholder="Ej: 1">
      </div>
      <div class="form-group">
        <label>ISBN de la Edición:</label>
        <input type="text" id="copiasIsbnBusca" placeholder="Ej: ISBN-001">
      </div>
      <button class="btn btn-secondary" style="width: 100%; margin-top: 10px;" onclick="buscarParaEditar()">Buscar</button>
    `;
  } else {
    buscarContainer.innerHTML = `
      <label>${obtenerTextoPersonalizado(currentEntity)}:</label>
      <input type="text" id="inputBuscarEditar" placeholder="${obtenerTextoPersonalizado(currentEntity)}">
      <button class="btn btn-secondary" style="width: 100%; margin-top: 10px;" onclick="buscarParaEditar()">Buscar</button>
    `;
  }
  
  document.getElementById('formEditarContainer').classList.add('hidden');
  document.getElementById('btnGuardarEditar').classList.add('hidden');
  
  modal.classList.remove('hidden');
}

async function buscarParaEditar() {
  let busqueda;
  
  if (currentEntity === 'prestamos') {
    // Búsqueda especial para préstamos
    const rut = document.getElementById('prestamoRutBusca').value.trim();
    const numero = document.getElementById('prestamoCopiaNumBusca').value.trim();
    const isbn = document.getElementById('prestamoCopiaEdBusca').value.trim();
    const fecha = document.getElementById('prestamoFechaBusca').value;
    
    if (!rut || !numero || !isbn || !fecha) {
      mostrarMensaje('Completa todos los campos para buscar el préstamo', 'error');
      return;
    }
    
    // Construir objeto del ID del préstamo
    const prestamoId = {
      usuario_id: rut,
      copia_id: { numero: parseInt(numero), edicion_id: isbn },
      fecha_prestamo: fecha
    };
    
    busqueda = JSON.stringify(prestamoId);
  } else if (currentEntity === 'copias') {
    // Búsqueda especial para copias
    const numero = document.getElementById('copiasNumBusca').value.trim();
    const isbn = document.getElementById('copiasIsbnBusca').value.trim();
    
    if (!numero || !isbn) {
      mostrarMensaje('Completa ambos campos (número e ISBN) para buscar la copia', 'error');
      return;
    }
    
    // Construir objeto del ID de la copia
    const copiaId = {
      numero: parseInt(numero),
      edicion_id: isbn
    };
    
    busqueda = JSON.stringify(copiaId);
  } else {
    // Búsqueda normal para otras entidades
    busqueda = document.getElementById('inputBuscarEditar').value.trim();
    
    if (!busqueda) {
      mostrarMensaje(obtenerTextoPersonalizado(currentEntity), 'error');
      return;
    }
  }
  
  try {
    let url = `${API_URL}/${getUrlEntity(currentEntity)}/${encodeURIComponent(busqueda)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      mostrarMensaje('Registro no encontrado', 'error');
      return;
    }
    
    const item = await response.json();
    mostrarFormularioEditar(item);
  } catch (error) {
    mostrarMensaje(`Error: ${error.message}`, 'error');
  }
}

function mostrarFormularioEditar(item) {
  const container = document.getElementById('formEditarContainer');
  container.innerHTML = '';
  
  switch(currentEntity) {
    case 'autores':
      container.innerHTML = `
        <div class="form-group">
          <label>Nuevo nombre:</label>
          <input type="text" id="editAutorNombre" value="${item._id}">
        </div>
      `;
      break;
      
    case 'libros':
      const autores = Array.isArray(item.autor_ids) ? item.autor_ids.join(', ') : item.autor_ids;
      container.innerHTML = `
        <div class="form-group">
          <label>Título:</label>
          <input type="text" id="editLibroTitulo" value="${item._id}">
        </div>
        <div class="form-group">
          <label>Autores:<span style="color: #666; font-size: 12px; display: block; margin-top: 5px;">Separa múltiples autores con comas (ej: Autor1, Autor2)</span></label>
          <input type="text" id="editLibroAutores" value="${autores}">
        </div>
      `;
      break;
      
    case 'ediciones':
      container.innerHTML = `
        <div class="form-group">
          <label>ISBN:</label>
          <input type="text" id="editEdicionISBN" value="${item._id}">
        </div>
        <div class="form-group">
          <label>Año:</label>
          <input type="number" id="editEdicionAnio" value="${item.anio}">
        </div>
        <div class="form-group">
          <label>Idioma:</label>
          <input type="text" id="editEdicionIdioma" value="${item.idioma}">
        </div>
        <div class="form-group">
          <label>Libro:</label>
          <input type="text" id="editEdicionLibroId" value="${item.libro_id}">
        </div>
      `;
      break;
      
    case 'copias':
      container.innerHTML = `
        <div class="form-group">
          <label>Número:</label>
          <input type="number" id="editCopiaNumeroo" value="${item._id.numero}">
        </div>
        <div class="form-group">
          <label>Edición (ISBN):</label>
          <input type="text" id="editCopiaEdicionId" value="${item._id.edicion_id}">
        </div>
      `;
      break;
      
    case 'usuarios':
      container.innerHTML = `
        <div class="form-group">
          <label>RUT:</label>
          <input type="text" id="editUsuarioRUT" value="${item._id}">
        </div>
        <div class="form-group">
          <label>Nombre:</label>
          <input type="text" id="editUsuarioNombre" value="${item.nombre}">
        </div>
      `;
      break;
      
    case 'prestamos':
      container.innerHTML = `
        <div class="form-group">
          <label>RUT Usuario:</label>
          <input type="text" value="${item._id.usuario_id}">
        </div>
        <div class="form-group">
          <label>Número Copia:</label>
          <input type="number" value="${item._id.copia_id.numero}">
        </div>
        <div class="form-group">
          <label>ISBN:</label>
          <input type="text" value="${item._id.copia_id.edicion_id}">
        </div>
        <div class="form-group">
          <label>Fecha Préstamo:</label>
          <input type="date" value="${item._id.fecha_prestamo}">
        </div>
        <div class="form-group">
          <label>Fecha Devolución:</label>
          <input type="date" id="editPrestamoFechaDevolucion" value="${item.fecha_devolucion || ''}">
        </div>
      `;
      break;
  }
  
  container.classList.remove('hidden');
  document.getElementById('btnGuardarEditar').classList.remove('hidden');
}

async function guardarEditar() {
  try {
    let claveAntigua;
    
    // Manejar la clave antigua dependiendo de la entidad
    if (currentEntity === 'prestamos') {
      const rut = document.getElementById('prestamoRutBusca').value.trim();
      const numero = document.getElementById('prestamoCopiaNumBusca').value.trim();
      const isbn = document.getElementById('prestamoCopiaEdBusca').value.trim();
      const fecha = document.getElementById('prestamoFechaBusca').value;
      
      const prestamoId = {
        usuario_id: rut,
        copia_id: { numero: parseInt(numero), edicion_id: isbn },
        fecha_prestamo: fecha
      };
      claveAntigua = JSON.stringify(prestamoId);
    } else {
      claveAntigua = document.getElementById('inputBuscarEditar').value.trim();
    }
    
    let datos = {};
    
    switch(currentEntity) {
      case 'autores':
        const nuevoNombre = document.getElementById('editAutorNombre').value.trim();
        if (!nuevoNombre) {
          mostrarMensaje('El nombre es requerido', 'error');
          return;
        }
        datos = { nombre: nuevoNombre };
        break;
        
      case 'libros':
        const nuevoTitulo = document.getElementById('editLibroTitulo').value.trim();
        const nuevosAutores = document.getElementById('editLibroAutores').value.trim();
        if (!nuevoTitulo) {
          mostrarMensaje('El título es requerido', 'error');
          return;
        }
        datos = {
          titulo: nuevoTitulo,
          autor_ids: nuevosAutores ? nuevosAutores.split(',').map(a => a.trim()) : []
        };
        break;
        
      case 'ediciones':
        const nuevoAnio = parseInt(document.getElementById('editEdicionAnio').value);
        const nuevoIdioma = document.getElementById('editEdicionIdioma').value.trim();
        const nuevoLibro = document.getElementById('editEdicionLibroId').value.trim();
        datos = { anio: nuevoAnio, idioma: nuevoIdioma, libro_id: nuevoLibro };
        break;
        
      case 'usuarios':
        const nuevoNombreUsuario = document.getElementById('editUsuarioNombre').value.trim();
        if (!nuevoNombreUsuario) {
          mostrarMensaje('El nombre es requerido', 'error');
          return;
        }
        datos = { nombre: nuevoNombreUsuario };
        break;
        
      case 'prestamos':
        const nuevaFechaDevolucion = document.getElementById('editPrestamoFechaDevolucion').value;
        if (nuevaFechaDevolucion && !validarFecha(nuevaFechaDevolucion)) {
          mostrarMensaje('La fecha no es válida', 'error');
          return;
        }
        datos = { fecha_devolucion: nuevaFechaDevolucion || null };
        break;
    }
    
    const url = `${API_URL}/${getUrlEntity(currentEntity)}/${encodeURIComponent(claveAntigua)}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    
    if (response.ok) {
      mostrarMensaje(`${currentEntity} actualizado correctamente`, 'success');
      cerrarTodosModales();
      cargarDatos(currentEntity);
    } else {
      const error = await response.json();
      mostrarMensaje(`Error: ${error.error}`, 'error');
    }
  } catch (error) {
    mostrarMensaje(`Error: ${error.message}`, 'error');
  }
}

// ==================== MODAL ELIMINAR ====================
function abrirModalEliminar() {
  const modal = document.getElementById('modalEliminar');
  const titulo = document.getElementById('modalEliminarTitulo');
  const eliminarContainer = document.getElementById('buscarEliminarContainer');
  
  titulo.textContent = `Eliminar ${currentEntity}`;
  
  // Limpiar mensaje de confirmación
  document.getElementById('mensajeConfirmacion').classList.add('hidden');
  document.getElementById('mensajeConfirmacion').textContent = '';
  
  // Si es préstamo, mostrar formulario especial
  if (currentEntity === 'prestamos') {
    eliminarContainer.innerHTML = `
      <label>Buscar préstamo a eliminar por:</label>
      <div class="form-group">
        <label>RUT del Usuario:</label>
        <input type="text" id="prestamoRutElem" placeholder="Ej: 12345678">
      </div>
      <div class="form-group">
        <label>Número de Copia:</label>
        <input type="number" id="prestamoCopiaNumElem" placeholder="Ej: 1">
      </div>
      <div class="form-group">
        <label>ISBN de la Edición:</label>
        <input type="text" id="prestamoCopiaEdElem" placeholder="Ej: 978-3-16-148410">
      </div>
      <div class="form-group">
        <label>Fecha del Préstamo:</label>
        <input type="date" id="prestamoFechaElem">
      </div>
    `;
  } else if (currentEntity === 'copias') {
    eliminarContainer.innerHTML = `
      <label>Buscar copia a eliminar por:</label>
      <div class="form-group">
        <label>Número de Copia:</label>
        <input type="number" id="copiasNumElem" placeholder="Ej: 1">
      </div>
      <div class="form-group">
        <label>ISBN de la Edición:</label>
        <input type="text" id="copiasIsbnElem" placeholder="Ej: ISBN-001">
      </div>
    `;
  } else {
    eliminarContainer.innerHTML = `
      <label>${obtenerTextoPersonalizado(currentEntity)}:</label>
      <input type="text" id="inputBuscarEliminar" placeholder="${obtenerTextoPersonalizado(currentEntity)}">
    `;
  }
  
  modal.classList.remove('hidden');
}

async function confirmarEliminar() {
  let clave;
  
  if (currentEntity === 'prestamos') {
    // Búsqueda especial para préstamos
    const rut = document.getElementById('prestamoRutElem').value.trim();
    const numero = document.getElementById('prestamoCopiaNumElem').value.trim();
    const isbn = document.getElementById('prestamoCopiaEdElem').value.trim();
    const fecha = document.getElementById('prestamoFechaElem').value;
    
    if (!rut || !numero || !isbn || !fecha) {
      mostrarMensaje('Completa todos los campos para eliminar el préstamo', 'error');
      return;
    }
    
    // Construir objeto del ID del préstamo
    const prestamoId = {
      usuario_id: rut,
      copia_id: { numero: parseInt(numero), edicion_id: isbn },
      fecha_prestamo: fecha
    };
    
    clave = JSON.stringify(prestamoId);
  } else if (currentEntity === 'copias') {
    // Búsqueda especial para copias
    const numero = document.getElementById('copiasNumElem').value.trim();
    const isbn = document.getElementById('copiasIsbnElem').value.trim();
    
    if (!numero || !isbn) {
      mostrarMensaje('Completa ambos campos (número e ISBN) para eliminar la copia', 'error');
      return;
    }
    
    // Construir objeto del ID de la copia
    const copiaId = {
      numero: parseInt(numero),
      edicion_id: isbn
    };
    
    clave = JSON.stringify(copiaId);
  } else {
    clave = document.getElementById('inputBuscarEliminar').value.trim();
    
    if (!clave) {
      mostrarMensaje(obtenerTextoPersonalizado(currentEntity), 'error');
      return;
    }
  }
  
  try {
    // Eliminar con cascada
    const exitoso = await eliminarEnCascada(currentEntity, clave);
    
    if (exitoso) {
      mostrarMensaje(`${currentEntity} y sus dependencias fueron eliminados correctamente`, 'success');
      cerrarTodosModales();
      cargarDatos(currentEntity);
    } else {
      throw new Error('No se pudo completar la eliminación');
    }
  } catch (error) {
    mostrarMensaje(`Error: ${error.message}`, 'error');
  }
}

// ==================== VALIDACIONES EN CASCADA ====================
async function eliminarEnCascada(entity, clave) {
  try {
    // Validar y eliminar dependencias según la entidad
    if (entity === 'autores') {
      // Si se elimina un autor, eliminar libros que SOLO tengan ese autor
      const libros = await fetch(`${API_URL}/libros`).then(r => r.json());
      for (const libro of libros) {
        const autores = Array.isArray(libro.autor_ids) ? libro.autor_ids : [libro.autor_ids];
        if (autores.length === 1 && autores[0] === clave) {
          // Este libro solo tiene este autor, eliminarlo en cascada
          await eliminarEnCascada('libros', libro._id);
        }
      }
    } 
    else if (entity === 'libros') {
      // Si se elimina un libro, eliminar sus ediciones
      const ediciones = await fetch(`${API_URL}/ediciones`).then(r => r.json());
      for (const edicion of ediciones) {
        if (edicion.libro_id === clave) {
          await eliminarEnCascada('ediciones', edicion._id);
        }
      }
    }
    else if (entity === 'ediciones') {
      // Si se elimina una edición, eliminar sus copias
      const copias = await fetch(`${API_URL}/copias`).then(r => r.json());
      for (const copia of copias) {
        if (copia._id.edicion_id === clave) {
          // Primero eliminar préstamos de esa copia
          const prestamos = await fetch(`${API_URL}/prestamos`).then(r => r.json());
          for (const prestamo of prestamos) {
            if (prestamo._id.copia_id.numero === copia._id.numero && 
                prestamo._id.copia_id.edicion_id === clave) {
              await fetch(`${API_URL}/prestamos/${encodeURIComponent(JSON.stringify(prestamo._id))}`, 
                { method: 'DELETE' });
            }
          }
          // Luego eliminar la copia
          const copiaId = JSON.stringify(copia._id);
          await fetch(`${API_URL}/copias/${encodeURIComponent(copiaId)}`, { method: 'DELETE' });
        }
      }
    }
    else if (entity === 'copias') {
      // Si se elimina una copia, eliminar sus préstamos
      const copiaId = clave; // Es un JSON string
      const prestamos = await fetch(`${API_URL}/prestamos`).then(r => r.json());
      const copiaParsed = JSON.parse(copiaId);
      for (const prestamo of prestamos) {
        if (prestamo._id.copia_id.numero === copiaParsed.numero && 
            prestamo._id.copia_id.edicion_id === copiaParsed.edicion_id) {
          await fetch(`${API_URL}/prestamos/${encodeURIComponent(JSON.stringify(prestamo._id))}`, 
            { method: 'DELETE' });
        }
      }
    }
    else if (entity === 'usuarios') {
      // Si se elimina un usuario, eliminar sus préstamos
      const prestamos = await fetch(`${API_URL}/prestamos`).then(r => r.json());
      for (const prestamo of prestamos) {
        if (prestamo._id.usuario_id === clave) {
          await fetch(`${API_URL}/prestamos/${encodeURIComponent(JSON.stringify(prestamo._id))}`, 
            { method: 'DELETE' });
        }
      }
    }
    
    // Finalmente, eliminar el registro principal
    const url = `${API_URL}/${getUrlEntity(entity)}/${encodeURIComponent(clave)}`;
    await fetch(url, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error en cascada:', error);
    return false;
  }
}

// ==================== UTILIDADES ==================== 
function cerrarTodosModales() {
  document.getElementById('modalInsertar').classList.add('hidden');
  document.getElementById('modalEditar').classList.add('hidden');
  document.getElementById('modalEliminar').classList.add('hidden');
  document.getElementById('modalMensaje').classList.add('hidden');
  
  // Limpiar formularios
  const modalInsertarBody = document.getElementById('modalInsertarBody');
  if (modalInsertarBody) modalInsertarBody.innerHTML = '';
  
  const buscarEditarContainer = document.getElementById('buscarEditarContainer');
  if (buscarEditarContainer) buscarEditarContainer.innerHTML = '';
  
  const formEditarContainer = document.getElementById('formEditarContainer');
  if (formEditarContainer) {
    formEditarContainer.innerHTML = '';
    formEditarContainer.classList.add('hidden');
  }
  
  const btnGuardarEditar = document.getElementById('btnGuardarEditar');
  if (btnGuardarEditar) btnGuardarEditar.classList.add('hidden');
  
  const buscarEliminarContainer = document.getElementById('buscarEliminarContainer');
  if (buscarEliminarContainer) buscarEliminarContainer.innerHTML = '';
  
  const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
  if (mensajeConfirmacion) {
    mensajeConfirmacion.classList.add('hidden');
    mensajeConfirmacion.textContent = '';
  }
}

function mostrarMensaje(texto, tipo = 'info') {
  const modal = document.getElementById('modalMensaje');
  const titulo = document.getElementById('mensajeTitulo');
  const contenido = document.getElementById('mensajeTexto');
  
  let tituloTexto = 'Mensaje';
  if (tipo === 'error') tituloTexto = '⚠️ Error';
  else if (tipo === 'success') tituloTexto = '✅ Éxito';
  else if (tipo === 'info') tituloTexto = 'ℹ️ Información';
  
  titulo.textContent = tituloTexto;
  contenido.textContent = texto;
  
  modal.classList.remove('hidden');
  
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 2000);
}

// ==================== CONSULTAS ====================
async function cargarConsulta1() {
  try {
    const response = await fetch(`${API_URL}/consultas/consulta1`);
    const data = await response.json();
    mostrarTablaConsulta1(data);
  } catch (error) {
    mostrarMensaje('Error al cargar Consulta 1', 'error');
  }
}

function mostrarTablaConsulta1(data) {
  const tbody = document.querySelector('#tablaConsulta1 tbody');
  tbody.innerHTML = '';
  
  data.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.autor}</td>
      <td>${item.libro}</td>
      <td>${item.isbn}</td>
      <td>${item.anio}</td>
      <td>${item.idioma}</td>
      <td>${item.numeroCopia}</td>
    `;
    tbody.appendChild(row);
  });
}

function setupConsulta2() {
  // Evento para el botón de búsqueda
  const btnBuscar = document.getElementById('btnBuscarUsuarioPrestamos');
  if (btnBuscar) {
    btnBuscar.addEventListener('click', buscarPrestamosUsuario);
    
    // También permitir búsqueda con Enter
    const inputRut = document.getElementById('inputRutBusca');
    if (inputRut) {
      inputRut.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          buscarPrestamosUsuario();
        }
      });
    }
  }
}

function limpiarConsulta2() {
  document.getElementById('inputRutBusca').value = '';
  document.getElementById('infoPrestamosUsuario').classList.add('hidden');
  document.querySelector('#tablaConsulta2 tbody').innerHTML = '';
}

async function buscarPrestamosUsuario() {
  try {
    const rut = document.getElementById('inputRutBusca').value.trim();
    
    if (!rut) {
      mostrarMensaje('Por favor ingresa un RUT', 'error');
      return;
    }
    
    // Primero buscar si el usuario existe
    const responseUsuario = await fetch(`${API_URL}/usuarios/${encodeURIComponent(rut)}`);
    
    if (!responseUsuario.ok) {
      // Usuario no existe
      mostrarInfoPrestamos('❌ Esa persona no existe', '', false, null);
      return;
    }
    
    const usuario = await responseUsuario.json();
    
    // Buscar préstamos del usuario
    const responseConsulta = await fetch(`${API_URL}/consultas/consulta2?usuarioId=${encodeURIComponent(rut)}`);
    const prestamos = await responseConsulta.json();
    
    if (prestamos.length === 0) {
      // Usuario existe pero no tiene préstamos
      mostrarInfoPrestamos(`👤 ${usuario.nombre} (${usuario._id})`, 'No tiene libros prestados', true, null);
    } else {
      // Usuario existe y tiene préstamos
      mostrarInfoPrestamos(`👤 ${usuario.nombre} (${usuario._id})`, `Tiene ${prestamos.length} libro(s) prestado(s)`, true, prestamos);
    }
  } catch (error) {
    mostrarMensaje(`Error: ${error.message}`, 'error');
  }
}

function mostrarInfoPrestamos(titulo, mensaje, mostrarInfo, prestamos) {
  const infoDiv = document.getElementById('infoPrestamosUsuario');
  const nombreDiv = document.getElementById('nombreUsuarioPrestamos');
  const mensajeDiv = document.getElementById('mensajePrestamos');
  
  nombreDiv.textContent = titulo;
  mensajeDiv.textContent = mensaje;
  
  if (mostrarInfo) {
    infoDiv.classList.remove('hidden');
  } else {
    infoDiv.classList.add('hidden');
  }
  
  // Mostrar o limpiar tabla según corresponda
  mostrarTablaConsulta2(prestamos || []);
}

function mostrarTablaConsulta2(data) {
  const tbody = document.querySelector('#tablaConsulta2 tbody');
  tbody.innerHTML = '';
  
  if (!data || data.length === 0) {
    return;
  }
  
  data.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.usuarioRut}</td>
      <td>${item.autor}</td>
      <td>${item.libro}</td>
      <td>${item.isbn}</td>
      <td>${item.numeroCopia}</td>
      <td>${item.fechaPrestamo}</td>
      <td>${item.fechaDevolucion}</td>
    `;
    tbody.appendChild(row);
  });
}
