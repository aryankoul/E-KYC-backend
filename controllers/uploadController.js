const multer = require('multer');
const path = require('path');
var fs = require("fs");
var rp = require('request-promise');

const Request = require('../models/Request');

let fileName = '';
const storage = multer.diskStorage({
  destination (req, file, cb) {
    // Uploads is the Upload_folder_name
    cb(null, 'uploads');
  },
  filename (req, file, cb) {
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
  fileFilter (req, file, cb) {
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

function readQr(fileName){
  const fileLocation = path.join(__dirname,'../uploads', fileName);
  var file=fs.createReadStream(fileLocation)
  var options = {
    method: 'POST',
    uri: 'https://api.qrserver.com/v1/read-qr-code/',
    formData: {
        file: {
            value: file,
            options: {
                filename: 'qrcode.png',
                contentType: 'image/jpg'
            }
        }
    },
    headers: {
        /* 'content-type': 'multipart/form-data' */ // Is set automatically
    }
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
      res.status(500).json({ success: false, error: err });
    } else {
      let newRequest;
      if (req.body.type === '1') {
        const {
          name, phoneNumber, email, docType, verifierAddress, publicKey, type,
        } = req.body;
        newRequest = new Request({
          name, phoneNumber, verifierAddress, fileName, type, email, docType, publicKey,
        });
      } else {
        const {
          verifierAddress, userId, type,
        } = req.body;
        var qrData =await readQr(fileName)
        qrData=JSON.parse(qrData)
        qrData=qrData[0].symbol[0].data
        console.log(qrData)
        newRequest = new Request({
          verifierAddress, fileName, qrData, type, userId,
        });
      }

      newRequest.save((error, request) => {
        if (error) res.status(500).json({ success: false, error });
        else res.status(200).json({ success: true, request });
      });
    }
  });
};
