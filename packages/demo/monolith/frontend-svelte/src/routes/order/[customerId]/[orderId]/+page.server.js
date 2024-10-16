import { redirect } from '@sveltejs/kit';
import { postCommand } from '$lib/commands.js';
import orderEditSchema from '$lib/schemas/orderEditSchema.js';
import { nanoid } from 'nanoid';

export const actions = {
	default: async (event) => {
		const formData = Object.fromEntries(await event.request.formData());
		const validationResult = await orderEditSchema.validate(formData).catch((err) => {
			return { serverError: err };
		});
		if (validationResult.error) {
			return validationResult;
		}

		await postCommand({
			correlationId: `SVLT-${nanoid()}`,
			aggregateName: 'order',
			aggregateId: formData.orderId,
			command: formData.command,
			payload: {
				customerId: formData.customerId,
				text: formData.text,
				value: formData.value
			}
		});
		throw redirect(302, `/customers`);
	}
};
