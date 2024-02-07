import { getLogger } from '@lazyapps/logger';
import { channelWithExchange } from '../channelWithExchange.js';

const log = getLogger('CP/EB');

export const rabbitMq = (config) => () => {
  const defaultConfig = {
    url: 'amqp://localhost',
    socketOptions: {},
    exchange: 'events',
    topic: 'events',
  };
  const actualConfig = { ...defaultConfig, ...config };
  const { exchange, topic } = actualConfig;

  return channelWithExchange(actualConfig, log).then(({ channel }) => {
    log.info(`Event bus connected to Rabbit MQ exchange "${exchange}"`);
    return {
      publishEvent: (event) => {
        log.debug(`Publishing event timestamp ${event.timestamp}`);
        channel.publish(exchange, topic, Buffer.from(JSON.stringify(event)));
        return event;
      },
      publishReplayState: (state) => {
        log.debug(`Publishing replay state ${state}`);
        channel.publish(
          exchange,
          '__system',
          Buffer.from(JSON.stringify({ type: 'SET_REPLAY_STATE', state })),
        );
        return state;
      },
    };
  });
};
