import { getLogger } from '@lazyapps/logger';
import { getSharedMqEmitter } from './mqEmitterRegistry.js';
import { nanoid } from 'nanoid';

// The terminology is not optimal here. In the case of other
// transports, for instance the project eventbus-rabbitmq,
// there are "command-receiver" implementations which apply
// to the command receiver component of the architecture in that
// they allow that received to send events to the event bus.
// For this mqemitter implementation, the command receiver
// is the component that receives commands and handles them --
// in the case of rabbit etc such an implementation does not
// currently exist, so the inconsistency has existed for a while.
// For mqemitter, the publishEvent stuff is in the
// commandProcessorEventBusMqEmitter.js file.
//
export const commandReceiverMqEmitter =
  ({ mqName }) =>
  ({
    aggregateStore,
    eventStore,
    eventBus,
    aggregates,
    handleCommand,
    correlationConfig,
  }) => {
    const initLog = getLogger('CR/MQ', 'INIT');

    return Promise.resolve(getSharedMqEmitter('INIT', mqName))
      .then((mq) => {
        mq.on('command', ({ payload: messagePayload }, cb) => {
          let { correlationId } = messagePayload;
          if (!correlationId) {
            correlationId = `${
              correlationConfig?.serviceId || 'UNK'
            }-${nanoid()}`;
          }

          const log = getLogger('CR/MQ', correlationId);
          log.debug(`Received command: ${JSON.stringify(messagePayload)}`);
          const { command, aggregateName, aggregateId, payload } =
            messagePayload;
          const aggregate = aggregates[aggregateName];
          const commandHandler =
            aggregate?.commands && aggregate.commands[command];
          // Minimal input tests here -- this receiver
          // will be used in-process, not a public
          // endpoint.
          if (commandHandler) {
            handleCommand(
              aggregateStore,
              eventStore,
              eventBus,
              command,
              aggregateName,
              aggregateId,
              payload,
              commandHandler,
              undefined /* auth */,
              undefined /* timestamp */,
              correlationId,
            ).catch((err) => {
              log.error(`An error occurred handling command ${command} for aggregate ${aggregateName}(${aggregateId}) with payload:
    
    ${JSON.stringify(payload)}
          
    ${err}`);
            });
          }
          cb();
        });
      })
      .then(() => {
        initLog.debug('Command receiver active');
      });
  };
