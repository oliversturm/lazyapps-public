import { redirect } from '@sveltejs/kit';
import { postCommand } from '$lib/commands.js';
import { query } from '$lib/query.js';
import customerEditSchema from '$lib/schemas/customerEditSchema.js';

export function load({ params }) {
	return {
		items: query('customersEditing', 'byId', {
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
			aggregateName: 'customer',
			aggregateId: formData.id,
			command: formData.command,
			payload: { name: formData.name, location: formData.location }
		});
		throw redirect(302, `/customers`);
	}
};
