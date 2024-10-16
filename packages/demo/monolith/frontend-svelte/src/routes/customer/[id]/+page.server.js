import { redirect } from '@sveltejs/kit';
import { postCommand } from '$lib/commands.js';
import { query } from '$lib/query.js';
import customerEditSchema from '$lib/schemas/customerEditSchema.js';
import { nanoid } from 'nanoid';

export async function load({ params }) {
	const correlationId = `SVLT-${nanoid()}`;

	return {
		correlationId,
		items: await query(correlationId, 'customersEditing', 'byId', {
			id: params.id
		})
	};
}

export const actions = {
	default: async (event) => {
		const formData = Object.fromEntries(await event.request.formData());
		const validationResult = await customerEditSchema.validate(formData).catch((err) => {
			return { serverError: err };
		});
		if (validationResult.error) {
			return validationResult;
		}

		await postCommand({
			// new correlation id, posting this command begins a new process
			correlationId: `SVLT-${nanoid()}`,
			aggregateName: 'customer',
			aggregateId: formData.id,
			command: formData.command,
			payload: { name: formData.name, location: formData.location }
		});
		throw redirect(302, `/customers`);
	}
};
