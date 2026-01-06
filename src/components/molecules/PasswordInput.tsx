import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import InputField, { InputFieldProps } from './InputField';

export interface PasswordInputProps extends Omit<InputFieldProps, 'type' | 'icon'> {
  showToggle?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  showToggle = true,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <InputField
        type={showPassword ? 'text' : 'password'}
        icon={<Lock />}
        className={`${showToggle ? 'pr-12' : ''} ${className}`}
        {...props}
      />
      {showToggle && (
        <button
          type="button"
          className="absolute top-4 right-4 text-[#8b7355]/50 hover:text-[#8b7355] transition-colors"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Eye className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
};

export default PasswordInput;
