import React from 'react';
import { Table, Tbody, Td, Th, Thead, Tr } from './Table';
import { Working } from './Working';

const CustomerTable = ({ data }) => {
  return data ? (
    <Table>
      <Thead>
        <Tr>
          <Th>Id</Th>
          <Th>Text</Th>
          <Th>Value</Th>
          <Th>Customer</Th>
          <Th>USD Info</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map(row => (
          <Tr key={row.id}>
            <Td>{row.id}</Td>
            <Td>{row.text}</Td>
            <Td>{row.value}</Td>
            <Td>{row.customerName}</Td>
            <Td>{JSON.stringify(row.usdInfo, null, 2)}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <Working />
  );
};

export default React.memo(CustomerTable);
