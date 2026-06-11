import { Router } from 'express';
import { 
  getTeamsByGroups, 
  getMyGroupPredictions, 
  saveGroupPredictions, 
  updateGroupResult 
} from '../controllers/groupController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, getTeamsByGroups);
router.get('/me', authenticateJWT, getMyGroupPredictions);
router.post('/', authenticateJWT, saveGroupPredictions);
router.put('/result', authenticateJWT, updateGroupResult);

export default router;
