const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/countriesController');

router.post('/refresh', ctrl.refresh);
router.get('/', ctrl.list);
router.get('/image', ctrl.getImage);
router.get('/:name', ctrl.getOne);
router.delete('/:name', ctrl.delete);

module.exports = router;