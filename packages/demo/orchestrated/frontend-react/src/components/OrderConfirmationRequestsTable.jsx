import React from 'react';
import { Table, Tbody, Td, Th, Thead, Tr } from './Table';
import { Working } from './Working';
import Button from './Button.jsx';

const OrderConfirmationRequestsTable = ({ data, onConfirm }) => {
  return data ? (
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
        {data.map((row) => (
          <Tr key={row.id}>
            <Td>{row.id}</Td>
            <Td>{row.text}</Td>
            <Td>{row.value}</Td>
            <Td>{row.customerName}</Td>
            <Td warn={row.status !== 'confirmed'}>{row.status}</Td>
            <Td>
              {row.status !== 'confirmed' && (
                <Button
                  kind="inline"
                  onClick={() => onConfirm(row.id)}
                  text="Confirm"
                />
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  ) : (
    <Working />
  );
};

export default React.memo(OrderConfirmationRequestsTable);
