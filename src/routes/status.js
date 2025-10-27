const express = require('express');
const router = express.Router();
const { status } = require('../controllers/countriesController');

router.get('/', status);

module.exports = router;
