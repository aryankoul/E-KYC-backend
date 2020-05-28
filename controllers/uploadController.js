const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rp = require('request-promise');

const Request = require('../models/Request');
const KycData = require('../models/KycData');

let fileName = '';
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Uploads is the Upload_folder_name
    cb(null, 'uploads');
  },
  filename(req, file, cb) {
    fileName = `${req.body.phoneNumber}-${Date.now()}.jpg`;
    cb(null, fileName);
  },
});

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 10 * 1000 * 1000;

async function idempotency(req){
  var flag=false,errMsg='';
  if(req.body.type==1){
    await Request.find({publicKey:req.body.publicKey,type:1},(err,docs)=>{
      console.log(docs.length)
      if(docs.length!==0){
        console.log("hi")
        errMsg="Request already exists"
        // return errMsg
        // return cb(true,`${'Request Already Exists'}`);
      }
    })
    await KycData.find({userPublicKey:req.body.publicKey},(err,docs)=>{
      if(docs.length!==0){
        console.log(docs)
        flag=true;
        errMsg="KYC already done with this bank"
        // return errMsg
      }
    })
  }
  else if(req.body.type==2){
    await Request.find({verifierAddress:req.body.verifierAddress,userId:req.body.userId},(err,docs)=>{
      if(docs.length!==0){
        errMsg="Request already exists"
        flag=true
        // return errMsg
      }
    })
    /**
     * upload controller is called by verifier and can check if this is in its list or not
     */
    await KycData.find({verifierAddress:req.body.verifierAddress,userId:req.body.userId},(err,docs)=>{
      if(docs.length!==0){
        console.log(docs)
        flag=true;
        errMsg="KYC already done with this bank"
      }
    })
  }
  else if(req.body.type==3){
    await KycData.find({userId:req.body.userId},(err,docs)=>{
      if(docs.length==0){
        console.log(docs)
        flag=true;
        errMsg="Previous KYC not done"
      }
    })
    await Request.find({verifierAddress:req.body.verifierAddress,userId:req.body.userId},(err,docs)=>{
      if(docs.length!==0){
        errMsg="Request already exists"
        flag=true
        // return errMsg
      }
    })
    
  }
  return errMsg

}

const upload = multer({
  storage,
  limits: { fileSize: maxSize },
  async fileFilter (req, file, cb) {
    console.log(req.body)
    var check = await idempotency(req)
    console.log(check)
    if(check){
      return cb(check)
    }
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(`${'Error: File upload only supports the '
                + 'following filetypes - '}${filetypes}`);

  },

// mypic is the name of file attribute
}).single('doc');

function readQr(fileName) {
  const fileLocation = path.join(__dirname, '../uploads', fileName);
  console.log(fileLocation);
  const file = fs.createReadStream(fileLocation);
  const options = {
    method: 'POST',
    uri: 'https://api.qrserver.com/v1/read-qr-code/',
    formData: {
      file: {
        value: file,
        options: {
          filename: 'qrcode.png',
          contentType: 'image/jpg',
        },
      },
    },
    headers: {
      /* 'content-type': 'multipart/form-data' */ // Is set automatically
    },
  };
  return rp(options);
// rp(options)
//     .then(function (body) {
//         console.log(body)
  // body=JSON.parse(body)
  // console.log(body[0].symbol[0].data)
//         return body[0].symbol[0].data;
//     })
//     .catch(function (err) {
//         return "Error Reading QR CODE!"
//     });
}

exports.upload = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log(err);
      return res.status(401).json({ success: false, message: err });
    } else {
      let newRequest;
      if (req.body.type == null || req.body.type === '') res.status(400).json({ success: false, message: 'type is required' });
      if (req.body.type === '1') {
        const {
          name, phoneNumber, email, docType, verifierAddress, publicKey, type, address
        } = req.body;
        if (name == null || name === '') return res.status(400).json({ success: false, message: 'name is required' });
        if (phoneNumber == null || phoneNumber === '') return res.status(400).json({ success: false, message: 'phone number is required' });
        if (email == null || email === '') return res.status(400).json({ success: false, message: 'email is required' });
        if (address == null || address === '')return res.status(400).json({ success: false, message: 'address is required' });
        if (docType == null || docType === '') return res.status(400).json({ success: false, message: 'doc type is required' });
        if (verifierAddress == null || verifierAddress === '') return  res.status(400).json({ success: false, message: 'verifier address is required' });
        if (publicKey == null || publicKey === '')return res.status(400).json({ success: false, message: 'public key is required' });
        newRequest = new Request({
          name, phoneNumber, verifierAddress, fileName, type, email, docType, publicKey, address
        });
      } else if(req.body.type=='2'){
        const {
          verifierAddress, userId, type,
        } = req.body;

        if (verifierAddress == null || verifierAddress === '') return res.status(400).json({ success: false, message: 'verifier address is required' });
        if (userId == null || userId === '') return res.status(400).json({ success: false, message: 'user id is required' });

        let qrData = await readQr(fileName);
        qrData = JSON.parse(qrData);
        qrData = qrData[0].symbol[0].data;
        console.log(`value: ${qrData}`);
        newRequest = new Request({
          verifierAddress, fileName, qrData, type, userId,
        });
      }
      else{
        const {
          name, phoneNumber, email, docType, verifierAddress, publicKey, type, userId, address
        } = req.body;
        if (name == null || name === '') return res.status(400).json({ success: false, message: 'name is required' });
        if (phoneNumber == null || phoneNumber === '') return res.status(400).json({ success: false, message: 'phone number is required' });
        if (email == null || email === '') return res.status(400).json({ success: false, message: 'email is required' });
        if (docType == null || docType === '') return res.status(400).json({ success: false, message: 'doc type is required' });
        if (verifierAddress == null || verifierAddress === '') return  res.status(400).json({ success: false, message: 'verifier address is required' });
        if (address == null || address === '')return res.status(400).json({ success: false, message: 'address is required' });
        if (userId == null || userId === '')return res.status(400).json({ success: false, message: 'userId is required' });
        if (publicKey == null || publicKey === '')return res.status(400).json({ success: false, message: 'public key is required' });
        newRequest = new Request({
          name, phoneNumber, verifierAddress, fileName, type, email, docType, publicKey, userId,address
        });
      }

      newRequest.save((error, request) => {
        if (error) return res.status(500).json({ success: false, message: 'error while generating request' });
        else return res.status(200).json({ success: true, message: 'request saved successfully', request });
      });
    }
  });
};
