import Queue from 'promise-queue';
import memoize from 'lodash/fp/memoize.js';
import { getLogger } from '@lazyapps/logger';

const log = getLogger('RM/Prj');

const collectProjections = (readModels, event) =>
  Promise.resolve(
    Object.keys(readModels)
      .map((rmName) => {
        const rm = readModels[rmName];
        const projection = rm.projections && rm.projections[event.type];
        if (projection) {
          return [rmName, projection];
        } else return null;
      })
      .filter((el) => !!el)
      .filter(([, f]) => !!f),
  );

const logProjections = (inReplay) => (rmProjections) => {
  if (rmProjections.length)
    log.debug(
      `Projecting event for read models: ${JSON.stringify(
        rmProjections.map(([rmName]) => rmName),
      )} (inReplay=${inReplay})`,
    );
  return rmProjections;
};

const updateInternalReadModelTimestamps =
  (event, readModels) => (rmProjections) =>
    Promise.all(
      rmProjections.map(([rmName]) => {
        readModels[rmName].lastProjectedEventTimestamp = event.timestamp;
      }),
    ).then(() => rmProjections);

const updateTimestamp = (storage, rmName, timestamp) =>
  storage.updateLastProjectedEventTimestamps([rmName], timestamp);

const handleProjections =
  (context, getProjectionContext, inReplay, event) => (rmProjections) =>
    Promise.all(
      rmProjections.map(([rmName, f]) =>
        f(getProjectionContext(rmName)(inReplay), event)
          .then(() => updateTimestamp(context.storage, rmName, event.timestamp))
          .catch((err) => {
            log.error(
              `Error occurred projecting event ${JSON.stringify(
                event,
              )} for read model ${rmName}, or during read model timestamp update: ${err}`,
            );
          }),
      ),
    );

const projectEvent =
  (context, eventQueue, getProjectionContext) => (event, inReplay) =>
    eventQueue.add(() =>
      collectProjections(context.readModels, event)
        .then(logProjections(inReplay))
        .then(updateInternalReadModelTimestamps(event, context.readModels))
        .then(
          handleProjections(context, getProjectionContext, inReplay, event),
        ),
    );

export const createProjectionHandler = (context) => {
  const eventQueue = new Queue(1, Infinity);
  const projectionContext = {
    storage: context.storage,
    commands: context.commands,
    changeNotification: context.changeNotification,
  };
  const getProjectionContext = memoize((rmName) =>
    memoize((inReplay) => ({
      ...projectionContext,
      log: getLogger(`RM/${rmName}`),
      sideEffects: context.sideEffects.getSideEffectsHandler(inReplay),
    })),
  );

  return Promise.resolve({
    projectEvent: projectEvent(context, eventQueue, getProjectionContext),
  });
};

export const testing = {
  collectProjections,
  logProjections,
  updateInternalReadModelTimestamps,
  updateTimestamp,
  handleProjections,
  projectEvent,
};
