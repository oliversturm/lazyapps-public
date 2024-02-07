<script>
  export let text;
  export let marker;
  export let disabled = false;
  $: internalDisabled = disabled || !text;

  export let special = '';

  const specialValues = {
    preselected: 'preselected',
    correct: 'correct',
    wrong: 'wrong'
  };

  $: specialSanitized = specialValues[special] || 'standard';
</script>

<button
  class="answer {specialSanitized} flex flex-row items-center"
  on:click
  disabled={internalDisabled}
>
  <div class="flex-grow mr-4">{@html text || ''}</div>
  <div class="marker {internalDisabled ? 'disabled' : 'enabled'}">{marker}</div>
</button>
