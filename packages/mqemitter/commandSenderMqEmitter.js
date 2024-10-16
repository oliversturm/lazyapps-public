import { getLogger } from '@lazyapps/logger';
import { getSharedMqEmitter } from './mqEmitterRegistry.js';

export const commandSenderMqEmitter = ({ mqName }) => {
  return {
    sendCommand: (correlationId, cmd) => {
      const log = getLogger('RM/CS', correlationId);
      cmd.correlationId = correlationId;
      return Promise.resolve(getSharedMqEmitter(correlationId, mqName))
        .then((mq) =>
          mq.emit({
            topic: 'command',
            payload: cmd,
          }),
        )
        .then(() => {
          log.debug(`Sending command ${JSON.stringify(cmd)}`);
        })
        .catch((e) => {
          log.error(
            `Error occurred sending command ${JSON.stringify(cmd)}: ${e}`,
          );
        });
    },
  };
};
