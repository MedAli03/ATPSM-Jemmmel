const service = require("../services/chatbot.service");

/**
 * @swagger
 * /chatbot/query:
 *   post:
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     summary: Soumettre une question éducative au chatbot (llama2)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Comment encourager la communication chez un enfant autiste?"
 *     responses:
 *       200:
 *         description: Réponse générée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                 model:
 *                   type: string
 *                   example: "llama2"
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                     role:
 *                       type: string
 */
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

/**
 * @swagger
 * /chatbot/history:
 *   get:
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     summary: Derniers messages du chatbot pour l'utilisateur connecté
 *     parameters:
 *       - in: query
 *         name: childId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de l'enfant associé à la conversation
 *     responses:
 *       200:
 *         description: Historique des échanges
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   childId:
 *                     type: integer
 *                   educatorId:
 *                     type: integer
 *                   question:
 *                     type: string
 *                   answer:
 *                     type: string
 *                   model:
 *                     type: string
 *                   createdAt:
 *                     type: string
 */
exports.history = async (req, res, next) => {
  try {
    const { childId } = req.query;
    const rows = await service.getHistoryForChild({
      user: req.user,
      childId,
    });
    res.json(rows || []);
  } catch (e) {
    next(e);
  }
};
