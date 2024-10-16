<script>
  import Table from './table/Table.svelte';
  import Tbody from './table/Tbody.svelte';
  import Td from './table/Td.svelte';
  import Th from './table/Th.svelte';
  import Thead from './table/Thead.svelte';
  import Tr from './table/Tr.svelte';
  import Working from './Working.svelte';

  export let store;
</script>

{#if !$store.loaded}
  <Working />
{:else if $store.isEmpty}
  <div class="p-2 bg-yellow-200">No data</div>
{:else}
  <Table>
    <Thead>
      <Tr>
        <Th>Id</Th>
        <Th>Text</Th>
        <Th>Value</Th>
        <Th>Customer</Th>
        <Th>Status</Th>
        <Th>USD Info</Th>
      </Tr>
    </Thead>
    <Tbody>
      {#each $store.data as row}
        <Tr  warn={row.status !== 'confirmed'}>
          <Td>{row.id}</Td>
          <Td>{row.text}</Td>
          <Td>{row.value}</Td>
          <Td>{row.customerName}</Td>
          <Td warn={row.status !== 'confirmed'}>{row.status}</Td>
          <Td>{JSON.stringify(row.usdInfo, null, 2)}</Td>
        </Tr>
      {/each}
    </Tbody>
  </Table>
{/if}
