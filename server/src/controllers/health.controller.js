const getHealth = (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'EduQuest API is running',
  });
};

module.exports = {
  getHealth,
};
