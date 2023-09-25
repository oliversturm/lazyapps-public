import { getPublishedMqEmitter } from '@lazyapps/mqemitter';
import { getLogger } from '@lazyapps/logger';

const log = getLogger('Svelte/CMND');

export const postCommand = (content) =>
  Promise.resolve(getPublishedMqEmitter(process.env.MQ_COMMANDS_PORT))
    .then((mq) => {
      mq.emit({
        topic: 'command',
        payload: content,
      });
      log.debug(`Command posted with content ${JSON.stringify(content)}`);
    })
    .catch((err) => {
      console.error(
        `An error occurred posting command with content ${JSON.stringify(
          content
        )}: ${err}`
      );
    });
