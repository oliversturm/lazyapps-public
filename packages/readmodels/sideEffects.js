import Queue from 'promise-queue';
import memoize from 'lodash/fp/memoize.js';

import { getLogger } from '@lazyapps/logger';

const log = getLogger('ReadMod/Side');

const createSideEffectsHandler = () => {
  const queue = new Queue(1, Infinity);

  const schedule =
    (inReplay) =>
    (promise, options = {}) => {
      const defaultOptions = { name: 'unnamed', execution: 'liveOnly' };
      const actualOptions = { ...defaultOptions, ...options };
      return (inReplay &&
        ['replayOnly', 'always'].includes(actualOptions.execution)) ||
        (!inReplay && ['liveOnly', 'always'].includes(actualOptions.execution))
        ? queue.add(() =>
            new Promise((resolve) => {
              log.debug(
                `Running side-effect '${actualOptions.name}' (inReplay=${inReplay}, execution=${actualOptions.execution})`
              );
              resolve();
            })
              .then(promise)
              .then(
                new Promise((resolve) => {
                  log.debug(`Side-effect '${actualOptions.name}' done`);
                  resolve();
                })
              )
              .catch((err) => {
                log.error(
                  `Can't execute side-effect '${actualOptions.name}': ${err}`
                );
              })
          )
        : new Promise((resolve) => {
            log.debug(
              `Skipping side-effect '${actualOptions.name} (inReplay=${inReplay}, execution=${actualOptions.execution})`
            );
            resolve();
          });
    };

  return Promise.resolve({
    getSideEffectsHandler: memoize((inReplay) => ({
      schedule: schedule(inReplay),
    })),
  });
};

export { createSideEffectsHandler };
