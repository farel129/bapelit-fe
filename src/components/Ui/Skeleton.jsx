// src/components/ui/Skeleton.jsx
import React from 'react';

const Skeleton = ({ width = '100%', height, radius = 'lg', className = '' }) => (
  <div
    className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded-${radius} ${className}`}
    style={{
      backgroundSize: '200% 100%',
      width,
      height,
    }}
  />
);

export default Skeleton;