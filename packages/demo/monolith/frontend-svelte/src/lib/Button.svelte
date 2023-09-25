<script>
  const sharedStyles = 'select-none inline-block cursor-pointer';
  const styles = {
    toolbar:
      'bg-orange-400 hover:bg-amber-300 py-1 px-2 mx-1 rounded disabled:bg-gray-200',
    separate:
      'bg-cyan-400 hover:bg-sky-300 py-2 px-2 mt-4 mr-1 rounded disabled:bg-gray-200',
    inline:
      'bg-cyan-300 hover:bg-sky-200 px-2 py-1 mx-1 rounded disabled:bg-gray-200',
  };
  const disabledStyle = 'pointer-events-none bg-gray-200';

  export let kind = 'separate';

  export let submit = false;
  export let disabled = false;
  export let text = '';
  export let target = '#';

  $: buttonClass = `${sharedStyles} ${styles[kind]} ${
    disabled ? disabledStyle : ''
  }`;
</script>

{#if submit}
  <button class={buttonClass} on:click type="submit">
    {text}
  </button>
{:else}
  <a href={target} class={buttonClass} on:click>
    {text}
  </a>
{/if}
