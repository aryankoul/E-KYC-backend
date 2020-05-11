const multer = require('multer');
let path = require('path');

let storage = multer.diskStorage({
  destination (req, file, cb) { 
        // Uploads is the Upload_folder_name 
        cb(null, 'uploads') 
    },
  filename (req, file, cb) { 
      cb(null, `${file.fieldname}-${Date.now()}.jpg`) 
    },
});

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;
let upload = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter (req, file, cb){ 
        // Set the filetypes, it is optional 
        var filetypes = /jpeg|jpg|png/; 
        var mimetype = filetypes.test(file.mimetype); 

        var extname = filetypes.test(path.extname( 
                    file.originalname).toLowerCase()); 

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
  
        if(err) {
            res.send(err);
        } 
        else {
            res.send('Success, Image uploaded!');
        } 
    });
};
