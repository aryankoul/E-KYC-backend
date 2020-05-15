const express = require('express');
const path = require('path');

const indexController = require('../controllers/indexController');
const uploadController = require('../controllers/uploadController');
const Request = require('../models/Request');
const FinalData = require('../models/FinalData');
const pendingRequestController = require('../controllers/pendingRequestController');
const emailController = require('../controllers/emailController');

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
  console.log(req.body._id);
  Request.deleteOne({ _id }, (error) => {
    if (error) res.status(500).json({ success: false, error });
    else res.status(200).json({ success: true });
  });
});

router.post('/finalData', (req, res) => {
  const { verifierAddress, data, userId } = req.body;
  const finalData = new FinalData({
    verifierAddress, data, userId,
  });
  finalData.save((error, data) => {
    if (error) res.status(500).json({ success: false, error });
    else res.status(200).json({ success: true });
  });
});

router.get('/finalData', (req, res) => {
  const { verifierAddress } = req.body;
  FinalData.find({ verifierAddress }, (error, data) => {
    if (error) res.status(500).json({ success: false, error });
    else res.status(200).json({ success: true, data });
  });
});


router.get('/getPendingRequest', pendingRequestController.getPending);

router.get('/sendMail', emailController.email);

module.exports = router;
