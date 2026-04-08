const express = require('express');
const router = express.Router();
const { getConsulta1, getConsulta2, getUsuariosParaConsulta } = require('../controllers/consultasController');

router.get('/consulta1', getConsulta1);
router.get('/consulta2', getConsulta2);
router.get('/usuarios', getUsuariosParaConsulta);

module.exports = router;
