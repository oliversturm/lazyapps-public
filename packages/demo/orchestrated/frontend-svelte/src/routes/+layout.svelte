<script>
  import Button from '$lib/Button.svelte';
</script>

<div
  class="container mx-auto border-solid border-2 rounded-lg my-4 p-4 shadow-lg"
>
  <div class="bg-orange-100 p-2 rounded flex items-center">
    <Button kind="toolbar" text="Customers" target="/customers" />
    <Button kind="toolbar" text="Orders" target="/orders" />
    <Button kind="toolbar" text="About" target="/about" />
    <div class="ml-auto font-bold">Svelte Frontend</div>
  </div>
  <div class="border-solid border mt-4 rounded p-2">
    <slot />
  </div>
</div>
