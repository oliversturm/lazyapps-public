import { query } from '$lib/query.js';

const readModelEndpoint = import.meta.env.VITE_RM_INGAME_URL;

export function load({ fetch, params }) {
	return {
		gameSessionId: params.gameSessionId,
		items: query(fetch)(readModelEndpoint, 'gameSessions', 'byGameSessionId', {
			gameSessionId: params.gameSessionId
		})
	};
}
