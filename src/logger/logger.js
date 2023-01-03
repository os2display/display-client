const winston = require('winston');
const ConfigLoader = require('../config-loader');

let logger = null;

const getLogger = async () => {
  if (logger == null) {
    await ConfigLoader.loadConfig((config) => {
      logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        defaultMeta: { service: 'user-service' },
        transports: [],
      });

      if (config?.logging) {
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
      }
    });
  }

  return logger;
};

module.exports = getLogger;
