import React, { memo, useMemo } from 'react';

const styles = {
  toolbar:
    'bg-orange-400 hover:bg-amber-300 py-1 px-2 mx-1 rounded disabled:bg-gray-200',
  separate:
    'bg-cyan-400 hover:bg-sky-300 py-1 px-2 mt-4 mr-1 rounded disabled:bg-gray-200',
  inline:
    'bg-cyan-300 hover:bg-sky-200  px-2 mx-1 rounded disabled:bg-gray-200',
};

const Button = ({
  onClick,
  text,
  kind = 'separate',
  submit = false,
  disabled = false,
}) => {
  const className = useMemo(() => styles[kind], [kind]);

  return (
    <button
      className={className}
      onClick={onClick}
      type={submit ? 'submit' : 'button'}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default memo(Button);
