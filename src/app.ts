import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerOptions from './config/swagger.config';
import { db } from './services/database.service';
import jobRoutes from './routes/job.routes';
import authRoutes from './routes/auth.routes';
import { applicationRoutes } from './routes/application.routes';
import { adminRoutes } from './routes/admin.routes';
import { uploadRoutes } from './routes/upload.routes';
import { companyRoutes } from './routes/company.routes';
import { userRoutes } from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter, authLimiter } from './middleware/rate-limit.middleware';
import { swaggerSpec } from './swagger';
import indexRouter from './routes/index.routes';

export const app: Express = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Swagger Documentation
const specs = swaggerJsdoc(swaggerOptions);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

// CORS setup with proper options for cookies
// Support multiple origins for development and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://localhost:5173', // Vite default
  'https://nuxes-front.vercel.app',
  'https://nexues-backend.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

// Update CORS configuration to be more permissive in development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error'
    });
  }
});

// API Routes with proper prefixing
const apiRouter = express.Router();
app.use('/api', apiRouter);

// API welcome message handler
const apiWelcomeHandler = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'success',
    message: 'Welcome to the Job Board API',
    documentation: '/api-docs',
    version: '1.0.0'
  });
};

// Add welcome message for root API endpoint
apiRouter.get('/', apiWelcomeHandler);

// Mount all routes
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/company', companyRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/user', userRoutes); // Changed from /users to /user

// Add this before other route handlers
app.use('/', indexRouter);

// Add explicit error handling for CORS errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    console.error('CORS error:', { origin: req.headers.origin });
    return res.status(403).json({
      success: false,
      message: 'CORS error: Origin not allowed'
    });
  }
  next(err);
});

// Error handling middleware should be after routes
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});
