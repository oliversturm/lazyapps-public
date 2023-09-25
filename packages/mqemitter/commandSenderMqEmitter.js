import { getLogger } from '@lazyapps/logger';
import { getSharedMqEmitter } from './mqEmitterRegistry.js';

const log = getLogger('RM/CS');

export const commandSenderMqEmitter = ({ mqName }) => {
  return {
    sendCommand: (content) => {
      return Promise.resolve(getSharedMqEmitter(mqName))
        .then((mq) =>
          mq.emit({
            topic: 'command',
            payload: content,
          })
        )
        .then(() => {
          log.debug(`Sending command ${content}`);
        })
        .catch((e) => {
          log.error(`Error occurred sending command ${content}: ${e}`);
        });
    },
  };
};
