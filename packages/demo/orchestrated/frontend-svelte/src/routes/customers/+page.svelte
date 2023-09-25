<script>
  import { invalidateAll } from '$app/navigation';
  import { v4 as uuid } from 'uuid';

  import Button from '$lib/Button.svelte';
  import CustomerTable from '$lib/CustomerTable.svelte';

  import { readModelStore } from '$lib/readModelStore';

  const endpointName = 'customers';
  const socketIoEndpoint =
    import.meta.env.VITE_CHANGENOTIFIER_URL || 'http://127.0.0.1:3006';

  export let data;
  $: store = readModelStore(
    data.items,
    endpointName,
    socketIoEndpoint,
    'overview',
    'all'
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
<Button kind="separate" text="New Customer" target={`/customer/${uuid()}`} />
