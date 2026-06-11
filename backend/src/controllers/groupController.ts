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
    
    // Deadline: 13.06.2026 14:00 PL time is 12:00 UTC
    const deadline = new Date("2026-06-13T12:00:00Z");
    if (new Date() > deadline) {
      return res.status(400).json({ message: 'Typowanie grup zostało zakończone (termin minął 13.06 14:00)' });
    }

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

export const getGroupStandings = async (req: AuthRequest, res: Response) => {
  try {
    const teams = await (prisma as any).team.findMany();
    const matches = await prisma.match.findMany({
      where: { status: 'FINISHED' }
    });

    const standings: Record<string, any[]> = {};

    // Initialize standings for each team
    teams.forEach((team: any) => {
      if (!standings[team.groupName]) standings[team.groupName] = [];
      standings[team.groupName].push({
        name: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0
      });
    });

    // Calculate standings from matches
    matches.forEach(match => {
      if (match.homeScore === null || match.awayScore === null) return;

      let homeTeamStats: any, awayTeamStats: any;
      let groupName = '';

      // Find teams in standings
      for (const gName in standings) {
        const home = standings[gName].find(t => t.name === match.homeTeam);
        const away = standings[gName].find(t => t.name === match.awayTeam);
        if (home && away) {
          homeTeamStats = home;
          awayTeamStats = away;
          groupName = gName;
          break;
        }
      }

      if (!homeTeamStats || !awayTeamStats) return;

      homeTeamStats.played++;
      awayTeamStats.played++;
      homeTeamStats.goalsFor += match.homeScore;
      homeTeamStats.goalsAgainst += match.awayScore;
      awayTeamStats.goalsFor += match.awayScore;
      awayTeamStats.goalsAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) {
        homeTeamStats.won++;
        homeTeamStats.points += 3;
        awayTeamStats.lost++;
      } else if (match.homeScore < match.awayScore) {
        awayTeamStats.won++;
        awayTeamStats.points += 3;
        homeTeamStats.lost++;
      } else {
        homeTeamStats.drawn++;
        awayTeamStats.drawn++;
        homeTeamStats.points += 1;
        awayTeamStats.points += 1;
      }
    });

    // Sort teams within each group
    for (const groupName in standings) {
      standings[groupName].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const aDiff = a.goalsFor - a.goalsAgainst;
        const bDiff = b.goalsFor - b.goalsAgainst;
        if (bDiff !== aDiff) return bDiff - aDiff;
        return b.goalsFor - a.goalsFor;
      });
    }

    res.json(standings);
  } catch (error) {
    res.status(500).json({ message: 'Error calculating standings' });
  }
};

export const getAllGroupPredictions = async (req: AuthRequest, res: Response) => {
  try {
    const predictions = await (prisma as any).groupPrediction.findMany({
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: [
        { groupName: 'asc' },
        { predictedRank: 'asc' }
      ]
    });

    // Group by groupName, then by username
    const formatted: Record<string, Record<string, any[]>> = {};

    predictions.forEach((pred: any) => {
      if (!formatted[pred.groupName]) formatted[pred.groupName] = {};
      if (!formatted[pred.groupName][pred.user.username]) formatted[pred.groupName][pred.user.username] = [];
      
      formatted[pred.groupName][pred.user.username].push({
        teamName: pred.teamName,
        predictedRank: pred.predictedRank,
        pointsEarned: pred.pointsEarned
      });
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all group predictions' });
  }
};
