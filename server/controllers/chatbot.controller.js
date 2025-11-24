const service = require("../services/chatbot.service");

exports.query = async (req, res, next) => {
  try {
    const { message } = req.body;
    const result = await service.query(message, req.user || {});

    res.json({
      reply: result.reply,
      model: result.model,
      metadata: result.metadata,
    });
  } catch (e) {
    if (e.status === 503) {
      return res
        .status(503)
        .json({ error: e.message || "Chatbot service temporarily unavailable." });
    }
    next(e);
  }
};
