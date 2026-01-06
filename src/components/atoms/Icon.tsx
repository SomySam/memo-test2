import React from 'react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg';
export type IconColor = 'primary' | 'secondary' | 'muted' | 'white' | 'danger' | 'success';

export interface IconProps {
  icon: React.ReactNode;
  size?: IconSize;
  color?: IconColor;
  className?: string;
}

const Icon: React.FC<IconProps> = ({
  icon,
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeStyles: Record<IconSize, string> = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const colorStyles: Record<IconColor, string> = {
    primary: 'text-[#8b7355]',
    secondary: 'text-[#5c4033]',
    muted: 'text-gray-400',
    white: 'text-white',
    danger: 'text-red-500',
    success: 'text-green-500',
  };

  const combinedClassName = `${sizeStyles[size]} ${colorStyles[color]} ${className}`.trim();

  return (
    <span className={combinedClassName} aria-hidden="true">
      {icon}
    </span>
  );
};

export default Icon;
