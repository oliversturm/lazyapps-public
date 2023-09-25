import React from 'react';

// Unfortunately the CDN version does not seem to include the
// focus:ring-cyan-200 style. Pity.

const TextInput = props => (
  <input
    className="border rounded px-2 ml-2 focus:ring-1 focus:ring-cyan-200"
    type="text"
    {...props}
  />
);

export default React.memo(TextInput);
