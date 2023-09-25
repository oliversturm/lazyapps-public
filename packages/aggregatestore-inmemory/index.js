import { getLogger } from '@lazyapps/logger';

const log = getLogger('CmdProc/AS');

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

  const applyAggregateProjection = (event) => {
    const { aggregateName, aggregateId, type, timestamp } = event;
    const projection =
      aggregates[aggregateName].projections &&
      aggregates[aggregateName].projections[type];
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
    log.debug('Starting replay state for aggregate store');
    inReplay = true;
  };

  const endReplay = () => {
    log.debug('Ending replay state for aggregate store');
    inReplay = false;
  };
  return {
    getAggregateState,
    applyAggregateProjection,
    startReplay,
    endReplay,
  };
};
