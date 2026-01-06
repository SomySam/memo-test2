import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = '', ...props }, ref) => {
    const baseStyles = 'w-full px-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b7355] bg-white text-[#5c4033] transition-all';
    const errorStyles = error ? 'border-red-400' : 'border-[#8b7355]/20';
    const combinedClassName = `${baseStyles} border ${errorStyles} ${className}`.trim();

    return (
      <input
        ref={ref}
        className={combinedClassName}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
