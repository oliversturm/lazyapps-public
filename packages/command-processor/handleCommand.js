import { getLogger } from '@lazyapps/logger';

const log = getLogger('CP/Handler');

// We can receive an external timestamp, in case that gives
// better accuracy. If we don't receive one here, we'll
// record our own as soon as we can.
export const handleCommand = (
  aggregateStore,
  eventStore,
  eventBus,
  command,
  aggregateName,
  aggregateId,
  payload,
  commandHandler,
  auth,
  timestamp = null,
) =>
  Promise.resolve(timestamp || Date.now()).then((timestamp) =>
    Promise.resolve(
      aggregateStore.getAggregateState(aggregateName, aggregateId),
    )
      .then((aggregateState) => commandHandler(aggregateState, payload, auth))
      .then((eventMixin) => {
        if (!eventMixin.type)
          throw new Error(
            `Event created for command ${command} on aggregate ${aggregateName}(${aggregateId}) has no 'type'`,
          );
        const event = {
          ...eventMixin,
          timestamp,
          aggregateName,
          aggregateId,
        };
        log.debug(`Event generated: ${JSON.stringify(event)}`);
        return event;
      })
      .then(eventStore.addEvent)
      .then(aggregateStore.applyAggregateProjection)
      .then(eventBus.publishEvent),
  );
