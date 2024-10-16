import { nanoid } from 'nanoid';

const commandEndpoint = import.meta.env.VITE_COMMAND_URL || 'http://127.0.0.1:3001/api/command';

// Same code as React
const _postCommand = (endpoint, content) => {
	const correlationId = `SVLT-${nanoid()}`;
	content.correlationId = correlationId;
	return fetch(endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(content)
	})
		.then((res) => {
			if (!res.ok) {
				throw new Error(`Fetch error: ${res.status}/${res.statusText}`);
			}
			return res;
		})
		.catch((err) => {
			console.error(
				`Can't post command to ${endpoint} with content ${JSON.stringify(content)}: ${err}`
			);
		});
};

export const postCommand = (content) => _postCommand(commandEndpoint, content);
