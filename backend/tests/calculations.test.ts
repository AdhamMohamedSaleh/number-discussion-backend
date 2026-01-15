import request from 'supertest';
import express from 'express';
import { CalculationsController } from '../src/controllers/calculations.controller';
import { CalculationsService } from '../src/services/calculations.service';
import { AuthService } from '../src/services/auth.service';
import { authMiddleware } from '../src/middleware/auth.middleware';

jest.mock('../src/services/calculations.service');
jest.mock('../src/services/auth.service');
jest.mock('../src/config/database');

const app = express();
app.use(express.json());
app.get('/calculations', CalculationsController.getAll);
app.get('/calculations/:id', CalculationsController.getOne);
app.post('/calculations', authMiddleware, CalculationsController.create);
app.post('/calculations/:id/respond', authMiddleware, CalculationsController.respond);

describe('Calculations Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AuthService.verifyToken as jest.Mock).mockReturnValue({ id: 1, username: 'testuser' });
  });

  describe('GET /calculations', () => {
    it('should return all calculation trees', async () => {
      const mockTrees = [
        {
          id: 1,
          userId: 1,
          username: 'alice',
          value: 42,
          parentId: null,
          operation: null,
          operand: null,
          children: []
        }
      ];
      (CalculationsService.getAllTrees as jest.Mock).mockResolvedValue(mockTrees);

      const response = await request(app).get('/calculations');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTrees);
    });
  });

  describe('GET /calculations/:id', () => {
    it('should return a calculation tree', async () => {
      const mockTree = {
        id: 1,
        userId: 1,
        username: 'alice',
        value: 42,
        parentId: null,
        operation: null,
        operand: null,
        children: []
      };
      (CalculationsService.getTree as jest.Mock).mockResolvedValue(mockTree);

      const response = await request(app).get('/calculations/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTree);
    });

    it('should return 404 if calculation not found', async () => {
      (CalculationsService.getTree as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/calculations/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Calculation not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).get('/calculations/invalid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid calculation ID');
    });
  });

  describe('POST /calculations', () => {
    it('should create a starting number', async () => {
      const mockCalc = {
        id: 1,
        userId: 1,
        username: 'testuser',
        value: 42,
        parentId: null,
        operation: null,
        operand: null
      };
      (CalculationsService.createStartingNumber as jest.Mock).mockResolvedValue(mockCalc);

      const response = await request(app)
        .post('/calculations')
        .set('Authorization', 'Bearer valid-token')
        .send({ value: 42 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCalc);
      expect(CalculationsService.createStartingNumber).toHaveBeenCalledWith(1, 42);
    });

    it('should return 401 without authentication', async () => {
      (AuthService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/calculations')
        .send({ value: 42 });

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid value', async () => {
      const response = await request(app)
        .post('/calculations')
        .set('Authorization', 'Bearer valid-token')
        .send({ value: 'not-a-number' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Value must be a valid number');
    });
  });

  describe('POST /calculations/:id/respond', () => {
    it('should add an operation successfully', async () => {
      const mockCalc = {
        id: 2,
        userId: 1,
        username: 'testuser',
        value: 50,
        parentId: 1,
        operation: '+',
        operand: 8
      };
      (CalculationsService.addOperation as jest.Mock).mockResolvedValue(mockCalc);

      const response = await request(app)
        .post('/calculations/1/respond')
        .set('Authorization', 'Bearer valid-token')
        .send({ operation: '+', operand: 8 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCalc);
      expect(CalculationsService.addOperation).toHaveBeenCalledWith(1, 1, '+', 8);
    });

    it('should return 400 for invalid operation', async () => {
      const response = await request(app)
        .post('/calculations/1/respond')
        .set('Authorization', 'Bearer valid-token')
        .send({ operation: '%', operand: 8 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid operation. Must be one of: +, -, *, /');
    });

    it('should return 400 for division by zero', async () => {
      (CalculationsService.addOperation as jest.Mock).mockRejectedValue(
        new Error('Division by zero is not allowed')
      );

      const response = await request(app)
        .post('/calculations/1/respond')
        .set('Authorization', 'Bearer valid-token')
        .send({ operation: '/', operand: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Division by zero is not allowed');
    });

    it('should return 404 if parent calculation not found', async () => {
      (CalculationsService.addOperation as jest.Mock).mockRejectedValue(
        new Error('Parent calculation not found')
      );

      const response = await request(app)
        .post('/calculations/999/respond')
        .set('Authorization', 'Bearer valid-token')
        .send({ operation: '+', operand: 5 });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Parent calculation not found');
    });

    it('should handle all operations correctly', async () => {
      const operations = ['+', '-', '*', '/'] as const;

      for (const op of operations) {
        (CalculationsService.addOperation as jest.Mock).mockResolvedValue({
          id: 2,
          operation: op,
          operand: 5
        });

        const response = await request(app)
          .post('/calculations/1/respond')
          .set('Authorization', 'Bearer valid-token')
          .send({ operation: op, operand: 5 });

        expect(response.status).toBe(201);
      }
    });
  });
});

describe('CalculationsService', () => {
  describe('buildTrees', () => {
    it('should build tree structure correctly', () => {
      jest.unmock('../src/services/calculations.service');
      const { CalculationsService: RealService } = jest.requireActual('../src/services/calculations.service');

      const calculations = [
        { id: 1, user_id: 1, username: 'alice', parent_id: null, value: '10', operation: null, operand: null, created_at: new Date() },
        { id: 2, user_id: 2, username: 'bob', parent_id: 1, value: '15', operation: '+', operand: '5', created_at: new Date() },
        { id: 3, user_id: 1, username: 'alice', parent_id: 1, value: '20', operation: '*', operand: '2', created_at: new Date() },
      ];

      const trees = RealService.buildTrees(calculations);

      expect(trees).toHaveLength(1);
      expect(trees[0].id).toBe(1);
      expect(trees[0].children).toHaveLength(2);
    });
  });
});
