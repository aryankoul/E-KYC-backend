const mongoose = require('mongoose');

const finalDataSchema = new mongoose.Schema({
  verifierAddress: {
    type: String,
  },
  userId: {
    type: String,
  },
  encryptedCid: {
      type: String,
  }
});

module.exports = mongoose.model('CompletedKyc', finalDataSchema);
