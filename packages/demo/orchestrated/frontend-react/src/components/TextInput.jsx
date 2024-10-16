import React from 'react';

// Unfortunately the CDN version does not seem to include the
// focus:ring-cyan-200 style. Pity.

const TextInput = (props) => (
  <input
    {...props}
    type="text"
    className={`${props.className} border rounded px-2 ml-2 focus:ring-1 focus:ring-cyan-200`}
  />
);

export default React.memo(TextInput);
