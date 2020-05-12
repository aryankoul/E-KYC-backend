const Request = require('../models/Request');

exports.getPending = (req, res) => {
    const verifierAddress = req.query.verifierAddress;
    Request.find({ 'verifierAddress': verifierAddress }, function (err,requests) {
        if (err) return handleError(err);
       res.json({ requests });
      });
  };
  