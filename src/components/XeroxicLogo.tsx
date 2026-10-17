import React from 'react';

interface XeroxicLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const XeroxicLogo: React.FC<XeroxicLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  let heightClass = 'h-8';
  if (size === 'sm') heightClass = 'h-6';
  if (size === 'lg') heightClass = 'h-12';

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src="/xeroxic-logo-cropped.png"
        alt="Xeroxic Logo"
        className={`${heightClass} w-auto object-contain mix-blend-multiply`}
        loading="eager"
      />
    </div>
  );
};
