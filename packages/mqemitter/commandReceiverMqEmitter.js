import { getLogger } from '@lazyapps/logger';
import { getSharedMqEmitter } from './mqEmitterRegistry.js';

const log = getLogger('CR/MQ');

export const commandReceiverMqEmitter =
  ({ mqName }) =>
  ({ aggregateStore, eventStore, eventBus, aggregates, handleCommand }) => {
    return Promise.resolve(getSharedMqEmitter(mqName))
      .then((mq) => {
        mq.on('command', ({ payload: messagePayload }, cb) => {
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
              commandHandler /*, auth, timestamp */,
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
        log.debug('Command receiver active');
      });
  };
