<script>
  import { invalidateAll } from '$app/navigation';

  import { readModelStore } from '$lib/readModelStore.js';

  import { mainState } from '$lib/gameSessionStates.js';
  import PreGameView from '$lib/PreGameView.svelte';
  import FffRegistrationView from '$lib/FffRegistrationView.svelte';
  import FffWaitForQuestionView from '$lib/FffWaitForQuestionView.svelte';
  import FffQuestionDisplayViewProjectorUI from '$lib/FffQuestionDisplayViewProjectorUI.svelte';
  import FffResultsView from '$lib/FffResultsView.svelte';
  import MainRoundView from '$lib/MainRoundView.svelte';
  import MainRoundResultDisplay from '$lib/MainRoundResultDisplay.svelte';

  const endpointName = 'rm-ingame';
  const socketIoEndpoint = import.meta.env.VITE_CHANGE_NOTIFIER_URL;

  const customChangeHandler = (data, changeInfo) => {
    if (changeInfo.changeKind === 'optimisticIncFffAnswersCount') {
      return [{ ...data[0], fffAnswersCount: data[0].fffAnswersCount + 1 }];
    }
  };

  export let data;
  $: store = readModelStore(
    data.items,
    endpointName,
    socketIoEndpoint,
    'gameSessions',
    'byGameSessionId',
    customChangeHandler
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

<div
  class="bg-blue-700 h-screen w-screen flex flex-col items-center overflow-auto"
>
  {#if $store.isEmpty}
    <div class="public-large">Loading...</div>
  {:else if !$store.singleItem.active}
    <div class="public-large">Game is not active</div>
  {:else if $store.singleItem.mainState === mainState.preGame}
    <PreGameView
      gameSessionId={$store.singleItem.id}
      gameName={$store.singleItem.gameName}
      timestamp={$store.singleItem.timestamp}
      name={$store.singleItem.name}
    />
  {:else if $store.singleItem.mainState === mainState.fffRegistration}
    <FffRegistrationView gameSessionId={$store.singleItem.id} />
  {:else if $store.singleItem.mainState === mainState.fffWaitForQuestion || $store.singleItem.mainState === mainState.fffQuestionSelected}
    <FffWaitForQuestionView
      adminUI
      gameSessionId={$store.singleItem.id}
      state={$store.singleItem.mainState}
    />
  {:else if $store.singleItem.mainState === mainState.fffQuestionDisplay}
    <FffQuestionDisplayViewProjectorUI
      gameSessionId={$store.singleItem.id}
      fffQuestion={$store.singleItem.fffQuestion}
      fffAnswersCount={$store.singleItem.fffAnswersCount}
    />
  {:else if $store.singleItem.mainState === mainState.fffWaitForResult || $store.singleItem.mainState === mainState.fffResultDisplay}
    <FffResultsView
      adminUI
      gameSessionId={$store.singleItem.id}
      fffQuestion={$store.singleItem.fffQuestion}
      fffAnswersCount={$store.singleItem.fffAnswersCount}
      results={$store.singleItem.mainState === mainState.fffWaitForResult
				? null
				: $store.singleItem.lastFffResults}
      possibleFffQuestionsCount={$store.singleItem.possibleFffQuestionsCount}
      possibleMainRoundQuestionsCountLevel1={$store.singleItem
				.possibleMainRoundQuestionsCountLevel1}
      possibleMainRoundQuestionsCountLevel2={$store.singleItem
				.possibleMainRoundQuestionsCountLevel2}
      possibleMainRoundQuestionsCountLevel3={$store.singleItem
				.possibleMainRoundQuestionsCountLevel3}
    />
  {:else if [mainState.mainRoundWaitingForQuestion, mainState.mainRound, mainState.mainRoundDisplayAnswerResult].includes($store.singleItem.mainState)}
    <MainRoundView
      gameSessionId={$store.singleItem.id}
      question={$store.singleItem.mainRoundQuestion}
      playerName={$store.singleItem.currentPlayerViewName}
      availableJokers={$store.singleItem.availableJokers}
      currentScore={$store.singleItem.currentMainRoundPoints}
      mainRoundNumber={$store.singleItem.mainRoundNumber}
      mainRoundPreselectedAnswer={$store.singleItem.mainRoundPreselectedAnswer}
      roundAnswerDisplay={$store.singleItem.mainState === mainState.mainRoundDisplayAnswerResult}
      mainRoundMarkCorrectAnswer={$store.singleItem.mainRoundMarkCorrectAnswer}
      mainRoundMarkWrongAnswer={$store.singleItem.mainRoundMarkWrongAnswer}
      lastMainRoundAnswerCorrect={$store.singleItem.lastMainRoundAnswerCorrect}
    />
  {:else if $store.singleItem.mainState === mainState.mainRoundWaitingForResultDisplay || $store.singleItem.mainState === mainState.mainRoundResultDisplay}
    <MainRoundResultDisplay
      gameSessionId={$store.singleItem.id}
      results={$store.singleItem.results}
      resultsFinal={$store.singleItem.mainState === mainState.mainRoundResultDisplay}
      possibleFffQuestionsCount={$store.singleItem.possibleFffQuestionsCount}
      possibleMainRoundQuestionsCountLevel1={$store.singleItem
				.possibleMainRoundQuestionsCountLevel1}
      possibleMainRoundQuestionsCountLevel2={$store.singleItem
				.possibleMainRoundQuestionsCountLevel2}
      possibleMainRoundQuestionsCountLevel3={$store.singleItem
				.possibleMainRoundQuestionsCountLevel3}
    />
  {:else}
    <div>Unknown state: {$store.singleItem.mainState}. Complain to Oli.</div>
  {/if}
</div>
