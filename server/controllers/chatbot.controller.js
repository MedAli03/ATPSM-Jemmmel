const service = require("../services/chatbot.service");

exports.query = async (req, res, next) => {
  try {
    const { message } = req.body;
    const reply = await service.query(message);
    res.json({ reply });
  } catch (e) {
    next(e);
  }
};
