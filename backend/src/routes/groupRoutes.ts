import { Router } from 'express';
import { 
  getTeamsByGroups, 
  getMyGroupPredictions, 
  saveGroupPredictions, 
  updateGroupResult 
} from '../controllers/groupController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getTeamsByGroups);
router.get('/me', authenticateToken, getMyGroupPredictions);
router.post('/', authenticateToken, saveGroupPredictions);
router.put('/result', authenticateToken, updateGroupResult);

export default router;
