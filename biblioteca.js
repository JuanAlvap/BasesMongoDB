// Crear / usar base de datos
db = db.getSiblingDB('biblioteca_test');
db.dropDatabase();

// =========================
// COLECCIÓN: autor
// =========================
db.autor.insertMany([
    { _id: "Gabriel García Márquez" },
    { _id: "Antoine de Saint-Exupéry" },
    { _id: "Isabel Allende" },
    { _id: "J.K. Rowling" },
    { _id: "George Orwell" },
    { _id: "J.R.R. Tolkien" },
    { _id: "Agatha Christie" },
    { _id: "Stephen King" },
    { _id: "Jane Austen" },
    { _id: "Julio Cortázar" }
])

// =========================
// COLECCIÓN: libro
// =========================
db.libro.insertMany([
    {
        _id: "Cien años de soledad",
        autor_ids: ["Gabriel García Márquez"]
    },
    {
        _id: "El principito",
        autor_ids: ["Antoine de Saint-Exupéry"]
    },
    {
        _id: "La casa de los espíritus",
        autor_ids: ["Isabel Allende"]
    },
    {
        _id: "Harry Potter y la piedra filosofal",
        autor_ids: ["J.K. Rowling"]
    },
    {
        _id: "1984",
        autor_ids: ["George Orwell"]
    },
    {
        _id: "El Señor de los Anillos",
        autor_ids: ["J.R.R. Tolkien"]
    },
    {
        _id: "Asesinato en el Orient Express",
        autor_ids: ["Agatha Christie"]
    },
    {
        _id: "El resplandor",
        autor_ids: ["Stephen King"]
    },
    {
        _id: "Orgullo y prejuicio",
        autor_ids: ["Jane Austen"]
    },
    {
        _id: "Rayuela",
        autor_ids: ["Julio Cortázar"]
    }
])

// =========================
// COLECCIÓN: edicion
// (ISBN es clave primaria)
// =========================
db.edicion.insertMany([
    {
        _id: "ISBN-001",
        anio: 1967,
        idioma: "español",
        libro_id: "Cien años de soledad"
    },
    {
        _id: "ISBN-002",
        anio: 2007,
        idioma: "inglés",
        libro_id: "Cien años de soledad"
    },
    {
        _id: "ISBN-003",
        anio: 1943,
        idioma: "francés",
        libro_id: "El principito"
    },
    {
        _id: "ISBN-004",
        anio: 1982,
        idioma: "español",
        libro_id: "La casa de los espíritus"
    },
    {
        _id: "ISBN-005",
        anio: 1997,
        idioma: "inglés",
        libro_id: "Harry Potter y la piedra filosofal"
    },
    {
        _id: "ISBN-006",
        anio: 1949,
        idioma: "inglés",
        libro_id: "1984"
    },
    {
        _id: "ISBN-007",
        anio: 1954,
        idioma: "inglés",
        libro_id: "El Señor de los Anillos"
    },
    {
        _id: "ISBN-008",
        anio: 1934,
        idioma: "inglés",
        libro_id: "Asesinato en el Orient Express"
    },
    {
        _id: "ISBN-009",
        anio: 1977,
        idioma: "inglés",
        libro_id: "El resplandor"
    },
    {
        _id: "ISBN-010",
        anio: 1813,
        idioma: "inglés",
        libro_id: "Orgullo y prejuicio"
    },
    {
        _id: "ISBN-011",
        anio: 1963,
        idioma: "español",
        libro_id: "Rayuela"
    },
    {
        _id: "ISBN-012",
        anio: 2001,
        idioma: "español",
        libro_id: "El Señor de los Anillos"
    }
])

// =========================
// COLECCIÓN: copia
// (Entidad débil: numero + edicion)
// =========================
db.copia.insertMany([
    {
        _id: { numero: 1, edicion_id: "ISBN-001" }
    },
    {
        _id: { numero: 2, edicion_id: "ISBN-001" }
    },
    {
        _id: { numero: 1, edicion_id: "ISBN-003" }
    },
    {
        _id: { numero: 1, edicion_id: "ISBN-004" }
    },
    {
        _id: { numero: 1, edicion_id: "ISBN-005" }
    },
    {
        _id: { numero: 1, edicion_id: "ISBN-006" }
    },
    {
        _id: { numero: 1, edicion_id: "ISBN-007" }
    },
    {
        _id: { numero: 2, edicion_id: "ISBN-007" }
    },
    {
        _id: { numero: 1, edicion_id: "ISBN-008" }
    },
    {
        _id: { numero: 1, edicion_id: "ISBN-009" }
    },
    {
        _id: { numero: 1, edicion_id: "ISBN-010" }
    },
    {
        _id: { numero: 1, edicion_id: "ISBN-011" }
    },
    {
        _id: { numero: 2, edicion_id: "ISBN-011" }
    },
    {
        _id: { numero: 1, edicion_id: "ISBN-012" }
    }
])

// =========================
// COLECCIÓN: usuario
// =========================
db.usuario.insertMany([
    { _id: "12345678", nombre: "Juan Pérez" },
    { _id: "87654321", nombre: "Ana Gómez" },
    { _id: "11223344", nombre: "Carlos López" },
    { _id: "55667788", nombre: "María Torres" },
    { _id: "99887766", nombre: "Laura Sánchez" },
    { _id: "54321678", nombre: "Pedro Martínez" },
    { _id: "10293847", nombre: "Sofía Ramírez" },
    { _id: "56473829", nombre: "Diego Fernández" }
])

// =========================
// COLECCIÓN: prestamo
// =========================
db.prestamo.insertMany([
    {
        _id: {
            usuario_id: "12345678",
            copia_id: { numero: 2, edicion_id: "ISBN-001" },
            fecha_prestamo: "2026-03-01"
        },
        fecha_devolucion: "2026-03-10"
    },
    {
        _id: {
            usuario_id: "87654321",
            copia_id: { numero: 1, edicion_id: "ISBN-004" },
            fecha_prestamo: "2026-03-05"
        },
        fecha_devolucion: null
    },
    {
        _id: {
            usuario_id: "11223344",
            copia_id: { numero: 1, edicion_id: "ISBN-006" },
            fecha_prestamo: "2026-03-07"
        },
        fecha_devolucion: null
    },
    {
        _id: {
            usuario_id: "55667788",
            copia_id: { numero: 1, edicion_id: "ISBN-003" },
            fecha_prestamo: "2026-03-02"
        },
        fecha_devolucion: "2026-03-09"
    },
    {
        _id: {
            usuario_id: "99887766",
            copia_id: { numero: 1, edicion_id: "ISBN-007" },
            fecha_prestamo: "2026-03-11"
        },
        fecha_devolucion: null
    },
    {
        _id: {
            usuario_id: "54321678",
            copia_id: { numero: 1, edicion_id: "ISBN-010" },
            fecha_prestamo: "2026-03-12"
        },
        fecha_devolucion: "2026-03-20"
    },
    {
        _id: {
            usuario_id: "10293847",
            copia_id: { numero: 1, edicion_id: "ISBN-011" },
            fecha_prestamo: "2026-03-15"
        },
        fecha_devolucion: null
    },
    {
        _id: {
            usuario_id: "56473829",
            copia_id: { numero: 2, edicion_id: "ISBN-007" },
            fecha_prestamo: "2026-03-18"
        },
        fecha_devolucion: "2026-03-25"
    },
    {
        _id: {
            usuario_id: "12345678",
            copia_id: { numero: 1, edicion_id: "ISBN-008" },
            fecha_prestamo: "2026-03-20"
        },
        fecha_devolucion: null
    }
])