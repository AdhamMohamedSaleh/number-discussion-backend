import { Router } from 'express';
import { CalculationsController } from '../controllers/calculations.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', CalculationsController.getAll);
router.get('/:id', CalculationsController.getOne);
router.post('/', authMiddleware, CalculationsController.create);
router.post('/:id/respond', authMiddleware, CalculationsController.respond);

export default router;
