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
  filePath: {
    type: String,
  },
});

module.exports = mongoose.model('Request', requestSchema);
