import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Create logger configuration
const loggerConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        singleLine: true,
      },
    },
  }),
};

// Create logger instance
export const logger = pino(loggerConfig);

// Create child loggers for different modules
export const createModuleLogger = (module: string) => {
  return logger.child({ module });
};

// Database logger
export const dbLogger = createModuleLogger('database');

// Auth logger
export const authLogger = createModuleLogger('auth');

// User logger
export const userLogger = createModuleLogger('user');

// Server logger
export const serverLogger = createModuleLogger('server');

// Error logger
export const errorLogger = createModuleLogger('error');
