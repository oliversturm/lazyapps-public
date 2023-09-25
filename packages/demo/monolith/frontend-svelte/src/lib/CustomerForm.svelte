<script>
  import { enhance } from '$app/forms';

  import Button from './Button.svelte';
  import customerEditSchema from './schemas/customerEditSchema';
  import TextInput from './TextInput.svelte';
  import ValidationLabel from './ValidationLabel.svelte';
  import { createValidator } from './validator';

  export let data;
  export let dataId;

  export let form;
  $: form = form || data;

  const validator = createValidator(customerEditSchema);
  const { errors, isValid } = validator;
  const validate = () => validator.validate(data);

  // In case form has a serverError from a previous post
  // roundtrip, it is pulled into the
  // validators errors object.
  $: validator.mergeForm(form);
</script>

<form method="POST" use:enhance>
  <input type="hidden" name="id" value={dataId} />
  <input
    type="hidden"
    name="command"
    value={data.newObject ? 'CREATE' : 'UPDATE'}
  />
  <div>
    <div class="my-4 flex">
      <label class="mr-4" for="name">Name</label>
      <div class="flex-1">
        <TextInput
          id="name"
          name="name"
          autoFocus
          bind:value={data.name}
          on:input={validate}
        />
        <ValidationLabel {errors} field="name" />
      </div>
      <label class="ml-4" for="location">Location</label>
      <div class="flex-1">
        <TextInput
          id="location"
          name="location"
          bind:value={data.location}
          on:input={validate}
        />
        <ValidationLabel {errors} field="location" />
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
