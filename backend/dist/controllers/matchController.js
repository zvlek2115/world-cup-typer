"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMatchResult = exports.createMatch = exports.getMatches = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getMatches = async (req, res) => {
    try {
        const matches = await prisma_1.default.match.findMany({
            orderBy: { startTime: 'asc' },
        });
        res.json(matches);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching matches' });
    }
};
exports.getMatches = getMatches;
const createMatch = async (req, res) => {
    const { homeTeam, awayTeam, startTime } = req.body;
    try {
        const match = await prisma_1.default.match.create({
            data: {
                homeTeam,
                awayTeam,
                startTime: new Date(startTime),
            },
        });
        res.status(201).json(match);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating match' });
    }
};
exports.createMatch = createMatch;
const updateMatchResult = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        res.status(400).json({ message: 'Invalid match ID' });
        return;
    }
    const { homeScore, awayScore, status } = req.body;
    try {
        const match = await prisma_1.default.match.update({
            where: { id },
            data: {
                homeScore,
                awayScore,
                status,
            },
        });
        if (status === 'FINISHED') {
            await calculatePointsForMatch(id, homeScore, awayScore);
        }
        res.json(match);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating match' });
    }
};
exports.updateMatchResult = updateMatchResult;
async function calculatePointsForMatch(matchId, actualHome, actualAway) {
    const predictions = await prisma_1.default.prediction.findMany({
        where: { matchId },
    });
    for (const pred of predictions) {
        let points = 0;
        const predHome = pred.predictedHomeScore;
        const predAway = pred.predictedAwayScore;
        if (predHome === actualHome && predAway === actualAway) {
            points = 3;
        }
        else {
            const actualDiff = actualHome - actualAway;
            const predDiff = predHome - predAway;
            if ((actualDiff > 0 && predDiff > 0) ||
                (actualDiff < 0 && predDiff < 0) ||
                (actualDiff === 0 && predDiff === 0)) {
                points = 1;
            }
        }
        await prisma_1.default.prediction.update({
            where: { id: pred.id },
            data: { pointsEarned: points },
        });
    }
}
