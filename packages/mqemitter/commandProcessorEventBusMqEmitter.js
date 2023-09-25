import { getLogger } from '@lazyapps/logger';
import { getSharedMqEmitter } from './mqEmitterRegistry.js';

const log = getLogger('CP/EB');

export const commandProcessorEventBusMqEmitter =
  ({ mqName }) =>
  () => {
    return Promise.resolve(getSharedMqEmitter(mqName))
      .then((mq) => ({
        publishEvent: (event) => {
          log.debug(`Publishing event timestamp ${event.timestamp}`);
          mq.emit({ topic: 'events', payload: event });
          return event;
        },
        publishReplayState: (state) => {
          log.debug(`Publishing replay state ${state}`);
          mq.emit({
            topic: '__system',
            payload: { type: 'SET_REPLAY_STATE', state },
          });
          return state;
        },
      }))
      .then((res) => {
        log.debug('Event bus ready');
        return res;
      });
  };
