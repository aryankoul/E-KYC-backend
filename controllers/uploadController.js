const multer = require('multer');
const path = require('path');

const Request = require('../models/Request');

const storage = multer.diskStorage({
  destination (req, file, cb) {
    // Uploads is the Upload_folder_name
    cb(null, 'uploads');
  },
  filename (req, file, cb) {
    cb(null, `${req.query.phoneNumber}-${Date.now()}.jpg`);
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
}).single('mypic');

exports.upload = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(500).json({ success: false, error: err });
    } else {
      const { name, phoneNumber, verifierAddress } = req.query;
      const filePath = req.file.filename;
      const newRequest = new Request({
        name, phoneNumber, verifierAddress, filePath, type: '1',
      });
      newRequest.save((error, request) => {
        if (error) res.status(500).json({ success: false, error });
        else res.status(200).json({ success: true, request });
      });
    }
  });
};
