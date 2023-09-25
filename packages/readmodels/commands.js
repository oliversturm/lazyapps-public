import { getLogger } from '@lazyapps/logger';

const log = getLogger('RM/Cmd');

const createCommandHandler = ({ commandSender }) =>
  Promise.resolve({
    execute: (cmd) =>
      new Promise((resolve) => {
        log.debug(`Executing command ${JSON.stringify(cmd)}`);
        resolve();
      })
        .then(() => commandSender.sendCommand(cmd))
        .catch((err) => {
          log.error(`Can't execute command ${JSON.stringify(cmd)}: ${err}`);
        }),
  });

export { createCommandHandler };
