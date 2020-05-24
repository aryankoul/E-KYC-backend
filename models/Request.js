const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  type: {
    type: String,
  },
  userId: {
    type: String,
  },
  verifierAddress: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  address: {
    type: String
  },
  publicKey: {
    type: String,
  },
  fileName: {
    type: String,
  },
  qrData:{
    type:String,
  },
  email: {
    type: String,
  },
  docType: {
    type: String,
  },
});

module.exports = mongoose.model('Request', requestSchema);
