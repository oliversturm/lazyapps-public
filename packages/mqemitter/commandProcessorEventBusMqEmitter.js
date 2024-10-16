import { getLogger } from '@lazyapps/logger';
import { getSharedMqEmitter } from './mqEmitterRegistry.js';

export const commandProcessorEventBusMqEmitter =
  ({ mqName }) =>
  () => {
    const initLog = getLogger('CP/EB/MQE', 'INIT');

    return Promise.resolve(getSharedMqEmitter('INIT', mqName))
      .then((mq) => ({
        publishEvent: (correlationId) => (event) => {
          const log = getLogger('CP/EB/MQE', correlationId);
          log.debug(`Publishing event timestamp ${event.timestamp}`);
          event.correlationId = correlationId;
          mq.emit({ topic: 'events', payload: event });
          return event;
        },
        publishReplayState: (correlationId) => (state) => {
          const log = getLogger('CP/EB/MQE', correlationId);
          log.debug(`Publishing replay state ${state}`);
          mq.emit({
            topic: '__system',
            payload: { type: 'SET_REPLAY_STATE', state, correlationId },
          });
          return state;
        },
      }))
      .then((res) => {
        initLog.debug('Event bus ready');
        return res;
      });
  };
