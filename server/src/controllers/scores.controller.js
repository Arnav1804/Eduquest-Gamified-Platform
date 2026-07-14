const prisma = require('../utils/prisma');

async function addScore(req, res) {
  try {
    const { subject, points } = req.body;
    const userId = req.user.userId;

    const score = await prisma.score.create({
      data: { userId, subject, points }
    });

    res.status(201).json(score);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save score' });
  }
}

async function getMyScores(req, res) {
  try {
    const userId = req.user.userId;

    const scores = await prisma.score.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
}

module.exports = { addScore, getMyScores };