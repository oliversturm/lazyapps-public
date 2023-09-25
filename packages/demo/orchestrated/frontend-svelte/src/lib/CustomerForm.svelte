<script>
  import { goto } from '$app/navigation';

  import Button from './Button.svelte';
  import { postCommand } from './commands';
  import customerEditSchema from './schemas/customerEditSchema';
  import TextInput from './TextInput.svelte';
  import ValidationLabel from './ValidationLabel.svelte';
  import { createValidator } from './validator';

  export let data;
  export let dataId;

  const validator = createValidator(customerEditSchema);
  const { errors, isValid } = validator;
  const validate = () => validator.validate(data);

  const save = () => {
    validate().then(() => {
      if ($isValid) {
        postCommand({
          aggregateName: 'customer',
          aggregateId: dataId,
          command: data.newObject ? 'CREATE' : 'UPDATE',
          payload: { name: data.name, location: data.location },
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
        Name
        <TextInput
          name="name"
          autoFocus
          bind:value={data.name}
          on:input={validate}
        />
        <ValidationLabel {errors} field="name" />
      </label>
      <label>
        Location
        <TextInput
          name="location"
          bind:value={data.location}
          on:input={validate}
        />
        <ValidationLabel {errors} field="location" />
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
