import { MongoClient } from 'mongodb';
import pRetry from 'p-retry';

import { getLogger } from '@lazyapps/logger';

const wrapCalls = (correlationId, dbContext, names) => {
  const log = getLogger('RM/MongoAPI', correlationId);
  return names.reduce(
    (r, v) => ({
      ...r,
      [v]: (collection, ...args) => {
        log.debug(`Calling ${v}(${JSON.stringify(args)}) on ${collection}`);
        return dbContext.db.collection(collection)[v](...args);
      },
    }),
    {},
  );
};

export const mongodb =
  ({ url, user, pwd, scheme, host, urlPath, database = 'readmodel' } = {}) =>
  () => {
    const connectUrl = url
      ? url
      : user && pwd && scheme && host
      ? (url = `${scheme}://${user}:${pwd}@${host}/${urlPath}`)
      : 'mongodb://127.0.0.1:27017';

    const logLocation = user ? host : connectUrl;

    const initLog = getLogger('RM/Mongo', 'INIT');

    return pRetry(
      () =>
        MongoClient.connect(connectUrl, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
      {
        onFailedAttempt: (error) => {
          initLog.error(
            `Attempt ${error.attemptNumber} failed connecting to MongoDB at ${logLocation}: '${error}'. Will retry another ${error.retriesLeft} times.`,
          );
        },
        retries: 10,
      },
    )
      .catch((err) => {
        initLog.error(`Can't connect to MongoDB at ${logLocation}: ${err}`);
      })
      .then((client) => ({ client, db: client.db(database) }))
      .then((dbcontext) => {
        initLog.info(
          `MongoDB connected to url=${logLocation} and database=${database}`,
        );
        return dbcontext;
      })
      .then((dbContext) => ({
        perRequest: (correlationId) => ({
          ...wrapCalls(correlationId, dbContext, [
            'insertOne',
            'insertMany',
            'updateOne',
            'updateMany',
            'deleteOne',
            'deleteMany',
            'findOneAndUpdate',
            'findOneAndDelete',
            'findOneAndReplace',
            'bulkWrite',
            'find',
            'countDocuments',
          ]),
        }),
        close: () => dbContext.client.close(),
        updateLastProjectedEventTimestamps: (
          correlationId,
          rmNames,
          timestamp,
        ) =>
          rmNames.length
            ? dbContext.db
                .collection('readmodel.state')
                // Can't use updateMany here, because it only ever upserts
                // one document even if multiple are matched using e.g. $in
                .bulkWrite(
                  rmNames.map((rmName) => ({
                    updateOne: {
                      filter: { name: rmName },
                      update: {
                        $set: { lastProjectedEventTimestamp: timestamp },
                      },
                      upsert: true,
                    },
                  })),
                )
                .then((r) => {
                  const log = getLogger('RM/Mongo', correlationId);
                  log.debug(
                    `Updated last projected event timestamps for ${JSON.stringify(
                      rmNames,
                    )}. Matched ${r.matchedCount}, upserted ${
                      r.upsertedCount
                    }.`,
                  );
                })
            : Promise.resolve(),
        readLastProjectedEventTimestamps: (readModels) =>
          Promise.all(
            Object.keys(readModels).map((rmName) =>
              dbContext.db
                .collection('readmodel.state')
                .find({ name: rmName }, { lastProjectedEventTimestamp: 1 })
                .toArray()
                .then((result) => {
                  if (result && result.length === 1)
                    readModels[rmName].lastProjectedEventTimestamp =
                      result[0].lastProjectedEventTimestamp;
                }),
            ),
          ),
      }));
  };
