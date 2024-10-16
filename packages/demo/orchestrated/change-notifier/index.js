import { start } from '@lazyapps/bootstrap';
import { express } from '@lazyapps/change-notifier-socket-io';

start({
  correlation: {
    serviceId: 'CHNG',
  },
  changeNotifier: {
    listener: express({ port: process.env.EXPRESS_PORT || 3008 }),
  },
});
