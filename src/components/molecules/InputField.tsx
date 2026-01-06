import React from 'react';
import Input, { InputProps } from '@/components/atoms/Input';

export interface InputFieldProps extends InputProps {
  icon?: React.ReactNode;
  errorMessage?: string;
  label?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  icon,
  errorMessage,
  label,
  error,
  className = '',
  ...inputProps
}) => {
  const hasError = !!errorMessage || error;

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs font-medium text-[#8b7355] px-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <div className={`w-5 h-5 ${hasError ? 'text-red-400' : 'text-[#8b7355]/50'}`}>
              {icon}
            </div>
          </div>
        )}
        <Input
          className={`${icon ? 'pl-12' : ''} ${className}`}
          error={hasError}
          aria-invalid={hasError}
          aria-describedby={errorMessage ? `${inputProps.id}-error` : undefined}
          {...inputProps}
        />
      </div>
      {errorMessage && (
        <p
          id={`${inputProps.id}-error`}
          className="text-[10px] text-red-500 px-2 font-black uppercase tracking-tight"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default InputField;
