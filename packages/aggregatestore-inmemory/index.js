import { getLogger } from '@lazyapps/logger';

const initLogger = getLogger('CmdProc/AS', 'INIT');

export const inmemory = () => (aggregates) => {
  const store = {};
  let lastProjectedEventTimestamp = 0;
  let inReplay = false;

  const getAggregateState = (name, id) =>
    (store[name] && store[name][id]) || aggregates[name].initial();

  const setAggregateState = (name, id, state) => {
    if (!store[name]) store[name] = {};
    store[name][id] = state;
  };

  const applyAggregateProjection = (correlationId) => (event) => {
    const { aggregateName, aggregateId, type, timestamp } = event;
    const projection =
      aggregates[aggregateName].projections &&
      aggregates[aggregateName].projections[type];
    const log = getLogger('CmdProc/AS', correlationId);
    if (projection) {
      const state = getAggregateState(aggregateName, aggregateId);
      const projected = projection(state, event);
      setAggregateState(aggregateName, aggregateId, projected);
      log.debug(
        `Applied aggregate projection for event timestamp ${timestamp}`,
      );
    } else {
      log.debug(
        `No aggregate projection for type in event ${JSON.stringify(event)}`,
      );
    }

    if (!inReplay && timestamp < lastProjectedEventTimestamp)
      log.debug(
        `Noticing event out of sequence (lastPET=${lastProjectedEventTimestamp}, ts=${timestamp}): ${JSON.stringify(
          event,
        )}`,
      );

    lastProjectedEventTimestamp = timestamp;

    return event;
  };

  const startReplay = () => {
    initLogger.debug('Starting replay state for aggregate store');
    inReplay = true;
  };

  const endReplay = () => {
    initLogger.debug('Ending replay state for aggregate store');
    inReplay = false;
  };
  return {
    getAggregateState,
    applyAggregateProjection,
    startReplay,
    endReplay,
  };
};
