import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import { logger, serverLogger, dbLogger } from './config/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003'
  ],
  credentials: true
}));

// Pino HTTP logging middleware
app.use(pinoHttp({ logger }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    dbLogger.info('Database connection has been established successfully.');
    
    // Sync database models
    await sequelize.sync({ force: false });
    dbLogger.info('Database models synchronized.');
    
    const server = app.listen(PORT, () => {
      serverLogger.info(`Server is running on port ${PORT}`);
      serverLogger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      serverLogger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      // Stop accepting new connections
      server.close(async (err) => {
        if (err) {
          serverLogger.error({ error: err }, 'Error during server close');
          process.exit(1);
        }
        
        serverLogger.info('HTTP server closed.');
        
        try {
          // Close database connections
          await sequelize.close();
          dbLogger.info('Database connections closed.');
          
          serverLogger.info('Graceful shutdown completed.');
          process.exit(0);
        } catch (dbError) {
          dbLogger.error({ error: dbError }, 'Error closing database connections');
          process.exit(1);
        }
      });
      
      // Force shutdown after 30 seconds
      setTimeout(() => {
        serverLogger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error) => {
      serverLogger.fatal({ error }, 'Uncaught Exception');
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      serverLogger.fatal({ reason, promise }, 'Unhandled Rejection');
      gracefulShutdown('unhandledRejection');
    });
    
  } catch (error) {
    serverLogger.fatal({ error }, 'Unable to start server');
    process.exit(1);
  }
};

startServer();
