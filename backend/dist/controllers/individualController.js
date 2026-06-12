"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIndividualResults = exports.getAllIndividualPredictions = exports.saveIndividualPredictions = exports.getMyIndividualPredictions = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const DEADLINE = new Date("2026-06-13T12:00:00Z"); // 14:00 PL
const getMyIndividualPredictions = async (req, res) => {
    try {
        const prediction = await prisma_1.default.individualPrediction.findUnique({
            where: { userId: req.user.userId }
        });
        res.json(prediction || {});
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching individual predictions' });
    }
};
exports.getMyIndividualPredictions = getMyIndividualPredictions;
const saveIndividualPredictions = async (req, res) => {
    const { winner, mvp, topScorer } = req.body;
    try {
        if (new Date() > DEADLINE) {
            return res.status(400).json({ message: 'Termin obstawiania typów indywidualnych minął!' });
        }
        const userId = req.user.userId;
        const prediction = await prisma_1.default.individualPrediction.upsert({
            where: { userId },
            update: { winner, mvp, topScorer },
            create: { userId, winner, mvp, topScorer }
        });
        res.json(prediction);
    }
    catch (error) {
        res.status(500).json({ message: 'Error saving individual predictions' });
    }
};
exports.saveIndividualPredictions = saveIndividualPredictions;
const getAllIndividualPredictions = async (req, res) => {
    try {
        const predictions = await prisma_1.default.individualPrediction.findMany({
            include: {
                user: {
                    select: { username: true }
                }
            }
        });
        const formatted = predictions.map((p) => ({
            username: p.user.username,
            winner: p.winner,
            mvp: p.mvp,
            topScorer: p.topScorer,
            winnerPoints: p.winnerPoints,
            mvpPoints: p.mvpPoints,
            topScorerPoints: p.topScorerPoints
        }));
        res.json(formatted);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching all individual predictions' });
    }
};
exports.getAllIndividualPredictions = getAllIndividualPredictions;
const updateIndividualResults = async (req, res) => {
    const { winner, mvp, topScorer } = req.body;
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    try {
        const allPredictions = await prisma_1.default.individualPrediction.findMany();
        for (const pred of allPredictions) {
            let winnerPoints = 0;
            let mvpPoints = 0;
            let topScorerPoints = 0;
            if (winner && pred.winner === winner)
                winnerPoints = 10;
            if (mvp && pred.mvp === mvp)
                mvpPoints = 5;
            if (topScorer && pred.topScorer === topScorer)
                topScorerPoints = 5;
            await prisma_1.default.individualPrediction.update({
                where: { id: pred.id },
                data: { winnerPoints, mvpPoints, topScorerPoints }
            });
        }
        res.json({ message: 'Individual results updated and points calculated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating individual results' });
    }
};
exports.updateIndividualResults = updateIndividualResults;
