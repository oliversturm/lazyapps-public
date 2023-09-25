import { start } from '@lazyapps/bootstrap';
import { express } from '@lazyapps/change-notifier-socket-io';

start({
  changeNotifier: {
    listener: express({ port: process.env.EXPRESS_PORT || 3008 }),
  },
});
