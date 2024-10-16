import { readable } from 'svelte/store';
import io from 'socket.io-client';

const applyChange = (data, changeInfo) => {
	switch (changeInfo.changeKind) {
		case 'addRow':
			return data.concat(changeInfo.details);

		case 'updateRow':
			return data.map((row) =>
				row.id === changeInfo.details.id ? { ...row, ...changeInfo.details } : row
			);

		case 'deleteRow':
			return data.filter((row) => row.id !== changeInfo.details.id);

		default:
			return data;
	}
};

const wrapData = (data, needsReload = false) => ({
	data,
	loaded: !!data,
	isEmpty: data && data.length === 0,
	singleItem: data?.length === 1 ? data[0] : undefined,
	needsReload
});

export const readModelStore = (
	items,
	endpointName,
	socketIoEndpoint,
	readModelName,
	resolverName,
	correlationId
) => {
	let innerItems = items;
	const store = readable(wrapData(items), (set) => {
		if (socketIoEndpoint) {
			const query = {};
			if (correlationId) {
				query.correlationId = correlationId;
			}
			const socket = io(socketIoEndpoint, {
				query
			});
			socket.on('connect', () => {
				socket.emit('register', [{ endpointName, readModelName, resolverName }]);
			});
			socket.on('change', (changeInfo) => {
				if (changeInfo.changeKind === 'all') {
					set(wrapData(innerItems, true));
				} else {
					innerItems = applyChange(innerItems, changeInfo);
					set(wrapData(innerItems));
				}
			});
		}
	});
	return store;
};
