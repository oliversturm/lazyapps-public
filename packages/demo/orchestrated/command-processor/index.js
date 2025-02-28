import { express } from '@lazyapps/express/command-receiver/index.js';
import { inmemory } from '@lazyapps/aggregatestore-inmemory';
import { mongodb } from '@lazyapps/eventstore-mongodb';
import { rabbitMq } from '@lazyapps/eventbus-rabbitmq/command-receiver/index.js';
import { start } from '@lazyapps/bootstrap';
import * as aggregates from './aggregates/index.js';
import path from 'path';
const commandRecordingConfig = process.env.COMMAND_RECORD_PATH
  ? {
      enabled: true,
      skipAuthCheck: true,
      filePath: path.join(
        process.env.COMMAND_RECORD_PATH,
        `commands-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
      ),
    }
  : null;

start({
  correlation: {
    serviceId: 'CMD',
  },
  commands: {
    receiver: express({ port: process.env.EXPRESS_PORT || 3001 }),
    aggregateStore: inmemory(),
    eventStore: mongodb({
      url: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
    }),
    eventBus: rabbitMq({
      url: process.env.RABBIT_URL || 'amqp://localhost',
      topic: 'events',
    }),
    aggregates,
    commandRecording: commandRecordingConfig,
  },
});
