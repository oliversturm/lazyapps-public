import Queue from 'promise-queue';
import { getLogger } from '@lazyapps/logger';

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

const logProjections = (log, inReplay) => (rmProjections) => {
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

const updateTimestamp = (correlationId, storage, rmName, timestamp) =>
  storage.updateLastProjectedEventTimestamps(
    correlationId,
    [rmName],
    timestamp,
  );

const handleProjections =
  (correlationId, log, context, getProjectionContext, inReplay, event) =>
  (rmProjections) =>
    Promise.all(
      rmProjections.map(([rmName, f]) =>
        f(getProjectionContext(correlationId)(rmName)(inReplay), event)
          .then(() =>
            updateTimestamp(
              correlationId,
              context.storage,
              rmName,
              event.timestamp,
            ),
          )
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
  (context, eventQueue, getProjectionContext) => (correlationId) => {
    const log = getLogger(`RM/ProjEv`, correlationId);
    return (event, inReplay) =>
      eventQueue.add(() =>
        collectProjections(context.readModels, event)
          .then(logProjections(log, inReplay))
          .then(updateInternalReadModelTimestamps(event, context.readModels))
          .then(
            handleProjections(
              correlationId,
              log,
              context,
              getProjectionContext,
              inReplay,
              event,
            ),
          ),
      );
  };

export const createProjectionHandler = (context) => {
  const eventQueue = new Queue(1, Infinity);
  const getProjectionContext = (correlationId) => (rmName) => (inReplay) => ({
    storage: context.storage.perRequest(correlationId),
    commands: context.commands(correlationId),
    changeNotification: context.changeNotification(correlationId),
    log: getLogger(`RM/${rmName}`, correlationId),
    sideEffects: context.sideEffects.getSideEffectsHandler(
      correlationId,
      inReplay,
    ),
  });

  return {
    projectEvent: projectEvent(context, eventQueue, getProjectionContext),
  };
};

export const testing = {
  collectProjections,
  logProjections,
  updateInternalReadModelTimestamps,
  updateTimestamp,
  handleProjections,
  projectEvent,
};
