import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple proxy helper
const proxy = (target: string, path: string, pathRewrite: string) => async (req: express.Request, res: express.Response) => {
  try {
    const url = `${target}${req.originalUrl.replace(path, pathRewrite)}`;
    const response = await axios({ method: req.method, url, data: req.body, headers: req.headers, validateStatus: () => true });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Proxy error:', error.message);
    res.status(503).json({ error: 'Service unavailable' });
  }
};

// Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'OK', 
//     timestamp: new Date().toISOString(),
//     services: {
//       userService: process.env.USER_SERVICE_URL || 'http://localhost:4000',
//       parkingService: process.env.PARKING_SERVICE_URL || 'http://localhost:3003'
//     }
//   });
// });

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Login Service - Simple Proxy
app.use('/api/auth/login', proxy('http://localhost:4000',/^\/api\/auth/,'/auth'));

// Signup Service - Simple Proxy
app.use('/api/auth/signup', proxy('http://localhost:4001','/^\/api\/auth/','/auth'));

// Get all parking records of users
app.use('/api/parking-records/history/:userId', proxy('http://localhost:4002', /^\/api\/parking-records/,'/parking-records'));

// Examples for other services:
// app.use('/api/parking', proxy('http://localhost:3003', '/api'));
// app.use('/api/users', proxy('http://localhost:3002', '/api/users'));

// Default error handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📍 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔗 Proxying to services:`);
  console.log(`   - Servicio de login: ${process.env.USER_SERVICE_URL || 'http://localhost:4000'}`);
  console.log(`   - Servicio de registro: ${process.env.PARKING_SERVICE_URL || 'http://localhost:4001'}`);
});