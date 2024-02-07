<script>
  import { onMount, onDestroy } from 'svelte';
  import qrcode from 'qrcode';

  import { query } from '$lib/query.js';
  import { postCommand } from '$lib/commands.js';
  import { readModelStore } from '$lib/readModelStore.js';

  const readModelEndpoint = import.meta.env.VITE_RM_INGAME_URL;
  const socketIoEndpoint = import.meta.env.VITE_CHANGE_NOTIFIER_URL;

  export let gameSessionId;

  const handleRows = (data) => {
    const rows = [];
    if (!data) return rows;
    const rowCount = Math.min(20, data.length);
    const usedIndexes = [];
    for (let i = 0; i < rowCount; i++) {
      let index;
      do {
        index = Math.floor(Math.random() * data.length);
      } while (usedIndexes.includes(index));
      rows.push(data[index]);
      usedIndexes.push(index);
    }
    return { viewRows: rows, totalCount: data.length };
  };

  // we initialize this component here, since it will be
  // created only if the correct state is reached

  let store;

  onMount(() => {
    query(fetch)(readModelEndpoint, 'gameSessions', 'fffPlayerViewNames', {
      gameSessionId
    }).then((data) => {
      store = readModelStore(
        data,
        'rm-ingame',
        socketIoEndpoint,
        'gameSessions',
        'fffPlayerViewNames'
      );
    });

    qrcode.toCanvas(qrCanvas, publicUrl, {
      width: 300
    });
  });

  onDestroy(() => {
    store?.destroy();
    store = null;
  });

  $: ({ viewRows, totalCount } = !$store || $store?.isEmpty ? {
    viewRows: [],
    totalCount: 0
  } : handleRows($store.data));

  $: publicUrl = `${import.meta.env.VITE_PUBLIC_URL_BASE}/public/live/${gameSessionId}`;

  let qrCanvas;

  const endFffRegistration = () => {
    postCommand({
      aggregateName: 'gameSession',
      aggregateId: gameSessionId,
      command: 'END_FFF_REGISTRATION',
      payload: {}
    });
  };

  const oddNumberOfLetters = (name) => {
    return name.length % 2 === 1;
  };
</script>

<h1>Register for Fastest Finger First</h1>

<div class="text-yellow-500 underline font-mono">{publicUrl}</div>

<canvas class="my-4" bind:this={qrCanvas} width="300" height="300" />

<div class="text-2xl text-yellow-500 max-w-xl mb-2">Registrations: {totalCount}</div>

<div class="flex flex-wrap gap-4 text-2xl text-yellow-500 max-w-xl">
  {#each viewRows as row}
    <!-- some basic randomization to the layout -->
    <div class={oddNumberOfLetters(row.viewName) ? 'mx-1 my-4' : 'mx-4 my-1'}>{row.viewName}</div>
  {/each}
</div>

<button class="control my-4" on:click={endFffRegistration}>End Registration</button>
