import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        predictions: {
          select: {
            pointsEarned: true,
          },
        },
        groupPredictions: {
          select: {
            pointsEarned: true,
          },
        },
      },
    });

    const leaderboard = users.map(user => {
      const matchPoints = user.predictions.reduce((acc, pred) => acc + (pred.pointsEarned || 0), 0);
      const groupPoints = user.groupPredictions.reduce((acc, pred) => acc + (pred.pointsEarned || 0), 0);
      return {
        id: user.id,
        username: user.username,
        totalPoints: matchPoints + groupPoints,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};
