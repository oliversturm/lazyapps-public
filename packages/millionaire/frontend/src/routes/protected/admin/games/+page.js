import { query } from '$lib/query.js';

const readModelEndpoint = import.meta.env.VITE_RM_DATA_MAINTENANCE_URL;

export function load({ fetch }) {
	return {
		items: query(fetch)(readModelEndpoint, 'gamesOverview', 'all')
	};
}
