import { query } from '$lib/query.js';
import { nanoid } from 'nanoid';

export async function load() {
	const correlationId = `SVLT-${nanoid()}`;

	return {
		// pass through the correlation id, in case the page
		// wants to use it when logging a result or similar
		correlationId,
		// top level, await the promise
		items: await query(correlationId, 'customersOverview', 'all')
	};
}
