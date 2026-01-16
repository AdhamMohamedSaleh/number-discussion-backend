import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import calculationsRoutes from './routes/calculations.routes';
import { corsOptions } from './config/cors';
import { apiLimiter } from './middleware/rate-limit.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // CORS with proper configuration
app.use(express.json({ limit: '10mb' })); // Body size limit

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // Detailed logging for production
} else {
  app.use(morgan('dev')); // Concise logging for development
}

// Rate limiting
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/calculations', calculationsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
