<script>
	import dayjs from 'dayjs';
	import { invalidateAll } from '$app/navigation';

	import { readModelStore } from '$lib/readModelStore.js';

	const endpointName = 'rm-data-maintenance';
	const socketIoEndpoint = import.meta.env.VITE_CHANGE_NOTIFIER_URL;

	export let data;
	$: store = readModelStore(
		data.items,
		endpointName,
		socketIoEndpoint,
		'gameSessionsOverview',
		'all'
	);
	$: {
		if ($store.needsReload) {
			// this happens if a live change comes to the
			// store that indicates a complete reload
			// is necessary
			invalidateAll();
		}
	}
</script>

{#if $store.isEmpty}
	<div>Loading...</div>
{:else}
	<table class="admintable">
		<thead>
			<tr>
				<th class="text-left">ID</th>
				<th class="text-left">Game ID</th>
				<th class="text-left">Name</th>
				<th class="text-left">Timestamp</th>
				<th class="text-left">Active</th>
				<th class="text-left">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each $store.data as row}
				<tr>
					<td class="text-left">{row.id}</td>
					<td class="text-left">{row.gameId}</td>
					<td class="text-left">{row.name}</td>
					<td class="text-left">{dayjs(row.timestamp).format('YYYY-MM-DD HH:mm:ss')}</td>
					<td class="text-left">{row.active}</td>
					<td class="text-left"><a href="/protected/ingame/{row.id}/live">Live View</a></td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
