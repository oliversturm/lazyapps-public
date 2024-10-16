<script>
  import { v4 as uuid } from 'uuid';

  import Button from './Button.svelte';

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
        <Th />
        <Th>Id</Th>
        <Th>Name</Th>
      </Tr>
    </Thead>
    <Tbody>
      {#each $store.data as row}
        <Tr>
          <Td>
            <Button kind="inline" text="Edit" target={`/customer/${row.id}`} />
            <Button
              kind="inline"
              text="Place Order"
              target={`/order/${row.id}/${uuid()}`}
            />
          </Td>
          <Td>{row.id}</Td>
          <Td>{row.name}</Td>
        </Tr>
      {/each}
    </Tbody>
  </Table>
{/if}
