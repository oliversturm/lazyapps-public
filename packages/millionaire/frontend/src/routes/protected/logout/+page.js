import { redirect } from '@sveltejs/kit';

export async function load({ fetch }) {
	await fetch(`${import.meta.env.VITE_TOKENSERVICE_URL}/logout`)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`Fetch error: ${res.status}/${res.statusText}`);
			}
			window.localStorage.removeItem('userInfo');
		})
		.catch((err) => {
			console.error(`Error logging out: ${err.message}`);
		});

	throw redirect(302, '/login');
}
