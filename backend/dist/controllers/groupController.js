"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllGroupPredictions = exports.getGroupStandings = exports.updateGroupResult = exports.saveGroupPredictions = exports.getMyGroupPredictions = exports.getTeamsByGroups = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getTeamsByGroups = async (req, res) => {
    try {
        const teams = await prisma_1.default.team.findMany({
            orderBy: [
                { groupName: 'asc' },
                { name: 'asc' }
            ]
        });
        const groups = {};
        teams.forEach((team) => {
            if (!groups[team.groupName])
                groups[team.groupName] = [];
            groups[team.groupName].push(team);
        });
        res.json(groups);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching groups' });
    }
};
exports.getTeamsByGroups = getTeamsByGroups;
const getMyGroupPredictions = async (req, res) => {
    try {
        const predictions = await prisma_1.default.groupPrediction.findMany({
            where: { userId: req.user.userId }
        });
        res.json(predictions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching group predictions' });
    }
};
exports.getMyGroupPredictions = getMyGroupPredictions;
const saveGroupPredictions = async (req, res) => {
    const { predictions } = req.body; // Array of { groupName, teamName, predictedRank }
    try {
        const userId = req.user.userId;
        // Deadline: 13.06.2026 14:00 PL time is 12:00 UTC
        const deadline = new Date("2026-06-13T12:00:00Z");
        if (new Date() > deadline) {
            return res.status(400).json({ message: 'Typowanie grup zostało zakończone (termin minął 13.06 14:00)' });
        }
        for (const pred of predictions) {
            await prisma_1.default.groupPrediction.upsert({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error saving group predictions' });
    }
};
exports.saveGroupPredictions = saveGroupPredictions;
const updateGroupResult = async (req, res) => {
    const { groupName, results } = req.body; // results: { teamName: actualRank }
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    try {
        for (const teamName in results) {
            const actualRank = results[teamName];
            await prisma_1.default.team.update({
                where: { name: teamName },
                data: { actualRank }
            });
            // Calculate points for all users for this team in this group
            const predictions = await prisma_1.default.groupPrediction.findMany({
                where: { groupName, teamName }
            });
            for (const pred of predictions) {
                const points = pred.predictedRank === actualRank ? 3 : 0;
                await prisma_1.default.groupPrediction.update({
                    where: { id: pred.id },
                    data: { pointsEarned: points }
                });
            }
        }
        res.json({ message: 'Group results updated and points calculated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating group results' });
    }
};
exports.updateGroupResult = updateGroupResult;
const getGroupStandings = async (req, res) => {
    try {
        const teams = await prisma_1.default.team.findMany();
        const matches = await prisma_1.default.match.findMany({
            where: { status: 'FINISHED' }
        });
        const standings = {};
        // Initialize standings for each team
        teams.forEach((team) => {
            if (!standings[team.groupName])
                standings[team.groupName] = [];
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
            if (match.homeScore === null || match.awayScore === null)
                return;
            let homeTeamStats, awayTeamStats;
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
            if (!homeTeamStats || !awayTeamStats)
                return;
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
            }
            else if (match.homeScore < match.awayScore) {
                awayTeamStats.won++;
                awayTeamStats.points += 3;
                homeTeamStats.lost++;
            }
            else {
                homeTeamStats.drawn++;
                awayTeamStats.drawn++;
                homeTeamStats.points += 1;
                awayTeamStats.points += 1;
            }
        });
        // Sort teams within each group
        for (const groupName in standings) {
            standings[groupName].sort((a, b) => {
                if (b.points !== a.points)
                    return b.points - a.points;
                const aDiff = a.goalsFor - a.goalsAgainst;
                const bDiff = b.goalsFor - b.goalsAgainst;
                if (bDiff !== aDiff)
                    return bDiff - aDiff;
                return b.goalsFor - a.goalsFor;
            });
        }
        res.json(standings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error calculating standings' });
    }
};
exports.getGroupStandings = getGroupStandings;
const getAllGroupPredictions = async (req, res) => {
    try {
        const predictions = await prisma_1.default.groupPrediction.findMany({
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
        const formatted = {};
        predictions.forEach((pred) => {
            if (!formatted[pred.groupName])
                formatted[pred.groupName] = {};
            if (!formatted[pred.groupName][pred.user.username])
                formatted[pred.groupName][pred.user.username] = [];
            formatted[pred.groupName][pred.user.username].push({
                teamName: pred.teamName,
                predictedRank: pred.predictedRank,
                pointsEarned: pred.pointsEarned
            });
        });
        res.json(formatted);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching all group predictions' });
    }
};
exports.getAllGroupPredictions = getAllGroupPredictions;
