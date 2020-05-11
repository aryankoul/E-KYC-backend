const express = require('express');
const indexController = require('../controllers/indexController');
const uploadController = require('../controllers/uploadController')
const router = express.Router();

/* GET home page. */
router.get('/', indexController.index);

router.post('/uploadDocument', uploadController.upload);

module.exports = router;
