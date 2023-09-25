import fs from 'fs';
import { express } from '@lazyapps/express/command-receiver/index.js';
import { inmemory } from '@lazyapps/aggregatestore-inmemory';
import { mongodb } from '@lazyapps/eventstore-mongodb';
import { mqEmitterRedis } from '@lazyapps/eventbus-mqemitter-redis/command-receiver/index.js';
import { start } from '@lazyapps/bootstrap';
import * as aggregates from './aggregates/index.js';

const readSecretFiles = (names) =>
  names.map((name) => fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim());

const [jwtSecret] = readSecretFiles(['jwt-secret']);

start({
  commands: {
    receiver: express({
      port: process.env.EXPRESS_PORT || 3001,
      jwtSecret,
      authCookieName: 'access_token',
      // Must allow unauthenticated requests for the public UI users
      credentialsRequired: false,
    }),
    aggregateStore: inmemory(),
    eventStore: mongodb({
      url: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
      database: process.env.MONGO_DATABASE || 'events',
    }),
    eventBus: mqEmitterRedis({ host: process.env.REDIS_HOST || '127.0.0.1' }),
    aggregates,
  },
});
