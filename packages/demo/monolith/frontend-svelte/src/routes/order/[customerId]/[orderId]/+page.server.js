import { redirect } from '@sveltejs/kit';
import { postCommand } from '$lib/commands.js';
import orderEditSchema from '$lib/schemas/orderEditSchema.js';

export const actions = {
  default: async (event) => {
    const formData = Object.fromEntries(await event.request.formData());
    const validationResult = await orderEditSchema
      .validate(formData)
      .catch((err) => {
        return { serverError: err };
      });
    if (validationResult.error) {
      return validationResult;
    }

    await postCommand({
      aggregateName: 'order',
      aggregateId: formData.orderId,
      command: formData.command,
      payload: {
        customerId: formData.customerId,
        text: formData.text,
        value: formData.value,
      },
    });
    throw redirect(302, `/customers`);
  },
};
