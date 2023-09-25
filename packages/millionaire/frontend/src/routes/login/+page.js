import { redirect } from '@sveltejs/kit';

export function load(event) {
	const userinfo = event.cookies?.get('userinfo');

	if (userinfo) {
		throw redirect(302, '/protected');
	}
}
