import { query } from '$lib/query.js';
import { postCommand } from '$lib/commands.js';

export function load() {
	return {
		items: query('ordersConfirmationRequests', 'all')
	};
}

export const actions = {
	confirm: async (event) => {
		const formData = Object.fromEntries(await event.request.formData());
		console.log('confirming with formData', formData);
		await postCommand({
			aggregateName: 'order',
			aggregateId: formData.orderId,
			command: 'CONFIRM',
			payload: {}
		});
	}
};
