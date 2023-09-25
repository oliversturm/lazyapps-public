<script>
	import dayjs from 'dayjs';
	import { postCommand } from '$lib/commands.js';

	export let gameSessionId;
	export let gameName;
	export let timestamp;
	export let name;

	const startGame = () => {
		postCommand({
			aggregateName: 'gameSession',
			aggregateId: gameSessionId,
			command: 'START_FFF_REGISTRATION',
			payload: {}
		});
	};
</script>

<h1>{gameName}</h1>
<div class="public-large">{dayjs(timestamp).format('MMMM D, YYYY')}</div>
<div class="public-large">{name}</div>

<button class="control mt-6" on:click={startGame}>Start Game</button>
