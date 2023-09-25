<script>
  export let errors;
  export let field;
</script>

{#if $errors[field]}
  <div class="text-xs text-red-500 text-right pr-2">{$errors[field]}</div>
{/if}
