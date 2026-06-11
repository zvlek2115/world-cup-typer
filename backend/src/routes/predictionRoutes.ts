import { Router } from 'express';
import { getMyPredictions, upsertPrediction, getAllPredictions } from '../controllers/predictionController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/me', getMyPredictions);
router.get('/all', getAllPredictions);
router.post('/', upsertPrediction);

export default router;
