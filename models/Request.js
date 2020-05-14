const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  verifierAddress: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  email: {
    type: String,
  },
  documentType: {
    type: String,
  },
  publicKey:{
    type: String,
  },
  fileName: {
    type: String,
  },
  email: {
    type: String,
  },
  docType: {
    type: String,
  },
});

module.exports = mongoose.model('Request', requestSchema);
