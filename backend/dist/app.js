"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const matchRoutes_1 = __importDefault(require("./routes/matchRoutes"));
const predictionRoutes_1 = __importDefault(require("./routes/predictionRoutes"));
const leaderboardRoutes_1 = __importDefault(require("./routes/leaderboardRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
const individualRoutes_1 = __importDefault(require("./routes/individualRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/matches', matchRoutes_1.default);
app.use('/api/predictions', predictionRoutes_1.default);
app.use('/api/leaderboard', leaderboardRoutes_1.default);
app.use('/api/groups', groupRoutes_1.default);
app.use('/api/individual', individualRoutes_1.default);
// Basic health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'World Cup Typer API' });
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
exports.default = app;
