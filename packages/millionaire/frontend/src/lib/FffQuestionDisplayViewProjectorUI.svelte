<script>
  import { onMount } from 'svelte';
  import { postCommand } from '$lib/commands.js';
  import { format } from '$lib/formatDisplayText.js';

  import AnswerROButton from '$lib/AnswerROButton.svelte';

  export let gameSessionId;
  export let fffQuestion;
  export let fffAnswersCount;

  let secondsRemaining;

  onMount(() => {
    secondsRemaining = 30;
    const interval = setInterval(() => {
      secondsRemaining--;
      if (secondsRemaining === 0) {
        clearInterval(interval);
      }
    }, 1000);
  });

  $: timeoutText = secondsRemaining ? `${secondsRemaining} seconds` : 'We should move on now!';

  const moveOn = () => {
    postCommand({
      aggregateName: 'gameSession',
      aggregateId: gameSessionId,
      command: 'END_FFF_ROUND',
      payload: {}
    });
  };
</script>

<div class="flex flex-col items-center">
  <div class="question">{@html format(fffQuestion.question)}</div>
  <div class="grid grid-cols-2 grid-rows-2 gap-4 my-4">
    <AnswerROButton text={format(fffQuestion.answers[0])} marker="A" />
    <AnswerROButton text={format(fffQuestion.answers[1])} marker="B" />
    <AnswerROButton text={format(fffQuestion.answers[2])} marker="C" />
    <AnswerROButton text={format(fffQuestion.answers[3])} marker="D" />
  </div>
  <div class="public-large">Answers recorded: {fffAnswersCount}</div>
</div>

<div class="public-large">{timeoutText}</div>

<button class="control mb-4" on:click={moveOn}>Move On Then</button>
