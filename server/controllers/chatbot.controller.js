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
 *               childId:
 *                 type: integer
 *                 example: 12
 *               message:
 *                 type: string
 *                 example: "Comment encourager la communication chez un enfant autiste?"
 *               preferredLanguage:
 *                 type: string
 *                 example: "ar-fr-mix"
 *     responses:
 *       200:
 *         description: Réponse générée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 childId:
 *                   type: integer
 *                 educatorId:
 *                   type: integer
 *                 question:
 *                   type: string
 *                 answer:
 *                   type: string
 *                 createdAt:
 *                   type: string
 */
exports.query = async (req, res, next) => {
  try {
    const { childId, message, preferredLanguage } = req.body;
    const result = await service.submitMessage({
      user: req.user || {},
      childId,
      message,
      preferredLanguage,
    });

    res.json(result);
  } catch (e) {
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
