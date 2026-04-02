const express = require('express');
const router = express.Router();
const { getAutores, getAutorById, createAutor, updateAutor, deleteAutor } = require('../controllers/autoresController');

router.get('/', getAutores);
router.get('/:id', getAutorById);
router.post('/', createAutor);
router.put('/:id', updateAutor);
router.delete('/:id', deleteAutor);

module.exports = router;
