<script>
	export let answer;
</script>

<div class="flex flex-row text-xl font-bold gap-2">
	{#each answer as letter}
		<div class="my-4 marker enabled">{letter}</div>
	{:else}
		<div class="public-large">Click the buttons in the right order</div>
	{/each}
</div>
