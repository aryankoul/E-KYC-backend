const express = require('express');
const path = require('path');
const forge = require('node-forge')
const axios = require('axios');

const indexController = require('../controllers/indexController');
const uploadController = require('../controllers/uploadController');
const Request = require('../models/Request');
const KycData = require('../models/KycData');
const VerificationRequest = require('../models/VerificationRequest');
const pendingRequestController = require('../controllers/pendingRequestController');
const emailController = require('../controllers/emailController');
const qrmailer = require('../controllers/qrmailer')

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

router.post('/verify',(request, res)=>{
  const kycData = new KycData({
    verifierAddress: request.body.verifierAddress, userId: request.body.userId, data: request.body.originalData,
  });
  kycData.save((error, data) => {
    if(error) res.status(500).json({success: false });
    else {
      res.status(200).json({success:true, message:"verified"})
    }
  })
})

router.post('/request/delete', (req, res) => {
  const { _id } = req.body;
  console.log(req.body._id);
  Request.deleteOne({ _id }, (error) => {
    if (error) res.status(500).json({ success: false, error });
    else res.status(200).json({ success: true });
  });
});

router.get('/kycData', (req, res) => {
  const { verifierAddress } = req.query;
  KycData.find({ verifierAddress }, (error, data) => {
    if (error) res.status(500).json({ success: false, error });
    else res.status(200).json({ success: true, data });
  });
});


router.get('/getPendingRequest', pendingRequestController.getPending);

router.post('/mailQR', qrmailer.qr);

router.post('/verifyOTP',(req,res)=>{

  const { _id, otp, originalData }= req.body;
  VerificationRequest.find({ _id }, function (err,requests) {
    // console.log(requests)
    if (err || requests.length==0) return res.json({success:false,message:"Could not locate reuqest"})
    var request = requests[0]
    if(request.otp == otp){ 
      console.log()
      var publicKey = forge.pki.publicKeyFromPem(request.verifierPublicKey);
      console.log("otp verified")
      var md = forge.md.sha1.create();
      md.update(originalData, 'utf8');
      try{
        var verified=publicKey.verify(md.digest().bytes(),forge.util.decode64(request.signature))
      }catch(e){
        return res.status(401).json({success:false,message:"Invalid Data"})
      }
      if (verified==true){
        const kycData = new KycData({
          verifierAddress: request.verifierAddress, userId: request.userId, data: originalData,
        });
        kycData.save((error, data) => {
          if(error) res.status(500).json({success: false });
          else {
            VerificationRequest.findByIdAndDelete(_id, (error) => {
              if(error) res.status(500).json({ success: false });
              else res.json({success:true, message:"Kyc Completed"});
            })
          }
        })
      }
      else{
        return res.status(401).json({success:false, message:"Invalid data"})
      }
    }
    else{
      return res.status(401).json({success:false, message:"Invalid Otp"})
    }
  });

})

router.post('/sendMail', emailController.email);

router.post('/initiateVerification',(req, res)=>{
  const {otp, verifierAddress, userId, userPublicKey, verifierPublicKey, signature, email,_id, encryptedData} = req.body;
  const newRequest = new VerificationRequest({
    verifierAddress, verifierPublicKey, userId, otp, signature, email
  });
  newRequest.save((error, request) => {
    if (error) res.status(500).json({ success: false, error });
    else res.status(200).json({ success: true, request });
  
  // console.log(userPublicKey)
  try{
    var plaintextBytes = forge.util.encodeUtf8(otp);
    var publicKey = forge.pki.publicKeyFromPem(userPublicKey);
    var encryptedOtp = publicKey.encrypt(plaintextBytes);
  }catch (e) {
    console.log(e);
    alert("cannot encrypt");
    return res.status(400).json({success:false,message:e})
}
  encryptedOtp = forge.util.encode64(encryptedOtp)
  var data="This is the otp:\n\n"+encryptedOtp+" \n\n This is the encrypted data format of your KYC data:\n\n"+encryptedData+"\n\nfor your verification request number:    " + request._id+'\n\n please decrypt with your private key for two factor authorisation.';
  console.log(data)
  var body={
    email:email,
    data:data
  }
  console.log(_id)
  axios.post(url+'sendMail',body).then((response)=>{
    if(response.data.success===true){
      var bd={
        _id:_id
      }
      console.log(bd)
      axios.post(url+'request/delete',bd)
    }
  })
});
})

module.exports = router;
