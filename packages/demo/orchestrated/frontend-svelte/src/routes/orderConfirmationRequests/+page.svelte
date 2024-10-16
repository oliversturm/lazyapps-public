<script>
  import { invalidateAll } from '$app/navigation';
  import OrderConfirmationRequestsTable from '$lib/OrderConfirmationRequestsTable.svelte';

  import { readModelStore } from '$lib/readModelStore';

  const endpointName = 'orders';
  const socketIoEndpoint =
    import.meta.env.VITE_CHANGENOTIFIER_URL || 'http://127.0.0.1:3006';

  export let data;
  $: store = readModelStore(
    data.items,
    endpointName,
    socketIoEndpoint,
    'confirmationRequests',
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

<OrderConfirmationRequestsTable {store} />
