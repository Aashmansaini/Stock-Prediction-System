import React from 'react';

const ChangeBadge = ({ value }) => {
  const positive = value >= 0;
  return (
    <span
      className={`font-medium tracking-tight ${
        positive ? 'text-[#34C759]' : 'text-[#FF3B30]'
      }`}
    >
      {positive ? '+' : ''}{value.toFixed(2)}
    </span>
  );
};

export default ChangeBadge;
