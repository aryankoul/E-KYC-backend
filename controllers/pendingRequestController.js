const Request = require('../models/Request');

exports.getPending = (req, res) => {
  const { verifierAddress, type } = req.query;
  if (verifierAddress == null || verifierAddress === '') return res.status(400).json({ success: false, message: 'verifier address is required' });
  else if (type == null || type === '')return  res.status(400).json({ success: false, message: 'type is required' });
  else if(type=='13'){
    Request.find({verifierAddress:verifierAddress, $or:[ {type:'1'}, {type:'3'} ]}, (error, requests) => {
      if (error) return res.status(500).json({ success: false, message: 'Server error' });
      else return res.status(200).json({ success: true, message: 'requests fetched successfully', requests });
    });
  }
  else {
    Request.find({ verifierAddress, type }, (error, requests) => {
      if (error) return res.status(500).json({ success: false, message: 'Server error' });
      else return res.status(200).json({ success: true, message: 'requests fetched successfully', requests });
    });
  }
};
