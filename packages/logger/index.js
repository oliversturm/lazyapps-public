import chalk from 'chalk';
import log from 'loglevel';
import prefix from 'loglevel-plugin-prefix';
import { Writable } from 'stream';

const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

prefix.reg(log);
log.setLevel(process.env.LOG_LEVEL || 'info');

prefix.apply(log, {
  format: (level, name, timestamp) =>
    `${chalk.yellow(`${timestamp} [${name.slice(0, 15).padEnd(15)}]`)} ${colors[
      level.toUpperCase()
    ](level)}:`,
  timestampFormatter: function (date) {
    return date
      .toISOString()
      .replace(/.*(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}).*/, '$1 $2');
  },
});

const getStream = (output) =>
  new Writable({
    write: (chunk, encoding, callback) => {
      output(chunk.toString().trim());
      callback();
    },
  });

/**
 * Get a logger with a specific name.
 * @param {string} name The name of the logger.
 * @param {string} correlationId The correlation ID to use.
 * @returns {object} The logger object.
 */
export const getLogger = (name, correlationId) => {
  const logger = log.getLogger(name);
  const cid = correlationId || `CORR-NONE`;
  return {
    traceBare: (msg) => logger.trace(msg),
    debugBare: (msg) => logger.debug(msg),
    infoBare: (msg) => logger.info(msg),
    warnBare: (msg) => logger.warn(msg),
    errorBare: (msg) => logger.error(msg),
    logBare: (msg) => logger.log(msg),
    trace: (msg) => logger.trace(`[${cid}] ${msg}`),
    debug: (msg) => logger.debug(`[${cid}] ${msg}`),
    info: (msg) => logger.info(`[${cid}] ${msg}`),
    warn: (msg) => logger.warn(`[${cid}] ${msg}`),
    error: (msg) => logger.error(`[${cid}] ${msg}`),
    log: (msg) => logger.log(`[${cid}] ${msg}`),
  };
};

export { getStream };
