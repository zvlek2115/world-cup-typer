import { Router } from 'express';
import { 
  getTeamsByGroups, 
  getMyGroupPredictions, 
  saveGroupPredictions, 
  updateGroupResult,
  getGroupStandings
} from '../controllers/groupController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, getTeamsByGroups);
router.get('/standings', authenticateJWT, getGroupStandings);
router.get('/all', authenticateJWT, getAllGroupPredictions);
router.get('/me', authenticateJWT, getMyGroupPredictions);
router.post('/', authenticateJWT, saveGroupPredictions);
router.put('/result', authenticateJWT, updateGroupResult);

export default router;
