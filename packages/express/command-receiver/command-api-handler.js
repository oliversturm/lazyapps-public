import { getLogger } from '@lazyapps/logger';

const log = getLogger('EX/CP/Handler');

export const createApiHandler =
  ({ aggregateStore, eventStore, eventBus, aggregates, handleCommand }) =>
  (req, res) => {
    // Record timestamp as early as possible
    const reqTimestamp = Date.now();

    log.debug(`Command received: ${JSON.stringify(req.body)}`);
    const { command, aggregateName, aggregateId, payload } = req.body;
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
