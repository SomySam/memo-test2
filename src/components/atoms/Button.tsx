import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center space-x-2';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-[#8b7355] text-white hover:bg-[#7a654a] shadow-lg',
    secondary: 'bg-white text-[#8b7355] border border-[#8b7355]/10 hover:shadow-md shadow-sm',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'text-gray-400 hover:text-[#8b7355] border border-dashed border-gray-200 hover:border-[#8b7355]/20',
    icon: 'p-2 bg-[#a89078] text-white hover:bg-white/20 rounded-2xl shadow-md',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-xl',
  };

  const disabledStyles = disabled || loading
    ? 'opacity-50 cursor-not-allowed grayscale pointer-events-none'
    : '';

  const widthStyles = fullWidth ? 'w-full' : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles} ${className}`.trim();

  return (
    <button
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      ) : (
        <>
          {icon && <span aria-hidden="true">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
