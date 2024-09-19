<script>
  export let warn = false;
  $: classes = warn ? 'bg-red-100' : '';
</script>

<td class="py-2 px-4 {classes}"><slot /></td>

