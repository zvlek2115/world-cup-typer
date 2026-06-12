import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import matchRoutes from './routes/matchRoutes';
import predictionRoutes from './routes/predictionRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import groupRoutes from './routes/groupRoutes';
import individualRoutes from './routes/individualRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/individual', individualRoutes);

// Basic health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'World Cup Typer API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
