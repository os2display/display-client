import winston from 'winston';
import ConfigLoader from '../config-loader';

let logger = null;

const getLogger = async () => {
  if (logger == null) {
    await ConfigLoader.loadConfig().then((config) => {
      logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        defaultMeta: { service: 'user-service' },
        transports: [],
      });

      if (config?.logging?.length > 0) {
        config?.logging.forEach((loggingEntry) => {
          let transport = null;

          switch (loggingEntry.type) {
            case 'console':
              transport = new winston.transports.Console({
                level: loggingEntry.level ?? 'info',
                format: winston.format.combine(
                  winston.format.colorize(),
                  winston.format.simple()
                ),
              });
              break;
            default:
              throw new Error(`Unsupported logging type ${loggingEntry.type}.`);
          }

          if (transport !== null) {
            logger.add(transport);
          }
        });
      } else {
        // Silent logger to avoid exceptions.
        logger.add(
          new winston.transports.Console({
            silent: true,
          })
        );
      }
    });
  }

  return logger;
};

export default getLogger;
