import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getTeamsByGroups = async (req: AuthRequest, res: Response) => {
  try {
    const teams = await (prisma as any).team.findMany({
      orderBy: [
        { groupName: 'asc' },
        { name: 'asc' }
      ]
    });
    
    const groups: Record<string, any[]> = {};
    teams.forEach((team: any) => {
      if (!groups[team.groupName]) groups[team.groupName] = [];
      groups[team.groupName].push(team);
    });
    
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups' });
  }
};

export const getMyGroupPredictions = async (req: AuthRequest, res: Response) => {
  try {
    const predictions = await (prisma as any).groupPrediction.findMany({
      where: { userId: req.user!.userId }
    });
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group predictions' });
  }
};

export const saveGroupPredictions = async (req: AuthRequest, res: Response) => {
  const { predictions } = req.body; // Array of { groupName, teamName, predictedRank }

  try {
    const userId = req.user!.userId;

    for (const pred of predictions) {
      await (prisma as any).groupPrediction.upsert({
        where: {
          userId_groupName_teamName: {
            userId,
            groupName: pred.groupName,
            teamName: pred.teamName
          }
        },
        update: {
          predictedRank: pred.predictedRank
        },
        create: {
          userId,
          groupName: pred.groupName,
          teamName: pred.teamName,
          predictedRank: pred.predictedRank
        }
      });
    }

    res.json({ message: 'Predictions saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving group predictions' });
  }
};

export const updateGroupResult = async (req: AuthRequest, res: Response) => {
  const { groupName, results } = req.body; // results: { teamName: actualRank }

  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    for (const teamName in results) {
      const actualRank = results[teamName];
      await (prisma as any).team.update({
        where: { name: teamName },
        data: { actualRank }
      });

      // Calculate points for all users for this team in this group
      const predictions = await (prisma as any).groupPrediction.findMany({
        where: { groupName, teamName }
      });

      for (const pred of predictions) {
        const points = pred.predictedRank === actualRank ? 3 : 0;
        await (prisma as any).groupPrediction.update({
          where: { id: pred.id },
          data: { pointsEarned: points }
        });
      }
    }

    res.json({ message: 'Group results updated and points calculated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating group results' });
  }
};
