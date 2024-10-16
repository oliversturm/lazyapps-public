import Queue from 'promise-queue';
import { getLogger } from '@lazyapps/logger';

const createSideEffectsHandler = () => {
  const queue = new Queue(1, Infinity);

  const schedule =
    (correlationId, inReplay) =>
    (promise, options = {}) => {
      const defaultOptions = { name: 'unnamed', execution: 'liveOnly' };
      const actualOptions = { ...defaultOptions, ...options };

      const log = getLogger('ReadMod/Side', correlationId);
      return (inReplay &&
        ['replayOnly', 'always'].includes(actualOptions.execution)) ||
        (!inReplay && ['liveOnly', 'always'].includes(actualOptions.execution))
        ? queue.add(() =>
            new Promise((resolve) => {
              log.debug(
                `Running side-effect '${actualOptions.name}' (inReplay=${inReplay}, execution=${actualOptions.execution})`,
              );
              resolve();
            })
              .then(promise)
              .then(
                () =>
                  new Promise((resolve) => {
                    log.debug(`Side-effect '${actualOptions.name}' done`);
                    resolve();
                  }),
              )
              .catch((err) => {
                log.error(
                  `Can't execute side-effect '${actualOptions.name}': ${err}`,
                );
              }),
          )
        : new Promise((resolve) => {
            log.debug(
              `Skipping side-effect '${actualOptions.name} (inReplay=${inReplay}, execution=${actualOptions.execution})`,
            );
            resolve();
          });
    };

  return Promise.resolve({
    getSideEffectsHandler: (correlationId, inReplay) => ({
      schedule: schedule(correlationId, inReplay),
    }),
  });
};

export { createSideEffectsHandler };
