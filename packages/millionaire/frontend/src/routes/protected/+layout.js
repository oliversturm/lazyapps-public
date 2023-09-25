import { redirect } from '@sveltejs/kit';

export function load() {
	const userInfo = window.localStorage.getItem('userInfo');

	if (!userInfo) {
		throw redirect(302, '/login');
	}

	return {
		userInfo: JSON.parse(userInfo)
	};
}
