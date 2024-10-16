import { query } from '$lib/query.js';
import { nanoid } from 'nanoid';

export async function load() {
	const correlationId = `SVLT-${nanoid()}`;
	return {
		correlationId,
		items: await query(correlationId, 'ordersOverview', 'all')
	};
}
