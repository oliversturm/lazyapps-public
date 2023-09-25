<script>
  import { page } from '$app/stores';
  import CustomerForm from '$lib/CustomerForm.svelte';

  export let data;
</script>

<CustomerForm
  dataId={$page.params.id}
  data={data.items.length
    ? data.items[0]
    : { newObject: true, name: '', location: '' }}
/>
