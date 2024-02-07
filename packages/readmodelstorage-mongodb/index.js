import { MongoClient } from 'mongodb';
import pRetry from 'p-retry';

import { getLogger } from '@lazyapps/logger';

const log = getLogger('RM/Store');

const wrapCalls = (dbContext, names) =>
  names.reduce(
    (r, v) => ({
      ...r,
      [v]: (collection, ...args) =>
        dbContext.db.collection(collection)[v](...args),
    }),
    {},
  );

export const mongodb =
  ({ url, user, pwd, scheme, host, urlPath, database = 'readmodel' } = {}) =>
  () => {
    const connectUrl = url
      ? url
      : user && pwd && scheme && host
      ? (url = `${scheme}://${user}:${pwd}@${host}/${urlPath}`)
      : 'mongodb://127.0.0.1:27017';

    const logLocation = user ? host : connectUrl;

    return pRetry(
      () =>
        MongoClient.connect(connectUrl, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
      {
        onFailedAttempt: (error) => {
          log.error(
            `Attempt ${error.attemptNumber} failed connecting to MongoDB at ${logLocation}: '${error}'. Will retry another ${error.retriesLeft} times.`,
          );
        },
        retries: 10,
      },
    )
      .catch((err) => {
        log.error(`Can't connect to MongoDB at ${logLocation}: ${err}`);
      })
      .then((client) => ({ client, db: client.db(database) }))
      .then((dbContext) => ({
        close: () => dbContext.client.close(),
        updateLastProjectedEventTimestamps: (rmNames, timestamp) =>
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
        ...wrapCalls(dbContext, [
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
      }));
  };
