export const query =
	(fetch) =>
	(endpoint, readModelName, resolverName, params = {}) => {
		const url = `${endpoint}/query/${readModelName}/${resolverName}`;
		return fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(params)
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error(`Fetch error: ${res.status}/${res.statusText}`);
				}
				return res;
			})
			.then((res) => res.json())
			.catch((err) => {
				console.error(`Can't query ${url} with params ${JSON.stringify(params)}: ${err}`);
			});
	};
