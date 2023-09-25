import { getLogger } from '@lazyapps/logger';
import { getSharedMqEmitter } from './mqEmitterRegistry.js';

const log = getLogger('RM/EB');

export const readModelEventBusMqEmitter =
  ({ mqName }) =>
  (context) => {
    let inReplay = false;

    const handleSysMessage = (msg) => {
      switch (msg.type) {
        case 'SET_REPLAY_STATE':
          inReplay = msg.state;
          break;
      }
    };

    return Promise.resolve(getSharedMqEmitter(mqName))
      .then((mq) => {
        mq.on('events', ({ payload }, cb) => {
          log.debug(
            `Received message on topic 'events': ${JSON.stringify(payload)}`
          );
          context.projectionHandler.projectEvent(payload, inReplay);

          cb();
        });
        mq.on('__system', ({ payload }, cb) => {
          log.debug(
            `Received message on topic 'events': ${JSON.stringify(payload)}`
          );

          handleSysMessage(payload);
          cb();
        });
      })
      .then(() => {
        log.debug(`Event bus receiving`);
      });
  };
