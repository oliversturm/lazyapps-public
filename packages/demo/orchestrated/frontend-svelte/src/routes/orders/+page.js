import { query } from '$lib/query.js';
import { nanoid } from 'nanoid';

// This demo works client-side only. I made that
// decision only because the URLs I'm using through
// traefik are different from the server-side
// ones and I wanted to keep things "simple".
export const ssr = false;

const readModelEndpoint = import.meta.env.VITE_RM_ORDERS_URL || 'http://127.0.0.1:3005'; // orders

export async function load({ fetch }) {
	const correlationId = `SVLT-${nanoid()}`;
	return {
		correlationId,
		items: await query(correlationId, fetch)(readModelEndpoint, 'overview', 'all')
	};
}
