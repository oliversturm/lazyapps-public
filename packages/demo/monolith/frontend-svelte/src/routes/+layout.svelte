<script>
  import { page } from '$app/stores';
  import Button from '$lib/Button.svelte';

  const navigationTargets = {
    '/customers': 'Customers',
    '/orders': 'Orders',
    '/orderConfirmationRequests': 'Order Confirmation Requests',
    '/about': 'About',
  };

</script>

<div
  class="container mx-auto border-solid border-2 rounded-lg my-4 p-4 shadow-lg"
>
  <div class="bg-orange-100 p-2 rounded flex items-center">
    {#each Object.keys(navigationTargets) as target}
      <Button
        kind="{ $page.url.pathname === target ? 'toolbar-selected' : 'toolbar' }"
        text={navigationTargets[target]}
        target={target}
      />
    {/each}
    <div class="ml-auto font-bold">Svelte Frontend</div>
  </div>
  <div class="border-solid border mt-4 rounded p-2">
    <slot />
  </div>
</div>
