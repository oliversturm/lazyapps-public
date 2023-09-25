import React from 'react';

export const Table = React.memo(({ children }) => (
  <table className="table-auto">{children}</table>
));

export const Thead = React.memo(({ children }) => (
  <thead className="bg-blue-100">{children}</thead>
));

export const Th = React.memo(({ children }) => (
  <th className="p-2">{children}</th>
));

export const Tr = React.memo(({ children }) => <tr>{children}</tr>);

export const Tbody = React.memo(({ children }) => (
  <tbody className="bg-sky-50">{children}</tbody>
));

export const Td = React.memo(({ children }) => (
  <td className="py-2 px-4">{children}</td>
));
