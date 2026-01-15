import request from 'supertest';
import express from 'express';
import { AuthController } from '../src/controllers/auth.controller';
import { AuthService } from '../src/services/auth.service';
import { authMiddleware } from '../src/middleware/auth.middleware';

jest.mock('../src/services/auth.service');
jest.mock('../src/config/database');

const app = express();
app.use(express.json());
app.post('/register', AuthController.register);
app.post('/login', AuthController.login);
app.get('/me', authMiddleware, AuthController.me);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const mockDate = new Date('2024-01-01T00:00:00.000Z');
      const mockResult = {
        user: { id: 1, username: 'testuser', created_at: mockDate },
        token: 'mock-token'
      };
      (AuthService.register as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/register')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.user.id).toBe(1);
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.token).toBe('mock-token');
      expect(AuthService.register).toHaveBeenCalledWith('testuser', 'password123');
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/register')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/register')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password are required');
    });

    it('should return 400 if username is too short', async () => {
      const response = await request(app)
        .post('/register')
        .send({ username: 'ab', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username must be between 3 and 50 characters');
    });

    it('should return 400 if password is too short', async () => {
      const response = await request(app)
        .post('/register')
        .send({ username: 'testuser', password: '12345' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password must be at least 6 characters');
    });

    it('should return 409 if username already exists', async () => {
      (AuthService.register as jest.Mock).mockRejectedValue(new Error('Username already exists'));

      const response = await request(app)
        .post('/register')
        .send({ username: 'existinguser', password: 'password123' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Username already exists');
    });
  });

  describe('POST /login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockDate = new Date('2024-01-01T00:00:00.000Z');
      const mockResult = {
        user: { id: 1, username: 'testuser', created_at: mockDate },
        token: 'mock-token'
      };
      (AuthService.login as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(1);
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.token).toBe('mock-token');
    });

    it('should return 400 if credentials are missing', async () => {
      const response = await request(app)
        .post('/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password are required');
    });

    it('should return 401 for invalid credentials', async () => {
      (AuthService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /me', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should return 401 with invalid token', async () => {
      (AuthService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should return user data with valid token', async () => {
      const mockDate = new Date('2024-01-01T00:00:00.000Z');
      const mockUser = { id: 1, username: 'testuser', created_at: mockDate };
      (AuthService.verifyToken as jest.Mock).mockReturnValue({ id: 1, username: 'testuser' });
      (AuthService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.username).toBe('testuser');
    });
  });
});
