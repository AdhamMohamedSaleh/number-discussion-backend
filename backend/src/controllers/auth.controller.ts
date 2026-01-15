import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest, RegisterDto, LoginDto } from '../types';

export const AuthController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body as RegisterDto;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      if (username.length < 3 || username.length > 50) {
        res.status(400).json({ error: 'Username must be between 3 and 50 characters' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
      }

      const result = await AuthService.register(username, password);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Username already exists') {
        res.status(409).json({ error: error.message });
        return;
      }
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body as LoginDto;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const result = await AuthService.login(username, password);
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        res.status(401).json({ error: error.message });
        return;
      }
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const user = await AuthService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
