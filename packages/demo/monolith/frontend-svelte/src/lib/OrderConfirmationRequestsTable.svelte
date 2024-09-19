<script>
  import { enhance } from '$app/forms';

  import Table from './table/Table.svelte';
  import Tbody from './table/Tbody.svelte';
  import Td from './table/Td.svelte';
  import Th from './table/Th.svelte';
  import Thead from './table/Thead.svelte';
  import Tr from './table/Tr.svelte';
  import Working from './Working.svelte';
  import Button from '$lib/Button.svelte';
  //import { postCommand } from '$lib/commands.js';

  export let store;

  const confirm = (id) =>  () => {
    // postCommand({
    //   aggregateName: 'order',
    //   aggregateId: id,
    //   command: 'CONFIRM',
    //   payload: { },
    // });

  };
</script>

{#if !$store.loaded}
  <Working />
{:else if $store.isEmpty}
  <div class="p-2 bg-yellow-200">No data</div>
{:else}
  <Table>
    <Thead>
    <Tr>
      <Th>Order Id</Th>
      <Th>Text</Th>
      <Th>Value</Th>
      <Th>Customer</Th>
      <Th>Status</Th>
      <Th>Action</Th>
    </Tr>
    </Thead>
    <Tbody>
    {#each $store.data as row}
      <Tr>
        <Td>{row.id}</Td>
        <Td>{row.text}</Td>
        <Td>{row.value}</Td>
        <Td>{row.customerName}</Td>
        <Td warn={row.status !== 'confirmed'}>{row.status}</Td>
        <Td>
          {#if row.status === 'unconfirmed'}
            <form method="POST" action="?/confirm" use:enhance>
              <input type="hidden" name="orderId" value={row.id} />
              <Button kind="inline" text="Confirm" submit  />
            </form>
          {/if}
        </Td>
      </Tr>
    {/each}
    </Tbody>
  </Table>
{/if}
