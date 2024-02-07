<script>
  export let text;
  export let marker;
  export let order = false;
</script>

<div class="answer standard flex flex-row items-center">
  <div class="flex-grow mr-4">{@html text}</div>
  <div class="marker {order ? 'order' : 'enabled'}">{marker}</div>
</div>
