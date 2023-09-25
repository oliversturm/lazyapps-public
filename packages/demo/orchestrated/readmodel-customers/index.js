import { express } from '@lazyapps/express/readmodels/index.js';
import { mongodb } from '@lazyapps/readmodelstorage-mongodb';
import { mqEmitterRedis } from '@lazyapps/eventbus-mqemitter-redis/readmodels/index.js';
import { changeNotificationSenderFetch } from '@lazyapps/change-notification-sender-fetch';
import { start } from '@lazyapps/bootstrap';
import * as readModels from './readmodels/index.js';
import { commandSenderFetch } from '@lazyapps/command-sender-fetch';

start({
  readModels: {
    listener: express({ port: process.env.EXPRESS_PORT || 3003 }),
    storage: mongodb({
      url: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
      database: process.env.MONGO_DATABASE || 'readmodel-customers',
    }),
    eventBus: mqEmitterRedis({ host: process.env.REDIS_HOST || '127.0.0.1' }),
    changeNotificationSender: changeNotificationSenderFetch({
      url:
        process.env.CHANGENOTIFICATION_FETCH_URL ||
        'http://localhost:3008/change',
    }),
    commandSender: commandSenderFetch({ url: process.env.COMMAND_URL }),
    readModels,
  },
});
