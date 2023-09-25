<script>
	import { mainState } from '$lib/gameSessionStates.js';
	import { postCommand } from '$lib/commands.js';

	export let gameSessionId;
	export let state;
	export let adminUI = false;

	const startFffRound = () => {
		postCommand({
			aggregateName: 'gameSession',
			aggregateId: gameSessionId,
			command: 'START_FFF_ROUND',
			payload: {}
		});
	};
</script>

<div class="mt-16" />
{#if state === mainState.fffWaitForQuestion}
	<div class="public-large">Waiting for question</div>
{:else if state === mainState.fffQuestionSelected}
	<div class="public-large">Question selected! Get Ready!</div>
	{#if adminUI}
		<button class="control" on:click={startFffRound}>Start Round</button>
	{/if}
{/if}
