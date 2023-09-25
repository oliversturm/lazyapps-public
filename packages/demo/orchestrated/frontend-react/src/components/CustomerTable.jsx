import React from 'react';
import Button from './Button';
import { Table, Tbody, Td, Th, Thead, Tr } from './Table';
import { Working } from './Working';

const CustomerTable = ({ data, rowEdit, onPlaceOrder }) => {
  return data ? (
    <Table>
      <Thead>
        <Tr>
          <Th />
          <Th>Id</Th>
          <Th>Name</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map(row => (
          <Tr key={row.id}>
            <Td>
              <Button
                kind="inline"
                onClick={() => rowEdit(row.id)}
                text="Edit"
              />
              <Button
                kind="inline"
                onClick={() => onPlaceOrder(row.id)}
                text="Place Order"
              />
            </Td>
            <Td>{row.id}</Td>
            <Td>{row.name}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <Working />
  );
};

export default React.memo(CustomerTable);
