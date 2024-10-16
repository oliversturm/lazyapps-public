<script>
  import { invalidateAll } from '$app/navigation';

  import Button from '$lib/Button.svelte';
  import CustomerTable from '$lib/CustomerTable.svelte';

  import { readModelStore } from '$lib/readModelStore';
  import { nanoid } from 'nanoid';

  const endpointName = 'customers';
  const socketIoEndpoint = 'http://127.0.0.1:53008';

  export let data;
  $: store = readModelStore(
    data.items,
    endpointName,
    socketIoEndpoint,
    'overview',
    'all',
    data.correlationId
  );
  $: {
    if ($store.needsReload) {
      // this happens if a live change comes to the
      // store that indicates a complete reload
      // is necessary
      invalidateAll();
    }
  }
</script>

<CustomerTable {store} />
<Button kind="separate" text="New Customer" target={`/customer/${nanoid()}`} />
