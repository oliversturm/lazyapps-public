<script>
	import { onMount } from 'svelte';
	import { nanoid } from 'nanoid';

	import { invalidateAll } from '$app/navigation';

	import { readModelStore } from '$lib/readModelStore.js';
	import { postCommand } from '$lib/commands.js';

	import { mainState } from '$lib/gameSessionStates.js';
	import FffWaitForQuestionView from '$lib/FffWaitForQuestionView.svelte';
	import FffQuestionDisplayViewPublicUI from '$lib/FffQuestionDisplayViewPublicUI.svelte';
	import FffResultsView from '$lib/FffResultsView.svelte';

	const endpointName = 'rm-ingame';
	const socketIoEndpoint = import.meta.env.VITE_CHANGE_NOTIFIER_URL;

	export let data;
	$: store = readModelStore(
		data.items,
		endpointName,
		socketIoEndpoint,
		'publicUI',
		'byGameSessionId'
	);
	$: {
		if ($store.needsReload) {
			// this happens if a live change comes to the
			// store that indicates a complete reload
			// is necessary
			invalidateAll();
		}
	}

	let fffPlayerInfo;
	onMount(() => {
		fffPlayerInfo = JSON.parse(window.localStorage.getItem('fffPlayerInfo'));
		if (fffPlayerInfo && fffPlayerInfo.gameSessionId !== data.gameSessionId) {
			fffPlayerInfo = null;
		}
	});

	const reset = () => {
		window.localStorage.removeItem('fffPlayerInfo');
		fffPlayerInfo = null;
	};

	let viewName;
	let realName;

	const register = () => {
		fffPlayerInfo = {
			playerId: nanoid(),
			gameSessionId: data.gameSessionId,
			viewName,
			realName
		};
		postCommand({
			aggregateName: 'gameSession',
			aggregateId: data.gameSessionId,
			command: 'REGISTER_FFF_PLAYER',
			payload: fffPlayerInfo
		});
		window.localStorage.setItem('fffPlayerInfo', JSON.stringify(fffPlayerInfo));
	};

	const registerSubmittedAnswer = ({ detail }) => {
		if (fffPlayerInfo) {
			const oldSubmittedAnswers = fffPlayerInfo.submittedAnswers || {};
			const newSubmittedAnswers = {
				...oldSubmittedAnswers,
				[detail.questionId]: detail.answer
			};
			fffPlayerInfo = {
				...fffPlayerInfo,
				submittedAnswers: newSubmittedAnswers
			};
			window.localStorage.setItem('fffPlayerInfo', JSON.stringify(fffPlayerInfo));
		}
	};
</script>

<div
	class="bg-gradient-to-br from-black via-blue-700 to-black h-screen w-screen flex flex-col items-center"
>
	{#if !store || $store.isEmpty}
		<div class="public-large">Loading...</div>
	{:else if !$store.singleItem.active}
		<div class="public-large">Game is not active</div>
	{:else if $store.singleItem.mainState === mainState.fffRegistration}
		{#if fffPlayerInfo}
			<div class="public-h1">You are registered!</div>
			<div class="public-large">View Name: {fffPlayerInfo.viewName}</div>
			<div class="public-large">Real Name: {fffPlayerInfo.realName}</div>
			<button class="bg-red-500 px-4 py-2 rounded-md hover:bg-red-300 mt-4" on:click={reset}
				>Reset Details</button
			>
		{:else}
			<div class="public-large">Register user details</div>
			<input class="public" type="text" placeholder="View Name" bind:value={viewName} />
			<input class="public" type="text" placeholder="Real Name" bind:value={realName} />
			<button
				class="bg-green-500 px-4 py-2 rounded-md hover:bg-green-300 mt-4"
				on:click={register}
				disabled={!viewName || !realName}>Register</button
			>
		{/if}
	{:else if $store.singleItem.mainState === mainState.fffWaitForQuestion || $store.singleItem.mainState === mainState.fffQuestionSelected}
		<FffWaitForQuestionView
			gameSessionId={$store.singleItem.id}
			state={$store.singleItem.mainState}
		/>
	{:else if $store.singleItem.mainState === mainState.fffQuestionDisplay}
		<FffQuestionDisplayViewPublicUI
			gameSessionId={$store.singleItem.id}
			fffQuestion={$store.singleItem.fffQuestion}
			playerId={fffPlayerInfo?.playerId}
			alreadyAnswered={fffPlayerInfo?.submittedAnswers?.[$store.singleItem.fffQuestion.id]}
			on:submittedAnswer={registerSubmittedAnswer}
		/>
	{:else if $store.singleItem.mainState === mainState.fffWaitForResult || $store.singleItem.mainState === mainState.fffResultDisplay}
		<FffResultsView
			gameSessionId={$store.singleItem.id}
			fffQuestion={$store.singleItem.fffQuestion}
			playerId={fffPlayerInfo?.playerId}
			results={$store.singleItem.mainState === mainState.fffWaitForResult
				? null
				: $store.singleItem.fffResults}
		/>
	{:else}
		<div class="public-large">Please wait for the next round to begin</div>
	{/if}
</div>
