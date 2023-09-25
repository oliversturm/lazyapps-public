import { getLogger } from '@lazyapps/logger';

const log = getLogger('RM/Query');

export const createApiHandler =
  (context) =>
  (readModelName, readModel, resolverName, resolver) =>
  (req, res) => {
    log.debug(
      `Query received for ${readModelName}/${resolverName} with args ${JSON.stringify(
        req.body,
      )}`,
    );
    return Promise.resolve(resolver(context.storage, req.body, req.auth))
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
