import { getLogger } from '@lazyapps/logger';
import { channelWithExchange } from '../channelWithExchange.js';

export const rabbitMq = (config) => () => {
  const defaultConfig = {
    url: 'amqp://localhost',
    socketOptions: {},
    exchange: 'events',
    topic: 'events',
  };
  const actualConfig = { ...defaultConfig, ...config };
  const { exchange, topic } = actualConfig;

  const initLog = getLogger('CP/EB/Rabbit', 'INIT');

  return channelWithExchange(actualConfig, initLog).then(({ channel }) => {
    initLog.info(`Event bus connected to Rabbit MQ exchange "${exchange}"`);
    return {
      publishEvent: (correlationId) => (event) => {
        const log = getLogger('CmdProc/EB/Rabbit', correlationId);
        log.debug(`Publishing event timestamp ${event.timestamp}`);
        channel.publish(
          exchange,
          topic,
          Buffer.from(JSON.stringify({ correlationId, event })),
        );
        return event;
      },
      publishReplayState: (correlationId) => (state) => {
        const log = getLogger('CmdProc/EB/Rabbit', correlationId);
        log.debug(`Publishing replay state ${state}`);
        channel.publish(
          exchange,
          '__system',
          Buffer.from(
            JSON.stringify({
              correlationId,
              event: { type: 'SET_REPLAY_STATE', state },
            }),
          ),
        );
        return state;
      },
    };
  });
};
