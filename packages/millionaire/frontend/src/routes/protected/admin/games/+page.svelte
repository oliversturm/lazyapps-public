<script>
	import { nanoid } from 'nanoid';
	import { invalidateAll } from '$app/navigation';

	import { readModelStore } from '$lib/readModelStore.js';
	import { postCommand } from '$lib/commands.js';

	const endpointName = 'rm-data-maintenance';
	const socketIoEndpoint = import.meta.env.VITE_CHANGE_NOTIFIER_URL;

	export let data;
	$: store = readModelStore(data.items, endpointName, socketIoEndpoint, 'overview', 'all');
	$: {
		if ($store.needsReload) {
			// this happens if a live change comes to the
			// store that indicates a complete reload
			// is necessary
			invalidateAll();
		}
	}

	const onCreateSession = (gameId) => () => {
		postCommand({
			aggregateName: 'gameSession',
			aggregateId: nanoid(),
			command: 'CREATE_GAME_SESSION',
			payload: {
				gameId,
				name: sessionNames[gameId]
			}
		});
		sessionNames[gameId] = '';
	};
	const sessionNames = {};
</script>

{#if $store.isEmpty}
	<div>Loading...</div>
{:else}
	<table class="admintable">
		<thead>
			<tr>
				<th class="text-left">ID</th>
				<th class="text-left">Name</th>
				<th class="text-right">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each $store.data as row}
				<tr>
					<td class="text-left">{row.id}</td>
					<td class="text-left">{row.name}</td>
					<td class="text-right"
						><input bind:value={sessionNames[row.id]} /><button
							class="ml-2 blue"
							on:click={onCreateSession(row.id)}
							disabled={!sessionNames[row.id]}>Create Session</button
						></td
					>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
