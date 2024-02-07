<script>
  import _ from 'lodash';

  import { postCommand } from '$lib/commands.js';
  import AnswerButton from '$lib/AnswerButton.svelte';
  import { format } from '$lib/formatDisplayText.js';

  export let gameSessionId;
  export let question;
  export let playerName;
  export let availableJokers;
  export let currentScore;
  export let mainRoundNumber;
  export let mainRoundPreselectedAnswer;
  // if this flag is true, we expect the next few values
  // to be populated -- it seems easier to distinguish
  // states by this one flag
  export let roundAnswerDisplay; // = false
  export let mainRoundMarkCorrectAnswer;
  export let mainRoundMarkWrongAnswer;
  export let lastMainRoundAnswerCorrect;

  const calcAnswerSpecial = (index, { rad, mrpa, mrmca, mrmwa }) => {
    if (rad) {
      return mrmca === index ? 'correct' : mrmwa === index ? 'wrong' : '';
    } else {
      return mrpa === index ? 'preselected' : '';
    }
  };

  // Using this parameter structure to preserve reactive
  // behavior while allowing for reasonably short code below
  $: answerSpecialParameters = {
    rad: roundAnswerDisplay,
    mrpa: mainRoundPreselectedAnswer,
    mrmca: mainRoundMarkCorrectAnswer,
    mrmwa: mainRoundMarkWrongAnswer
  };

  $: answer1Special = calcAnswerSpecial(0, answerSpecialParameters);
  $: answer2Special = calcAnswerSpecial(1, answerSpecialParameters);
  $: answer3Special = calcAnswerSpecial(2, answerSpecialParameters);
  $: answer4Special = calcAnswerSpecial(3, answerSpecialParameters);

  const mapJoker = (j) => ({ fifty: '50/50', ask: 'Ask' }[j]);

  const applyJoker = (j) => () => {
    postCommand({
      aggregateName: 'gameSession',
      aggregateId: gameSessionId,
      command: 'APPLY_JOKER',
      payload: {
        joker: j
      }
    });
  };

  const roundScores = [10, 50, 200, 750, 2500];

  const viewRoundScores = _.chain(roundScores)
    .map((score, index) => ({ round: index, score }))
    .sortBy(['round'])
    .reverse()
    .value();

  let preselectedAnswer = -1;
  const selectAnswer = (index) => () => {
    if (roundAnswerDisplay) {
      return;
    }
    // Choose this place to reset any previous joker selection
    selectedJoker = '';
    if (preselectedAnswer < 0 || preselectedAnswer !== index) {
      // I did this as a server feature with an eye on
      // reflecting the selection in the public UI. This
      // does not happen right now.
      postCommand({
        aggregateName: 'gameSession',
        aggregateId: gameSessionId,
        command: 'PRESELECT_MAIN_ROUND_ANSWER',
        payload: {
          answer: index
        }
      });
      preselectedAnswer = index;
    } else {
      postCommand({
        aggregateName: 'gameSession',
        aggregateId: gameSessionId,
        command: 'SUBMIT_MAIN_ROUND_ANSWER',
        payload: {
          answer: index
        }
      });
      preselectedAnswer = -1;
    }
  };

  // For future reference: this is NOT incorrect.
  // For better or worse, this command is what starts
  // the next (individual, out of five) main round --
  // keep in mind that the
  // "main round" is called "main round" to distinguish
  // it from the FFF round, but there are actually
  // five individual "rounds" that make up the "main round"
  // This function starts a new individual round, NOT a
  // new complete run that begins with FFF.
  const proceed = () => {
    postCommand({
      aggregateName: 'gameSession',
      aggregateId: gameSessionId,
      command: 'START_MAIN_ROUND',
      payload: {}
    });
  };

  // this should ALWAYS be the way that a main round
  // ends -- so that the results will be displayed next
  // it does not make sense to skip out of the round
  // in any other way because then the results would
  // not be displayed
  const endRound = () => {
    postCommand({
      aggregateName: 'gameSession',
      aggregateId: gameSessionId,
      command: 'END_MAIN_ROUND',
      payload: {}
    });
  };

  // In contrast to answers, simply local double-selection
  // mechanism to prevent accidental execution.
  let selectedJoker = '';
  const selectJoker = (j) => () => {
    if (selectedJoker === j) {
      applyJoker(j)();
      selectedJoker = '';
    } else {
      selectedJoker = j;
    }
  };
</script>

<div class="public-large">Player: {playerName}</div>

{#if question}
  <div class="flex flex-row w-screen">
    <div class="ml-4 flex flex-col gap-4 border-r-2 border-blue-800 pr-2">
      <div class="public-large">Jokers</div>
      {#each availableJokers as j}
        <button class="p-green {selectedJoker === j ? 'clickedOnce' : ''}" on:click={selectJoker(j)}
        >{mapJoker(j)}</button
        >
      {/each}
    </div>

    <div class="flex flex-col items-center flex-grow px-2">
      <div class="question">{@html format(question.question)}</div>
      <div class="grid grid-cols-2 grid-rows-2 gap-4 my-4">
        <AnswerButton
          special={answer1Special}
          text={format(question.answers[0])}
          marker="A"
          on:click={selectAnswer(0)}
        />
        <AnswerButton
          special={answer2Special}
          text={format(question.answers[1])}
          marker="B"
          on:click={selectAnswer(1)}
        />
        <AnswerButton
          special={answer3Special}
          text={format(question.answers[2])}
          marker="C"
          on:click={selectAnswer(2)}
        />
        <AnswerButton
          special={answer4Special}
          text={format(question.answers[3])}
          marker="D"
          on:click={selectAnswer(3)}
        />
      </div>
    </div>

    <div class="flex flex-col mr-4 mt-4 pl-2 border-l-2 border-blue-600">
      <div class="scoreline mb-4">Score<br />{currentScore}</div>
      {#each viewRoundScores as { round, score }}
        <div
          class="scoreline"
          class:current={round == mainRoundNumber}
          class:scored={round < mainRoundNumber}
        >
          {score}
        </div>
      {/each}
    </div>
  </div>
{:else}
  <div class="public-large">Waiting for Question</div>
{/if}

{#if roundAnswerDisplay}
  {#if lastMainRoundAnswerCorrect}
    <div class="public-large">Correct Answer</div>
    {#if mainRoundNumber === 4}
      <button class="control mb-4" on:click={endRound}>End Round</button>
    {:else}
      <button class="control mb-4" on:click={proceed}>Proceed</button>
    {/if}
  {:else}
    <div class="public-large">Wrong Answer</div>
    <button class="control mb-4" on:click={endRound}>End Round</button>
  {/if}
{/if}
