const morgan = require('morgan');
const logger = require('../utils/logger');

// Custom morgan format
morgan.token('user-id', (req) => req.user?.userId || 'anonymous');

const httpLogger = morgan(
    ':method :url :status :res[content-length] - :response-time ms - User: :user-id',
    {
        stream: {
            write: (message) => logger.info(message.trim(), { type: 'http' })
        }
    }
);

module.exports = httpLogger;