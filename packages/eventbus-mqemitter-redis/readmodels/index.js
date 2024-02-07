import pRetry from 'p-retry';

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

    return pRetry(() => connect({ host, port }), {
      onFailedAttempt: (error) => {
        log.error(
          `Attempt ${error.attemptNumber} failed connecting to Redis on port ${port}: '${error}'. Will retry another ${error.retriesLeft} times.`,
        );
      },
      retries: 10,
    })
      .catch((err) => {
        log.error(`Failed to connect to Redis on port ${port}: ${err}`);
      })
      .then((mq) => {
        mq.on('events', ({ payload }, cb) => {
          log.debug(
            `Received message on topic 'events': ${JSON.stringify(payload)}`,
          );
          context.projectionHandler.projectEvent(payload, inReplay);

          cb();
        });
        mq.on('__system', ({ payload }, cb) => {
          log.debug(
            `Received message on topic '__system': ${JSON.stringify(payload)}`,
          );

          handleSysMessage(payload);
          cb();
        });
      })
      .then(() => {
        log.info(`Event bus connected at ${host}:${port}`);
      });
  };
