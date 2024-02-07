import { MongoClient } from 'mongodb';
import pRetry from 'p-retry';

import { getLogger } from '@lazyapps/logger';

const log = getLogger('CmdProc/ES');

const replay = (dbContext) => (cmdProcContext) =>
  Promise.all([
    cmdProcContext.aggregateStore.startReplay(),
    cmdProcContext.eventBus.publishReplayState(true)
  ])
    .then(() =>
      dbContext.collection
        .find({}, { sort: { timestamp: 1 } })
        .forEach((event) => {
          if (event) {
            return Promise.all([
              cmdProcContext.aggregateStore.applyAggregateProjection(event)
              // Implementation of event replay concept in these samples is currently
              // incomplete, so don't do it.
              // cmdProcContext.eventBus.publishEvent(event),
            ]);
          } else return false;
        })
    )
    .then(() =>
      Promise.all([
        cmdProcContext.aggregateStore.endReplay(),
        cmdProcContext.eventBus.publishReplayState(false)
      ])
    );

export const mongodb =
  ({
     url,
     user,
     pwd,
     scheme,
     host,
     urlPath,
     database = 'events',
     collection = 'events'
   } = {}) =>
    () => {
      const connectUrl = url
        ? url
        : user && pwd && scheme && host
          ? (url = `${scheme}://${user}:${pwd}@${host}/${urlPath}`)
          : 'mongodb://127.0.0.1:27017';

      // Keep location separate for logging, so that the password
      // doesn't get into the log.
      const logLocation = user ? host : connectUrl;

      return pRetry(
        () =>
          MongoClient.connect(connectUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }),
        {
          onFailedAttempt: (error) => {
            log.error(
              `Attempt ${error.attemptNumber} failed connecting to MongoDB at ${logLocation}: '${error}'. Will retry another ${error.retriesLeft} times.`
            );
          },
          retries: 10
        }
      )
        .catch((err) => {
          log.error(`Can't connect to MongoDB at ${logLocation}: ${err}`);
        })
        .then((client) => ({ client, db: client.db(database) }))
        .then((dbContext) => ({
          ...dbContext,
          collection: dbContext.db.collection(collection)
        }))
        .then((dbContext) => ({
          addEvent: (event) =>
            dbContext.collection
              .insertOne(event)
              .catch((err) => {
                log.error(`Can't insert event ${event}: ${err}`);
              })
              .then(() => {
                // Questionable mongodb behavior: insertOne mutates
                // the source object to add the mongodb _id property.
                // We want to publish the event object later, so
                // mongodb artefacts are not wanted here.
                delete event._id;
                return event;
              }),
          close: () => dbContext.client.close(),
          replay: replay(dbContext)
        }));
    };
