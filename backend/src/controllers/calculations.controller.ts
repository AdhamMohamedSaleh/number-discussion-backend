import { Request, Response } from 'express';
import { CalculationsService } from '../services/calculations.service';
import { AuthRequest, CreateCalculationDto, CreateOperationDto, Operation } from '../types';

const VALID_OPERATIONS: Operation[] = ['+', '-', '*', '/'];

export const CalculationsController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const trees = await CalculationsService.getAllTrees();
      res.json(trees);
    } catch (error) {
      console.error('Get all calculations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid calculation ID' });
        return;
      }

      const tree = await CalculationsService.getTree(id);
      if (!tree) {
        res.status(404).json({ error: 'Calculation not found' });
        return;
      }

      res.json(tree);
    } catch (error) {
      console.error('Get calculation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { value } = req.body as CreateCalculationDto;

      if (typeof value !== 'number' || isNaN(value)) {
        res.status(400).json({ error: 'Value must be a valid number' });
        return;
      }

      const calculation = await CalculationsService.createStartingNumber(req.user.id, value);
      res.status(201).json(calculation);
    } catch (error) {
      console.error('Create calculation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async respond(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const parentId = parseInt(req.params.id);
      if (isNaN(parentId)) {
        res.status(400).json({ error: 'Invalid calculation ID' });
        return;
      }

      const { operation, operand } = req.body as CreateOperationDto;

      if (!operation || !VALID_OPERATIONS.includes(operation)) {
        res.status(400).json({ error: 'Invalid operation. Must be one of: +, -, *, /' });
        return;
      }

      if (typeof operand !== 'number' || isNaN(operand)) {
        res.status(400).json({ error: 'Operand must be a valid number' });
        return;
      }

      const calculation = await CalculationsService.addOperation(
        req.user.id,
        parentId,
        operation,
        operand
      );
      res.status(201).json(calculation);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Parent calculation not found') {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message === 'Division by zero is not allowed') {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      console.error('Respond to calculation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
