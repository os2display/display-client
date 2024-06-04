import winston from 'winston';

// @TODO: Add configuration of the logger.

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [],
});

// @TODO: Add based on configuration instead of always.
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
);

export default logger;
