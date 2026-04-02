const express = require('express');
const router = express.Router();
const { getLibros, getLibroById, createLibro, updateLibro, deleteLibro } = require('../controllers/librosController');

router.get('/', getLibros);
router.get('/:id', getLibroById);
router.post('/', createLibro);
router.put('/:id', updateLibro);
router.delete('/:id', deleteLibro);

module.exports = router;
