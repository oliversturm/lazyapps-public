<script>
	import { goto } from '$app/navigation';

	let username;
	let password;
	let viewError;

	const loginUser = (username, password) => {
		return fetch(`${import.meta.env.VITE_TOKENSERVICE_URL}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error(`Fetch error: ${res.status}/${res.statusText}`);
				}
				return {};
			})
			.catch((err) => {
				console.log('Exception caught', err);
				return { error: err.message };
			});
	};

	const login = async () => {
		if (!username || !password) {
			viewError = 'Please enter a username and password.';
			return;
		}

		const { error } = await loginUser(username, password);
		if (error) {
			console.error('Error logging in', error);
			viewError = 'Error logging in. Please try again.';
		} else {
			window.localStorage.setItem('userInfo', JSON.stringify({ username }));
			viewError = null;

			goto('/protected');
		}
	};
</script>

<svelte:head><title>Login</title></svelte:head>

<div class="border shadow-xl rounded my-32 mx-auto p-8 max-w-xl">
	<h2 class="text-2xl font-bold mb-8">Login</h2>

	<!-- No purpose to the form itself, other than making browsers
	happy -- https://www.chromium.org/developers/design-documents/create-amazing-password-forms/ -->
	<form>
		<div class="grid gap-2">
			<label for="username">Username</label>
			<input type="text" id="username" required autocomplete="username" bind:value={username} />
			<label for="password">Password</label>
			<input
				type="password"
				id="password"
				required
				autocomplete="current-password"
				bind:value={password}
			/>
		</div>

		<div class="mt-4">
			<button
				class="border px-4 py-1 bg-blue-300 hover:bg-blue-100 font-bold"
				type="button"
				on:click={login}>Log in</button
			>
		</div>
	</form>

	{#if viewError}
		<div class="mt-8 font-bold text-red-600">
			{viewError}
		</div>
	{/if}
</div>

<style class="postcss">
	input {
		@apply border p-1;
	}
</style>
