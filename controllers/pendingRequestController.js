const Request = require('../models/Request');

exports.getPending = (req, res) => {
  const { verifierAddress, type } = req.query;
  Request.find({ verifierAddress, type }, (error, requests) => {
    if (error) res.status(500).json({ success: false, error });
    else res.status(200).json({ success: true, requests });
  });
};
