<script>
  import { createEventDispatcher } from 'svelte';
  import { postCommand } from '$lib/commands.js';
  import AnswerButton from '$lib/AnswerButton.svelte';
  import CurrentAnswerLabel from '$lib/CurrentAnswerLabel.svelte';
  import { format } from '$lib/formatDisplayText.js';

  export let gameSessionId;
  export let playerId;
  export let fffQuestion;
  export let alreadyAnswered = false;

  let currentAnswer = '';
  let submittedAnswer = '';
  $: canPlay = !!playerId && !alreadyAnswered;
  $: canAddToAnswer = canPlay && currentAnswer.length < 4;
  $: canSubmitAnswer = canPlay && currentAnswer.length === 4;
  $: canResetAnswer = canPlay && currentAnswer.length > 0;

  const letters = ['A', 'B', 'C', 'D'];
  const letterFromIndex = (index) => letters[index];

  const selectAnswer = (index) => () => {
    if (canPlay) {
      if (canAddToAnswer) {
        const letter = letterFromIndex(index);
        if (!currentAnswer.includes(letter)) {
          currentAnswer += letter;
        }
      }
    }
  };

  const resetAnswer = () => {
    if (canPlay) {
      currentAnswer = '';
    }
  };

  const dispatch = createEventDispatcher();

  const submitAnswer = () => {
    if (canPlay) {
      postCommand({
        aggregateName: 'gameSession',
        aggregateId: gameSessionId,
        command: 'SUBMIT_FFF_ANSWER',
        payload: {
          playerId,
          questionId: fffQuestion.id,
          answer: currentAnswer
        }
      });
      dispatch('submittedAnswer', {
        questionId: fffQuestion.id,
        answer: currentAnswer
      });
      submittedAnswer = currentAnswer;
    }
  };
</script>

<div class="flex flex-col items-center">
  <div class="question">{@html format(fffQuestion.question)}</div>
  <div class="flex flex-col md:grid md:grid-cols-2 md:grid-rows-2 gap-4 my-4">
    <AnswerButton
      text={format(fffQuestion.answers[0])}
      marker="A"
      disabled={!canAddToAnswer || currentAnswer.includes('A')}
      on:click={selectAnswer(0)}
    />
    <AnswerButton
      text={format(fffQuestion.answers[1])}
      marker="B"
      disabled={!canAddToAnswer || currentAnswer.includes('B')}
      on:click={selectAnswer(1)}
    />
    <AnswerButton
      text={format(fffQuestion.answers[2])}
      marker="C"
      disabled={!canAddToAnswer || currentAnswer.includes('C')}
      on:click={selectAnswer(2)}
    />
    <AnswerButton
      text={format(fffQuestion.answers[3])}
      marker="D"
      disabled={!canAddToAnswer || currentAnswer.includes('D')}
      on:click={selectAnswer(3)}
    />
  </div>
  {#if canPlay || alreadyAnswered}
    <CurrentAnswerLabel answer={currentAnswer || submittedAnswer} />
  {/if}
  {#if canPlay}
    <div class="flex flex-col md:flex-row gap-4 mb-4">
      <button class="p-red" disabled={!canResetAnswer} on:click={resetAnswer}>Reset Answer</button>
      <button class="p-green" disabled={!canSubmitAnswer} on:click={submitAnswer}
      >Submit Answer
      </button
      >
    </div>
  {/if}
</div>
