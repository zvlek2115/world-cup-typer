import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

const DEADLINE = new Date("2026-06-13T12:00:00Z"); // 14:00 PL

export const getMyIndividualPredictions = async (req: AuthRequest, res: Response) => {
  try {
    const prediction = await (prisma as any).individualPrediction.findUnique({
      where: { userId: req.user!.userId }
    });
    res.json(prediction || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching individual predictions' });
  }
};

export const saveIndividualPredictions = async (req: AuthRequest, res: Response) => {
  const { winner, mvp, topScorer } = req.body;

  try {
    if (new Date() > DEADLINE) {
      return res.status(400).json({ message: 'Termin obstawiania typów indywidualnych minął!' });
    }

    const userId = req.user!.userId;
    const prediction = await (prisma as any).individualPrediction.upsert({
      where: { userId },
      update: { winner, mvp, topScorer },
      create: { userId, winner, mvp, topScorer }
    });

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ message: 'Error saving individual predictions' });
  }
};

export const getAllIndividualPredictions = async (req: AuthRequest, res: Response) => {
  try {
    const predictions = await (prisma as any).individualPrediction.findMany({
      include: {
        user: {
          select: { username: true }
        }
      }
    });
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all individual predictions' });
  }
};

export const updateIndividualResults = async (req: AuthRequest, res: Response) => {
  const { winner, mvp, topScorer } = req.body;

  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const allPredictions = await (prisma as any).individualPrediction.findMany();

    for (const pred of allPredictions) {
      let winnerPoints = 0;
      let mvpPoints = 0;
      let topScorerPoints = 0;

      if (winner && pred.winner === winner) winnerPoints = 10;
      if (mvp && pred.mvp === mvp) mvpPoints = 5;
      if (topScorer && pred.topScorer === topScorer) topScorerPoints = 5;

      await (prisma as any).individualPrediction.update({
        where: { id: pred.id },
        data: { winnerPoints, mvpPoints, topScorerPoints }
      });
    }

    res.json({ message: 'Individual results updated and points calculated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating individual results' });
  }
};
