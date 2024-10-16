import { getLogger } from '@lazyapps/logger';

export const createApiHandler =
  ({ aggregateStore, eventStore, eventBus, aggregates, handleCommand }) =>
  (req, res) => {
    // Record timestamp as early as possible
    const reqTimestamp = Date.now();

    const { command, aggregateName, aggregateId, payload, correlationId } =
      req.body;
    const log = getLogger('EX/CP/Handler', correlationId);
    log.debug(
      `Command received: ${JSON.stringify({
        command,
        aggregateName,
        aggregateId,
        payload,
      })}`,
    );
    const auth = req.auth;
    if (!command || !aggregateName || !aggregateId) {
      res.status(400).send('Missing field');
      return;
    }

    const aggregate = aggregates[aggregateName];
    if (!aggregate) {
      res.status(400).send('Invalid aggregate name');
      return;
    }

    const commandHandler = aggregate.commands && aggregate.commands[command];
    if (!commandHandler) {
      res.status(400).send('Invalid command name');
      return;
    }

    return handleCommand(
      aggregateStore,
      eventStore,
      eventBus,
      command,
      aggregateName,
      aggregateId,
      payload,
      commandHandler,
      auth,
      reqTimestamp,
      correlationId,
    )
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          log.error(`Validation error while handling command ${command} for aggregate ${aggregateName}(${aggregateId}) with payload:

          ${JSON.stringify(payload)}
                
          ${err}`);
          res.sendStatus(400);
        } else if (err.name === 'AuthorizationError') {
          log.error(`Unauthorized while handling command ${command} for aggregate ${aggregateName}(${aggregateId}) with payload:

          ${JSON.stringify(payload)}
                
          ${err}`);
          res.sendStatus(403);
        } else {
          log.error(`Unknown error handling command ${command} for aggregate ${aggregateName}(${aggregateId}) with payload:

${JSON.stringify(payload)}
      
${err}`);
          res.sendStatus(500);
        }
      });
  };
