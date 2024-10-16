import { getLogger } from '@lazyapps/logger';
import { channelWithExchange } from '../channelWithExchange.js';

export const rabbitMq = (config) => (context) => {
  let inReplay = false;

  const handleSysMessage = (msg) => {
    switch (msg.type) {
      case 'SET_REPLAY_STATE':
        inReplay = msg.state;
        break;
    }
  };

  const defaultConfig = {
    url: 'amqp://localhost',
    socketOptions: {},
    exchange: 'events',
    pattern: '#',
  };
  const actualConfig = { ...defaultConfig, ...config };
  const { exchange, pattern } = actualConfig;

  const initLog = getLogger('RM/EB/Rabbit', 'INIT');

  return channelWithExchange(actualConfig, initLog)
    .then(({ channel }) =>
      channel.assertQueue('', { exclusive: true }).then((q) =>
        channel
          .bindQueue(q.queue, exchange, pattern)
          .then(() => channel.bindQueue(q.queue, exchange, '__system'))
          .then(() => {
            initLog.info(
              `Event bus connected to Rabbit MQ exchange "${exchange}" with pattern "${pattern}"`,
            );
            return channel.consume(
              q.queue,
              (msg) => {
                if (msg.fields.routingKey.startsWith('__system')) {
                  const { correlationId, event } = JSON.parse(
                    msg.content.toString(),
                  );
                  const log = getLogger('RM/EB/Rabbit', correlationId);
                  log.debug(
                    `Received '__system' event: ${JSON.stringify(event)}`,
                  );

                  handleSysMessage(event);
                } else {
                  // must assume that this message
                  // was caught due to the pattern
                  // passed from the outside
                  const { correlationId, event } = JSON.parse(
                    msg.content.toString(),
                  );
                  const log = getLogger('RM/EB/Rabbit', correlationId);
                  log.debug(
                    `Received message on topic '${
                      msg.fields.routingKey
                    }': ${JSON.stringify(event)}`,
                  );
                  context.projectionHandler.projectEvent(correlationId)(
                    event,
                    inReplay,
                  );
                }
              },
              { noAck: true },
            );
          }),
      ),
    )
    .catch((err) => {
      initLog.error(`Failed to bind queue to Rabbit MQ exchange: ${err}`);
    });
};
