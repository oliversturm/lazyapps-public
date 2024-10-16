import { query } from '$lib/query.js';
import { postCommand } from '$lib/commands.js';
import { nanoid } from 'nanoid';

export async function load() {
	const correlationId = `SVLT-${nanoid()}`;
	return {
		correlationId,
		items: await query(correlationId, 'ordersConfirmationRequests', 'all')
	};
}

export const actions = {
	confirm: async (event) => {
		const formData = Object.fromEntries(await event.request.formData());
		await postCommand({
			// new id, new process
			correlationId: `SVLT-${nanoid()}`,
			aggregateName: 'order',
			aggregateId: formData.orderId,
			command: 'CONFIRM',
			payload: {}
		});
	}
};
