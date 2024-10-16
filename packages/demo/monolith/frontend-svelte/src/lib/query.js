import { nanoid } from 'nanoid';
import { getLogger } from '@lazyapps/logger';
import { getPublishedMqEmitter } from '@lazyapps/mqemitter';

export const query = (correlationId, readModelName, resolverName, params = {}) => {
	// create unique id for this query using nanoid
	const queryId = nanoid();
	const log = getLogger('Svelte/QRY', correlationId);

	return Promise.resolve(getPublishedMqEmitter(correlationId, process.env.MQ_QUERIES_PORT)).then(
		(mq) => {
			const replyTopic = `queryResult/${queryId}`;
			log.debug(`Querying ${readModelName}/${resolverName} (reply ${replyTopic})`);
			mq.emit({
				topic: 'query',
				payload: {
					correlationId,
					readModelName,
					resolverName,
					args: params,
					replyTopic
				}
			});

			log.debug(
				`Query sent for ${readModelName}/${resolverName} (reply ${replyTopic}) with args ${JSON.stringify(
					params
				)}`
			);

			return new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error(`[${correlationId}] Query timed out`));
				}, 10000);

				const handler = ({ payload }, cb) => {
					// The logger with the correct correlationId is already
					// here from the existing context. But the result
					// carries another correlationId sent back by the server.
					// They should be the same.
					log.debug(
						`Query result received for ${readModelName}/${resolverName} (reply ${replyTopic})`
					);
					if (payload.correlationId !== correlationId) {
						log.error(
							`Query result received with mismatched correlationId: ${payload.correlationId}`
						);
					}
					clearTimeout(timeout);
					mq.removeListener(replyTopic, handler);

					resolve(payload.result);
					cb();
				};

				mq.on(replyTopic, handler);
			}).catch((err) => {
				log.error(
					`An error occurred receiving query result for ${readModelName}/${resolverName} (reply ${replyTopic}): ${err}`
				);
				throw err; // see about this later
			});
		}
	);
};
