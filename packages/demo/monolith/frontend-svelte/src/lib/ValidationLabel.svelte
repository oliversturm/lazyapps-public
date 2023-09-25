<script>
  export let errors;
  export let field;
</script>

{#if $errors[field]}
  <div class="text-xs text-red-500 px-2">{$errors[field]}</div>
{/if}
