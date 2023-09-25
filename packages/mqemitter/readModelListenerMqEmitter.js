import { getLogger } from '@lazyapps/logger';
import { getSharedMqEmitter } from './mqEmitterRegistry.js';

const log = getLogger('RM/LS');

export const readModelListenerMqEmitter =
  ({ mqName }) =>
  (context) =>
    Promise.resolve(getSharedMqEmitter(mqName))
      .then((mq) => {
        mq.on('query', ({ payload }, cb) => {
          const { readModelName, resolverName, args, replyTopic } = payload;

          log.debug(
            `Query received for ${readModelName}/${resolverName} (reply ${replyTopic}) with args ${JSON.stringify(
              args
            )}`
          );
          const readModel = context.readModels[readModelName];
          if (!readModel) {
            log.error(
              `Read model ${readModelName} not found during query for ${readModelName}/${resolverName} (reply ${replyTopic}) with args ${JSON.stringify(
                args
              )}`
            );
            cb();
            return;
          }
          const resolver = readModel.resolvers[resolverName];
          if (!resolver) {
            log.error(
              `Resolver ${resolverName} not found in read model ${readModelName} during query for ${readModelName}/${resolverName} (reply ${replyTopic}) with args ${JSON.stringify(
                args
              )}`
            );
            cb();
            return;
          }
          // Run the promise, then call cb and return
          // The promise will send the reply
          // asynchronously
          Promise.resolve(resolver(context.storage, args))
            .then((result) => {
              mq.emit({ topic: replyTopic, payload: result });
            })
            .catch((err) => {
              log.error(
                `An error occurred handling query for ${readModelName}/${resolverName} (reply ${replyTopic}) with args ${JSON.stringify(
                  args
                )}: ${err}`
              );
            });

          cb();
        });
      })
      .then((res) => {
        log.debug(`Read model listener active`);
        return res;
      });
