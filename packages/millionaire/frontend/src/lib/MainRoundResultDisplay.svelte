<script>
  import { postCommand } from '$lib/commands.js';
  import { formatAnswerTime } from '$lib/formatAnswerTime.js';

  export let gameSessionId;
  export let results;
  // This will be true when the newest set of results
  // has been integrated, i.e. mainState has changed from
  // "waiting for result display" to "result display"
  export let resultsFinal;

  export let possibleFffQuestionsCount;
  export let possibleMainRoundQuestionsCountLevel1;
  export let possibleMainRoundQuestionsCountLevel2;
  export let possibleMainRoundQuestionsCountLevel3;

  const formatQuestionCount = (count) => {
    // check for undefined
    if (count === undefined || count === -1) {
      return '∞';
    } else {
      return `${count}`;
    }
  };

  // Compare FFFResultsView. Here, we should normally have
  // values in all four variables. The undefined case does
  // not apply because this view is not currently used in
  // the public UI. The -1 case however could apply in the
  // weird situation that we jump here from the FFFResultsView
  // before a main round has ever been played. This process
  // does not make sense from an presenter's POV, but it
  // could happen and we should be able to handle it.
  // So, -1 will be accepted here just like in FFFResultsView.
  $: canPlayOneMoreRound =
    possibleFffQuestionsCount >= 1 &&
    ((possibleMainRoundQuestionsCountLevel1 === -1 &&
        possibleMainRoundQuestionsCountLevel2 === -1 &&
        possibleMainRoundQuestionsCountLevel3 === -1) ||
      (possibleMainRoundQuestionsCountLevel1 >= 1 &&
        possibleMainRoundQuestionsCountLevel2 >= 3 &&
        possibleMainRoundQuestionsCountLevel3 >= 1));

  const calculateViewResults = (results) => {
    const viewResults = results.map((r) => ({
      playerId: r.playerId,
      playerName: r.playerName,
      points: r.points,
      remainingJokerCount: r.remainingJokers.length,
      fffTime: r.fffTime
    }));
    viewResults.sort((l, r) => {
      // highest points values first
      if (l.points !== r.points) return r.points - l.points;

      // highest number of remaining jokers next
      if (l.remainingJokerCount !== r.remainingJokerCount)
        return r.remainingJokerCount - l.remainingJokerCount;

      // lowest fff time last
      return l.fffTime - r.fffTime;
    });
    return viewResults;
  };

  $: viewResults = calculateViewResults(results);

  // double-click mechanism to prevent accidental clicks
  let nextRoundClickedOnce = false;
  const nextRound = () => {
    if (!nextRoundClickedOnce) {
      nextRoundClickedOnce = true;
    } else {
      nextRoundClickedOnce = false;
      postCommand({
        aggregateName: 'gameSession',
        aggregateId: gameSessionId,
        command: 'START_FFF_REGISTRATION'
      });
    }
  };
</script>

<table class="results mt-4 w-3/4">
  <tr>
    <th>Player</th>
    <th>Score</th>
    <th>Remaining&nbsp;Jokers</th>
    <th>FFF&nbsp;Time</th>
  </tr>
  {#each viewResults as result}
    <tr>
      <td>{result.playerName}</td>
      <td>{result.points}</td>
      <td>{result.remainingJokerCount}</td>
      <td>{formatAnswerTime(result.fffTime)}</td>
    </tr>
  {/each}
</table>

<!-- FORMAT AS SPINNER OVERLAY OR SIMILAR -->
{#if !resultsFinal}
  <div class="public-large">Waiting for results...</div>
{/if}

<div class="text-center">
  <button
    class="control mt-4"
    class:clickedOnce={nextRoundClickedOnce}
    on:click={nextRound}
    disabled={!canPlayOneMoreRound}>Play Next Round
  </button
  >
  {#if !canPlayOneMoreRound}
    <div class="public-large">Not enough questions left to play another round!</div>
  {/if}
  <div class="text-xs text-center mt-2">
    Available questions: FFF {formatQuestionCount(possibleFffQuestionsCount)},
    L1 {formatQuestionCount(possibleMainRoundQuestionsCountLevel1)}, L2
    {formatQuestionCount(possibleMainRoundQuestionsCountLevel2)},
    L3 {formatQuestionCount(possibleMainRoundQuestionsCountLevel3)}
  </div>
  <!-- Considered having an end game button here -- but
    that doesn't seem really necessary, and I could hit it 
    accidentally or whatever... I can just as well end the
    session, later or whenever, through the admin interface. -->
  <!-- <button on:click={endGameClick}>End Game</button> -->
</div>
