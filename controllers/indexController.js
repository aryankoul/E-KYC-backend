exports.index = (req, res) => {
  res.status(200).json({
    success: true,
    name: 'abc',
    age: 26,
  });
};
