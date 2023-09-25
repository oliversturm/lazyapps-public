import React, { memo } from 'react';

const ValidationLabel = ({ children }) => (
  <div className="text-xs text-red-500 text-right pr-2">{children}</div>
);

export default memo(ValidationLabel);
