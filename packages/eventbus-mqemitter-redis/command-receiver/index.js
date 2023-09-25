import { getLogger } from '@lazyapps/logger';
import { connect } from '../connect.js';

const log = getLogger('CP/EB');

// NOTE NOTE OLD COMMENT -- may not need this anymore with
// different other mq systems.
//
// For all kinds of reasons (http://zguide.zeromq.org/page:all),
// zeromq pub/sub subscribers can be running behind the publisher
// a bit. This can happen when the subscriber is already running
// before the publisher, but even if it is started shortly after
// the publisher. Of course there are ways to resolve this and
// sync things up "properly", but using zeromq in this sample
// solution is only a suggestion and the issues and solutions
// would be very different with other messaging systems, so I'm
// choosing the simple workaround of a small built-in startup
// delay for now.
const waitSubscribers =
  (millis) =>
  (...args) =>
    new Promise((resolve) => {
      log.debug('Waiting for subscribers to catch up');
      setTimeout(() => resolve(...args), millis);
    });

export const mqEmitterRedis =
  ({ host = '127.0.0.1', port = 6379 } = {}) =>
  () => {
    return connect({ host, port })
      .catch((err) => {
        log.error(`Failed to connect to event bus on port ${port}: ${err}`);
      })
      .then(waitSubscribers(1000))
      .then((mq) => {
        log.info(`Event bus publishing to port ${port}`);
        return mq;
      })
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
      }));
  };
