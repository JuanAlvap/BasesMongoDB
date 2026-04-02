const express = require('express');
const router = express.Router();
const { getCopias, getCopiaById, createCopia, updateCopia, deleteCopia } = require('../controllers/copiasController');

router.get('/', getCopias);
router.get('/:id', getCopiaById);
router.post('/', createCopia);
router.put('/:id', updateCopia);
router.delete('/:id', deleteCopia);

module.exports = router;
