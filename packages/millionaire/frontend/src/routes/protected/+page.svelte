<script>
	export let data;
	$: ({
		userInfo: { username }
	} = data);
</script>

<svelte:head><title>Protected area</title></svelte:head>

<div class="mx-auto max-w-xl">
	<div class="my-4">
		<a class="mbutton blue" href="/protected/admin/games">Games</a>
		<a class="mbutton blue" href="/protected/admin/gameSessions">Sessions</a>
		<a class="mbutton red" data-sveltekit-preload-data="off" href="/protected/logout">Log out</a>
	</div>

	<p>Logged in as a valid user: {JSON.stringify(username)}</p>
</div>
