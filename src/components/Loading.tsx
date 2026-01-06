import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'LOADING' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fdfaf1]">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-12 h-12 text-[#8b7355] animate-spin" aria-hidden="true" />
        <p className="text-xs font-bold text-[#8b7355]/40 tracking-widest" role="status">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Loading;
