import React from 'react';
import { Loader2 } from 'lucide-react';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerVariant = 'primary' | 'white' | 'light';

export interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const sizeStyles: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const variantStyles: Record<SpinnerVariant, string> = {
    primary: 'text-[#8b7355]',
    white: 'text-white',
    light: 'text-[#8b7355]/20',
  };

  const combinedClassName = `${sizeStyles[size]} ${variantStyles[variant]} animate-spin ${className}`.trim();

  return <Loader2 className={combinedClassName} aria-hidden="true" />;
};

export default Spinner;
