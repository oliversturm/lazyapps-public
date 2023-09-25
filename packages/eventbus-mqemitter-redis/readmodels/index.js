import { getLogger } from '@lazyapps/logger';
import { connect } from '../connect.js';

const log = getLogger('RM/EB');

export const mqEmitterRedis =
  ({ host = '127.0.0.1', port = 6379 } = {}) =>
  (context) => {
    let inReplay = false;

    const handleSysMessage = (msg) => {
      switch (msg.type) {
        case 'SET_REPLAY_STATE':
          inReplay = msg.state;
          break;
      }
    };

    return connect({ host, port })
      .catch((err) => {
        log.error(`Failed to connect to event bus on port ${port}: ${err}`);
      })
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
        log.info(`Event bus connected at ${host}:${port}`);
      });
  };
