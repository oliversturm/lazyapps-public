<script>
  export let autoFocus = false;
  export let name;
  export let value;
  export let id;
</script>

<!-- svelte-ignore a11y-autofocus -->
<input
  class="border rounded px-2 ml-2 focus:ring-1 focus:ring-cyan-200"
  type="text"
  {id}
  {autoFocus}
  {name}
  bind:value
  on:input
/>
