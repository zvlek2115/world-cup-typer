"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getLeaderboard = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true,
                username: true,
                predictions: {
                    select: {
                        pointsEarned: true,
                    },
                },
            },
        });
        const leaderboard = users.map(user => {
            const totalPoints = user.predictions.reduce((acc, pred) => acc + (pred.pointsEarned || 0), 0);
            return {
                id: user.id,
                username: user.username,
                totalPoints,
            };
        }).sort((a, b) => b.totalPoints - a.totalPoints);
        res.json(leaderboard);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};
exports.getLeaderboard = getLeaderboard;
