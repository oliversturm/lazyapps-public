import { express } from '@lazyapps/express/command-receiver/index.js';
import { inmemory } from '@lazyapps/aggregatestore-inmemory';
import { mongodb } from '@lazyapps/eventstore-mongodb';
import { mqEmitterRedis } from '@lazyapps/eventbus-mqemitter-redis/command-receiver/index.js';
import { start } from '@lazyapps/bootstrap';
import * as aggregates from './aggregates/index.js';

start({
  commands: {
    receiver: express({ port: process.env.EXPRESS_PORT || 3001 }),
    aggregateStore: inmemory(),
    eventStore: mongodb({
      url: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
    }),
    eventBus: mqEmitterRedis({ host: process.env.REDIS_HOST || '127.0.0.1' }),
    aggregates,
  },
});
