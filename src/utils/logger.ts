/**
 * Importing npm packages.
 */
import winston from 'winston';

/**
 * Importing user defined packages.
 */

/**
 * Importing and defining types.
 */

/**
 * Declaring the constants.
 */

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'shadow-novel-server' },
  transports: [new winston.transports.File({ filename: 'shadow-novel-server.log' })]
});
