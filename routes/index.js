const express = require('express');
const path = require('path');
const forge = require('node-forge')
const axios = require('axios')

const indexController = require('../controllers/indexController');
const uploadController = require('../controllers/uploadController');
const Request = require('../models/Request');
const FinalData = require('../models/FinalData');
const VerificationRequest = require('../models/VerificationRequest');
const pendingRequestController = require('../controllers/pendingRequestController');
const emailController = require('../controllers/emailController');

const url = "http://localhost:8000/";

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

router.post('/sendMail', emailController.email);

router.post('/initiateVerification',(req, res)=>{
  const {otp, verifierAddress, userId, userPublicKey, signature, email} = req.body;
  const newRequest = new VerificationRequest({
    verifierAddress, userId, otp, signature, email
  });
  newRequest.save((error, request) => {
    if (error) res.status(500).json({ success: false, error });
    else res.status(200).json({ success: true, request });
  });
  // console.log(userPublicKey)
  try{
    var plaintextBytes = forge.util.encodeUtf8(otp);
    var publicKey = forge.pki.publicKeyFromPem(userPublicKey);
    var encryptedOtp = publicKey.encrypt(plaintextBytes);
  }catch (e) {
    console.log(e);
    alert("cannot encrypt");
}
  encryptedOtp = forge.util.encode64(encryptedOtp)
  var data="This is the otp:\n\n"+encryptedOtp+" \n\nfor your verification with " + verifierAddress+'\n\n please decrypt with your private key for two factor authorisation.';
  console.log(data)
  var body={
    email:email,
    data:data
  }
  axios.post(url+'sendMail',body)
  .then(function (response) {
    console.log(response);
  })
})

module.exports = router;
