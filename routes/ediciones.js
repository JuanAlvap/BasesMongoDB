const express = require('express');
const router = express.Router();
const { getEdiciones, getEdicionById, createEdicion, updateEdicion, deleteEdicion } = require('../controllers/edicionesController');

router.get('/', getEdiciones);
router.get('/:id', getEdicionById);
router.post('/', createEdicion);
router.put('/:id', updateEdicion);
router.delete('/:id', deleteEdicion);

module.exports = router;
