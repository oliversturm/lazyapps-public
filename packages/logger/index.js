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

export const { getLogger } = log;
export { getStream };
