import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getMatches = async (req: Request, res: Response) => {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { startTime: 'asc' },
    });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching matches' });
  }
};

export const createMatch = async (req: AuthRequest, res: Response) => {
  const { homeTeam, awayTeam, startTime } = req.body;
  try {
    const match = await prisma.match.create({
      data: {
        homeTeam,
        awayTeam,
        startTime: new Date(startTime),
      },
    });
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ message: 'Error creating match' });
  }
};

export const updateMatchResult = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    res.status(400).json({ message: 'Invalid match ID' });
    return;
  }
  const { homeScore, awayScore, status } = req.body;

  try {
    const match = await prisma.match.update({
      where: { id },
      data: {
        homeScore,
        awayScore,
        status,
      },
    });

    if (status === 'FINISHED' && homeScore !== null && awayScore !== null) {
      await calculatePointsForMatch(id, homeScore, awayScore);
    } else {
      // If match is not finished or scores are cleared, reset points to null
      await prisma.prediction.updateMany({
        where: { matchId: id },
        data: { pointsEarned: null },
      });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Error updating match' });
  }
};

async function calculatePointsForMatch(matchId: string, actualHome: number, actualAway: number) {
  const predictions = await prisma.prediction.findMany({
    where: { matchId },
  });

  for (const pred of predictions) {
    let points = 0;
    const predHome = pred.predictedHomeScore;
    const predAway = pred.predictedAwayScore;

    if (predHome === actualHome && predAway === actualAway) {
      points = 3;
    } else {
      const actualDiff = actualHome - actualAway;
      const predDiff = predHome - predAway;

      if ((actualDiff > 0 && predDiff > 0) || 
          (actualDiff < 0 && predDiff < 0) || 
          (actualDiff === 0 && predDiff === 0)) {
        points = 1;
      }
    }

    await prisma.prediction.update({
      where: { id: pred.id },
      data: { pointsEarned: points },
    });
  }
}
