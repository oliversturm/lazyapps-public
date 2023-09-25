<script>
	import _ from 'lodash';

	import { postCommand } from '$lib/commands.js';
	import AnswerROButton from './AnswerROButton.svelte';

	import { formatAnswerTime } from '$lib/formatAnswerTime.js';

	export let adminUI = false;
	export let gameSessionId;
	export let fffQuestion;
	export let fffAnswersCount = 0;
	export let results;
	export let playerId = null;

	export let possibleFffQuestionsCount = undefined;
	export let possibleMainRoundQuestionsCountLevel1 = undefined;
	export let possibleMainRoundQuestionsCountLevel2 = undefined;
	export let possibleMainRoundQuestionsCountLevel3 = undefined;

	// In case the props above are undefined, we don't care about
	// canPlayOneMoreRound -- this can only happen for the
	// public UI.
	// For the projector UI, the FFF count must always be
	// >= 1 at this point. However, the other counts may not
	// have been calculated if we've never played a main round
	// so far -- in this case they will be -1 because that's
	// the init value. We can proceed since this means that
	// the entire question pool is available.
	// Note that technically there is the possibility that we
	// don't have a question pool -- but we'll disregard that
	// for the time being.
	$: canPlayOneMoreRound =
		possibleFffQuestionsCount >= 1 &&
		((possibleMainRoundQuestionsCountLevel1 === -1 &&
			possibleMainRoundQuestionsCountLevel2 === -1 &&
			possibleMainRoundQuestionsCountLevel3 === -1) ||
			(possibleMainRoundQuestionsCountLevel1 >= 1 &&
				possibleMainRoundQuestionsCountLevel2 >= 3 &&
				possibleMainRoundQuestionsCountLevel3 >= 1));

	// For example, DBAC -> [3, 2, 4, 1]
	const calcAnswerMarkers = (q) => {
		const pos = (letter) => q.correctAnswerOrder.indexOf(letter) + 1;
		return [pos('A'), pos('B'), pos('C'), pos('D')];
	};

	$: answerMarker = calcAnswerMarkers(fffQuestion);
	$: viewResults = results ? _.take(results, 8) : null;
	$: correctResultCount = results?.length || 0;

	const viewResultClick = (index) => () => {
		if (adminUI) {
			const result = viewResults[index];
			postCommand({
				aggregateName: 'gameSession',
				aggregateId: gameSessionId,
				command: 'INIT_FOR_FIRST_MAIN_ROUND',
				payload: {
					playerId: result.playerId
				}
			});
		}
	};
	let restartButtonClickedOnce = false;
	const restartRound = () => {
		if (!restartButtonClickedOnce) {
			restartButtonClickedOnce = true;
		} else {
			restartButtonClickedOnce = false;
			postCommand({
				aggregateName: 'gameSession',
				aggregateId: gameSessionId,
				command: 'RESTART_ROUND',
				payload: {}
			});
		}
	};

	let endGameButtonClickedOnce = false;
	const endGame = () => {
		if (!endGameButtonClickedOnce) {
			endGameButtonClickedOnce = true;
		} else {
			endGameButtonClickedOnce = false;
			postCommand({
				aggregateName: 'gameSession',
				aggregateId: gameSessionId,
				command: 'SUBMIT_RESULT',
				payload: { result: null }
			});
		}
	};
</script>

<div class="flex flex-col items-center">
	<div class="question">{fffQuestion.question}</div>
	<div class="flex flex-col md:grid md:grid-cols-2 md:grid-rows-2 gap-4 my-4">
		<AnswerROButton text={fffQuestion.answers[0]} marker={answerMarker[0]} order />
		<AnswerROButton text={fffQuestion.answers[1]} marker={answerMarker[1]} order />
		<AnswerROButton text={fffQuestion.answers[2]} marker={answerMarker[2]} order />
		<AnswerROButton text={fffQuestion.answers[3]} marker={answerMarker[3]} order />
	</div>
</div>

{#if viewResults}
	<div class="public-large">
		{#if adminUI}{fffAnswersCount} Answers, {/if}{correctResultCount} Correct Result(s)
	</div>
	{#if correctResultCount > 0}
		{#if playerId === viewResults[0].playerId}
			<div class="public-large">You've won this round!</div>
		{/if}
		<table class="results mx-2">
			<tr>
				<th>Player</th>
				<th>Time</th>
			</tr>

			{#each viewResults as result, i}
				<tr>
					<td
						>{#if adminUI}<button on:click={viewResultClick(i)}>{result.playerName}</button
							>{:else}{result.playerName}{/if}</td
					>
					<td>{formatAnswerTime(result.answerTime)}</td>
				</tr>
			{/each}
		</table>
	{:else}
		<div class="public-large">Nobody got the right answer!</div>
	{/if}
{:else}
	<div class="public-large">Waiting for results...</div>
{/if}

{#if adminUI}
	<div class="text-center">
		<div class="flex flex-row gap-4 mt-4 justify-center">
			<button
				class="control"
				class:clickedOnce={restartButtonClickedOnce}
				on:click={restartRound}
				disabled={!canPlayOneMoreRound}>Restart Round</button
			>
			<button class="control" class:clickedOnce={endGameButtonClickedOnce} on:click={endGame}
				>End Game</button
			>
		</div>
		{#if !canPlayOneMoreRound}
			<div class="public-large">Not enough questions left to play another round!</div>
		{/if}
		<div class="text-xs text-center mt-2">
			Available questions: FFF {possibleFffQuestionsCount}/L1 {possibleMainRoundQuestionsCountLevel1}/L2
			{possibleMainRoundQuestionsCountLevel2}/L3 {possibleMainRoundQuestionsCountLevel3}
		</div>
	</div>
{/if}
