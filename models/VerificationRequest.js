const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  verifierAddress: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
  },
  otp: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
  },
  email:{
      type: String,
  },
  verifierPublicKey: {
    type: String
  }
});

module.exports = mongoose.model('VerificationRequest', requestSchema);
