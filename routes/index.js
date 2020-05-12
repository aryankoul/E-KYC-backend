const express = require('express');
const path = require('path');

const indexController = require('../controllers/indexController');
const uploadController = require('../controllers/uploadController');
const Request = require('../models/Request');

const router = express.Router();

/* GET home page. */
router.get('/', indexController.index);

router.post('/uploadDocument', uploadController.upload);

router.get('/download/:file', (req, res) => {
  const { file } = req.params;
  const fileLocation = path.join('./uploads', file);
  res.download(fileLocation, file);
});

router.post('/request/delete', (req, res) => {
  const { _id } = req.body;
  Request.deleteOne({ _id }, (error) => {
    if (error) res.status(500).json({ success: false, error });
    else res.status(200).json({ success: true });
  });
});

module.exports = router;
