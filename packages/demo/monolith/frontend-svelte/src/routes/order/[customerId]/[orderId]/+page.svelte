<script>
  import { page } from '$app/stores';
  import OrderForm from '$lib/OrderForm.svelte';
</script>

<div>
  Editing order {$page.params.orderId} for customer {$page.params.customerId}
</div>

<OrderForm
  customerId={$page.params.customerId}
  orderId={$page.params.orderId}
  data={{ text: '', value: 0 }}
/>
