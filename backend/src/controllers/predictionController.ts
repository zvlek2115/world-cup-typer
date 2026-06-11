import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAllPredictions = async (req: AuthRequest, res: Response) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        predictions: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all predictions' });
  }
};

export const getMyPredictions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.sendStatus(401);

  try {
    const predictions = await prisma.prediction.findMany({
      where: { userId },
      include: { match: true },
    });
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching predictions' });
  }
};

export const upsertPrediction = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { matchId, predictedHomeScore, predictedAwayScore } = req.body;

  if (!userId) return res.sendStatus(401);

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (new Date() > new Date(match.startTime)) {
      return res.status(400).json({ message: 'Match already started, cannot change prediction' });
    }

    const prediction = await prisma.prediction.upsert({
      where: {
        userId_matchId: { userId, matchId },
      },
      update: {
        predictedHomeScore,
        predictedAwayScore,
      },
      create: {
        userId,
        matchId,
        predictedHomeScore,
        predictedAwayScore,
      },
    });

    res.json(prediction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving prediction' });
  }
};
