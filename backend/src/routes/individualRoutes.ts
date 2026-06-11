import { Router } from 'express';
import { 
  getMyIndividualPredictions, 
  saveIndividualPredictions, 
  getAllIndividualPredictions, 
  updateIndividualResults 
} from '../controllers/individualController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', authenticateJWT, getMyIndividualPredictions);
router.get('/all', authenticateJWT, getAllIndividualPredictions);
router.post('/', authenticateJWT, saveIndividualPredictions);
router.put('/result', authenticateJWT, updateIndividualResults);

export default router;
