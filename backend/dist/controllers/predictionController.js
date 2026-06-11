"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertPrediction = exports.getMyPredictions = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getMyPredictions = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        const predictions = await prisma_1.default.prediction.findMany({
            where: { userId },
        });
        res.json(predictions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching predictions' });
    }
};
exports.getMyPredictions = getMyPredictions;
const upsertPrediction = async (req, res) => {
    const userId = req.user?.userId;
    const { matchId, predictedHomeScore, predictedAwayScore } = req.body;
    if (!userId)
        return res.sendStatus(401);
    try {
        const match = await prisma_1.default.match.findUnique({
            where: { id: matchId },
        });
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        if (new Date() > new Date(match.startTime)) {
            return res.status(400).json({ message: 'Match already started, cannot change prediction' });
        }
        const prediction = await prisma_1.default.prediction.upsert({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving prediction' });
    }
};
exports.upsertPrediction = upsertPrediction;
