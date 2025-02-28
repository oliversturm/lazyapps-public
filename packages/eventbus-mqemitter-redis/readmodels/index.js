import pRetry from 'p-retry';

import { getLogger } from '@lazyapps/logger';
import { connect } from '../connect.js';

export const mqEmitterRedis =
  ({ host = '127.0.0.1', port = 6379 } = {}) =>
  (context) => {
    const initLog = getLogger('RM/EB/Redis', 'INIT');
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
        initLog.error(
          `Attempt ${error.attemptNumber} failed connecting to Redis on port ${port}: '${error}'. Will retry another ${error.retriesLeft} times.`,
        );
      },
      retries: 10,
    })
      .catch((err) => {
        initLog.error(`Failed to connect to Redis on port ${port}: ${err}`);
      })
      .then((mq) => {
        mq.on('events', ({ payload }, cb) => {
          const { correlationId, event } = payload;
          const log = getLogger('RM/EB/Redis', correlationId);
          log.debug(`Received event: ${JSON.stringify(event)}`);
          context.projectionHandler.projectEvent(correlationId)(
            event,
            inReplay,
          );

          cb();
        });
        mq.on('__system', ({ payload }, cb) => {
          const { correlationId, event } = payload;
          const log = getLogger('RM/EB/Redis', correlationId);
          log.debug(`Received '__system' event: ${JSON.stringify(event)}`);

          handleSysMessage(event);
          cb();
        });
      })
      .then(() => {
        initLog.info(`Event bus connected at ${host}:${port}`);
      });
  };
