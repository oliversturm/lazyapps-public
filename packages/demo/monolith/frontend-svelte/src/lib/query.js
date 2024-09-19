import { nanoid } from 'nanoid';
import { getLogger } from '@lazyapps/logger';
import { getPublishedMqEmitter } from '@lazyapps/mqemitter';

const log = getLogger('Svelte/QRY');

export const query = (readModelName, resolverName, params = {}) => {
	// create unique id for this query using nanoid
	const queryId = nanoid();

	return Promise.resolve(getPublishedMqEmitter(process.env.MQ_QUERIES_PORT)).then((mq) => {
		const replyTopic = `queryResult/${queryId}`;
		log.debug(`Querying ${readModelName}/${resolverName} (reply ${replyTopic})`);
		mq.emit({
			topic: 'query',
			payload: {
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
				reject(new Error('Query timed out'));
			}, 10000);

			const handler = ({ payload }, cb) => {
				log.debug(
					`Query result received for ${readModelName}/${resolverName} (reply ${replyTopic})`
				);
				clearTimeout(timeout);
				mq.removeListener(replyTopic, handler);

				resolve(payload);
				cb();
			};

			mq.on(replyTopic, handler);
		}).catch((err) => {
			log.error(
				`An error occurred receiving query result for ${readModelName}/${resolverName} (reply ${replyTopic}): ${err}`
			);
			throw err; // see about this later
		});
	});
};
