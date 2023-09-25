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
	isEmpty: !data || data.length === 0,
	singleItem: data?.length === 1 ? data[0] : undefined,
	needsReload
});

export const readModelStore = (
	items,
	endpointName,
	socketIoEndpoint,
	readModelName,
	resolverName,
	customChangeHandler = (x) => x
) => {
	let innerItems = items;
	let socket = socketIoEndpoint ? io(socketIoEndpoint) : null;

	const store = readable(wrapData(items), (set) => {
		if (socket) {
			socket.on('connect', () => {
				socket.emit('register', [{ endpointName, readModelName, resolverName }]);
			});
			socket.on('change', (changeInfo) => {
				if (changeInfo.changeKind === 'all') {
					set(wrapData(innerItems, true));
				} else if (['addRow', 'updateRow', 'deleteRow'].includes(changeInfo.changeKind)) {
					innerItems = applyChange(innerItems, changeInfo);
					set(wrapData(innerItems));
				} else {
					const newInnerItems = customChangeHandler(innerItems, changeInfo);
					if (newInnerItems !== innerItems) {
						innerItems = newInnerItems;
						set(wrapData(innerItems));
					}
				}
			});
		}
	});

	store.destroy = () => {
		if (socket) {
			socket.disconnect();
			socket = null;
		}
	};

	return store;
};
