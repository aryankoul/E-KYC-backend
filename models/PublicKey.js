const mongoose = require('mongoose');

const finalDataSchema = new mongoose.Schema({
  verifierAddress: {
    type: String,
  },
  publicKey: {
    type: String,
  },
});

module.exports = mongoose.model('PublicKey', finalDataSchema);
