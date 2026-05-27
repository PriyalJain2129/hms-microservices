import React from 'react';

const Badge = ({ text }) => {
  let colorClass = 'bg-slate-500/20 text-slate-400';

  const cleanText = text ? text.toUpperCase() : '';

  if (cleanText === 'SCHEDULED') {
    colorClass = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
  } else if (cleanText === 'COMPLETED') {
    colorClass = 'bg-green-500/20 text-green-400 border border-green-500/30';
  } else if (cleanText === 'CANCELLED') {
    colorClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
  } else if (cleanText === 'PAID') {
    colorClass = 'bg-green-500/20 text-green-400 border border-green-500/30';
  } else if (cleanText === 'PENDING') {
    colorClass = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  } else if (cleanText === 'OVERDUE') {
    colorClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block uppercase tracking-wider ${colorClass}`}>
      {text}
    </span>
  );
};

export default Badge;
