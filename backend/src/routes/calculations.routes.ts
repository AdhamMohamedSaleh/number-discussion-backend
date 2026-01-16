import { Router } from 'express';
import { CalculationsController } from '../controllers/calculations.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { createLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.get('/', CalculationsController.getAll);
router.get('/:id', CalculationsController.getOne);
router.post('/', authMiddleware, createLimiter, CalculationsController.create);
router.post('/:id/respond', authMiddleware, createLimiter, CalculationsController.respond);

export default router;
