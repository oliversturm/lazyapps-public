<script>
  export let warn = false;
  $: classes = warn ? 'bg-amber-100' : '';
</script>

<tr class={classes}><slot /></tr>
