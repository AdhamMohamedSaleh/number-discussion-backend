import { Router } from 'express';
import { CalculationsController } from '../controllers/calculations.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { createLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

/**
 * @swagger
 * /api/calculations:
 *   get:
 *     tags: [Calculations]
 *     summary: Get all calculations
 *     description: Retrieve all calculations with their tree structure (including nested children)
 *     responses:
 *       200:
 *         description: List of all calculations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Calculation'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', CalculationsController.getAll);

/**
 * @swagger
 * /api/calculations/{id}:
 *   get:
 *     tags: [Calculations]
 *     summary: Get specific calculation
 *     description: Retrieve a single calculation with its complete tree structure
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Calculation ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Calculation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Calculation'
 *       404:
 *         description: Calculation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', CalculationsController.getOne);

/**
 * @swagger
 * /api/calculations:
 *   post:
 *     tags: [Calculations]
 *     summary: Create a new calculation
 *     description: Create a new root calculation (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: number
 *                 example: 42
 *                 description: The initial value for the calculation
 *     responses:
 *       201:
 *         description: Calculation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Calculation'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many calculations created
 */
router.post('/', authMiddleware, createLimiter, CalculationsController.create);

/**
 * @swagger
 * /api/calculations/{id}/respond:
 *   post:
 *     tags: [Calculations]
 *     summary: Respond to a calculation
 *     description: Create a child calculation by performing an operation on a parent calculation (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent calculation ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operation
 *               - operand
 *             properties:
 *               operation:
 *                 type: string
 *                 enum: [add, subtract, multiply, divide]
 *                 example: add
 *                 description: The mathematical operation to perform
 *               operand:
 *                 type: number
 *                 example: 10
 *                 description: The value to use in the operation
 *     responses:
 *       201:
 *         description: Response calculation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Calculation'
 *       400:
 *         description: Invalid input or operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Parent calculation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many calculations created
 */
router.post('/:id/respond', authMiddleware, createLimiter, CalculationsController.respond);

export default router;
