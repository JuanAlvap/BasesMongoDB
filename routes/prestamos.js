const express = require('express');
const router = express.Router();
const { getPrestamos, getPrestamoById, createPrestamo, updatePrestamo, deletePrestamo } = require('../controllers/prestamosController');

router.get('/', getPrestamos);
router.get('/:id', getPrestamoById);
router.post('/', createPrestamo);
router.put('/:id', updatePrestamo);
router.delete('/:id', deletePrestamo);

module.exports = router;
