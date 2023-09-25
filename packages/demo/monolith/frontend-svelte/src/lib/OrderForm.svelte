<script>
  import { enhance } from '$app/forms';

  import Button from './Button.svelte';
  import orderEditSchema from './schemas/orderEditSchema';
  import TextInput from './TextInput.svelte';
  import ValidationLabel from './ValidationLabel.svelte';
  import { createValidator } from './validator';

  export let data;
  export let customerId;
  export let orderId;

  export let form;
  $: form = form || data;

  const validator = createValidator(orderEditSchema);
  const { errors, isValid } = validator;
  const validate = () => validator.validate(data);

  $: validator.mergeForm(form);
</script>

<form method="POST" use:enhance>
  <input type="hidden" name="orderId" value={orderId} />
  <input type="hidden" name="customerId" value={customerId} />
  <!-- Currently no edit support -->
  <input type="hidden" name="command" value="CREATE" />

  {#if data.newObject}
    <h1 class="text-2xl font-bold">New Order</h1>
  {:else}
    <h1 class="text-2xl font-bold">Edit Order</h1>
  {/if}

  <div>
    <div class="my-4 flex">
      <label class="mr-4" for="text">Text</label>
      <div class="flex-1">
        <TextInput
          id="text"
          name="text"
          autoFocus
          bind:value={data.text}
          on:input={validate}
        />
        <ValidationLabel {errors} field="text" />
      </div>
      <label class="ml-4" for="value">Value</label>
      <div class="flex-1">
        <TextInput
          id="value"
          name="value"
          bind:value={data.value}
          on:input={validate}
        />
        <ValidationLabel {errors} field="value" />
      </div>
    </div>
    <div>
      <div>
        <Button kind="separate" text="Save" submit disabled={!$isValid} />
        <Button kind="separate" text="Cancel" target="/customers" />
      </div>
    </div>
  </div>
</form>
