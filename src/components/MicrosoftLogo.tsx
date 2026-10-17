import React from 'react';

export const MicrosoftLogo: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 23 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Microsoft Logo"
    >
      <rect x="0" y="0" width="10.8" height="10.8" fill="#f25022" />
      <rect x="12.2" y="0" width="10.8" height="10.8" fill="#7fba00" />
      <rect x="0" y="12.2" width="10.8" height="10.8" fill="#00a4ef" />
      <rect x="12.2" y="12.2" width="10.8" height="10.8" fill="#ffb900" />
    </svg>
  );
};
