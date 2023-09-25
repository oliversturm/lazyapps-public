<script>
  import { goto } from '$app/navigation';

  import Button from './Button.svelte';
  import { postCommand } from './commands';
  import orderEditSchema from './schemas/orderEditSchema';
  import TextInput from './TextInput.svelte';
  import ValidationLabel from './ValidationLabel.svelte';
  import { createValidator } from './validator';

  export let data;
  export let customerId;
  export let orderId;

  const validator = createValidator(orderEditSchema);
  const { errors, isValid } = validator;
  const validate = () => validator.validate(data);

  const save = () => {
    validate().then(() => {
      if ($isValid) {
        postCommand({
          aggregateName: 'order',
          aggregateId: orderId,
          command: 'CREATE',
          payload: { customerId, text: data.text, value: data.value },
        });
        goto('/customers');
      }
    });
  };
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<form>
  <div>
    <div class="my-4 flex">
      <label class="mr-4">
        Text
        <TextInput
          name="text"
          autoFocus
          bind:value={data.text}
          on:input={validate}
        />
        <ValidationLabel {errors} field="text" />
      </label>
      <label>
        Value
        <TextInput name="value" bind:value={data.value} on:input={validate} />
        <ValidationLabel {errors} field="value" />
      </label>
    </div>
    <div>
      <div>
        <Button
          kind="separate"
          text="Save"
          on:click={save}
          disabled={!$isValid}
        />
        <Button kind="separate" text="Cancel" target="/customers" />
      </div>
    </div>
  </div>
</form>
