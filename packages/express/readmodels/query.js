import { getLogger } from '@lazyapps/logger';

export const createApiHandler =
  (context) =>
  (readModelName, readModel, resolverName, resolver) =>
  (req, res) => {
    const log = getLogger('RM/Query', req.body.correlationId);

    log.debug(
      `Query received for ${readModelName}/${resolverName} with args ${JSON.stringify(
        req.body,
      )}`,
    );
    return Promise.resolve(
      resolver(
        context.storage.perRequest(req.body.correlationId),
        req.body,
        req.auth,
        req.body.correlationId,
      ),
    )
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        log.error(
          `An error occurred handling query for ${readModelName}/${resolverName} with args ${JSON.stringify(
            req.body,
          )}: ${err}`,
        );
        res.sendStatus(500);
      });
  };
