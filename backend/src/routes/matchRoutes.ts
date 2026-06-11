import { Router } from 'express';
import { getMatches, createMatch, updateMatchResult } from '../controllers/matchController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getMatches);
router.post('/', authenticateJWT, isAdmin, createMatch);
router.put('/:id', authenticateJWT, isAdmin, updateMatchResult);

export default router;
