import React from 'react';
import RefreshIcon from './icons/RefreshIcon';

export const Working = React.memo(() => (
  <div className="flex text-2xl place-items-center">
    <div className="mr-2 animate-spin transform rotate-180">
      <RefreshIcon />
    </div>
    Working...
  </div>
));
