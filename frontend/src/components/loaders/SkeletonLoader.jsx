import React from 'react';
import { useTheme } from '../../hooks/useTheme';

const SkeletonLoader = ({ count = 8 }) => {
  const { currentTheme } = useTheme();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse rounded-3xl h-80 ${currentTheme === 'midnight' ? 'bg-neutral-900' : 'bg-neutral-100'}`}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
