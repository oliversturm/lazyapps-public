import { getLogger } from '@lazyapps/logger';

export const adminHandler = (context) => (req, res) => {
  const { correlationId } = req.body;
  const log = getLogger('EX/CP/AdHandler', correlationId);

  const { command } = req.params;
  const handler = context.handleAdminCommand;
  if (!handler) {
    log.error(`Invalid admin command ${command}`);
    res.sendStatus(400).send('Invalid admin command');
    return;
  }

  log.debug(
    `Admin command ${command} with params ${JSON.stringify(req.body.params)}`,
  );
  return handler(
    context,
    command,
    req.body.params,
    req.auth,
    req.body.correlationId,
  )
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      res.sendStatus(500).send(err);
    });
};
