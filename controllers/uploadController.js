const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rp = require('request-promise');

const Request = require('../models/Request');

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
const maxSize = 1 * 1000 * 1000;
const upload = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter(req, file, cb) {
    // Set the filetypes, it is optional
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
      res.status(500).json({ success: false, message: 'file upload  error' });
    } else {
      let newRequest;
      if (req.body.type == null || req.body.type === '') res.status(400).json({ success: false, message: 'type is required' });
      if (req.body.type === '1') {
        const {
          name, phoneNumber, email, docType, verifierAddress, publicKey, type,
        } = req.body;
        if (name == null || name === '') res.status(400).json({ success: false, message: 'name is required' });
        if (phoneNumber == null || phoneNumber === '') res.status(400).json({ success: false, message: 'phone number is required' });
        if (email == null || email === '') res.status(400).json({ success: false, message: 'email is required' });
        if (docType == null || docType === '') res.status(400).json({ success: false, message: 'doc type is required' });
        if (verifierAddress == null || verifierAddress === '') res.status(400).json({ success: false, message: 'verifier address is required' });
        if (publicKey == null || publicKey === '') res.status(400).json({ success: false, message: 'public key is required' });
        newRequest = new Request({
          name, phoneNumber, verifierAddress, fileName, type, email, docType, publicKey,
        });
      } else {
        const {
          verifierAddress, userId, type,
        } = req.body;

        if (verifierAddress == null || verifierAddress === '') res.status(400).json({ success: false, message: 'verifier address is required' });
        if (userId == null || userId === '') res.status(400).json({ success: false, message: 'user id is required' });

        let qrData = await readQr(fileName);
        qrData = JSON.parse(qrData);
        qrData = qrData[0].symbol[0].data;
        console.log(`value: ${qrData}`);
        newRequest = new Request({
          verifierAddress, fileName, qrData, type, userId,
        });
      }

      newRequest.save((error, request) => {
        if (error) res.status(500).json({ success: false, message: 'error while generating request' });
        else res.status(200).json({ success: true, message: 'request saved successfully', request });
      });
    }
  });
};
