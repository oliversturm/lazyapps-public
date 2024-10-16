import { getPublishedMqEmitter } from '@lazyapps/mqemitter';
import { getLogger } from '@lazyapps/logger';
import { nanoid } from 'nanoid';

export const postCommand = (content) => {
	const correlationId = `SVLT-${nanoid()}`;
	content.correlationId = correlationId;
	const log = getLogger('Svelte/CMND', correlationId);
	return Promise.resolve(getPublishedMqEmitter(correlationId, process.env.MQ_COMMANDS_PORT))
		.then((mq) => {
			mq.emit({
				topic: 'command',
				payload: content
			});
			log.debug(`Command posted with content ${JSON.stringify(content)}`);
		})
		.catch((err) => {
			console.error(
				`[${correlationId}] An error occurred posting command with content ${JSON.stringify(
					content
				)}: ${err}`
			);
		});
};
