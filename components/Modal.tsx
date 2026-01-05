
import React from 'react';
import { AlertCircle, CheckCircle, HelpCircle, Clock } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'error' | 'confirm' | 'success';
  primaryLabel?: string;
  onPrimaryAction?: () => void;
  secondaryLabel?: string;
  countdown?: number | null; // 추가: 카운트다운 숫자
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  primaryLabel = '확인',
  onPrimaryAction,
  secondaryLabel,
  countdown = null
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error': return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'success': return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'confirm': return <HelpCircle className="w-8 h-8 text-[#8b7355]" />;
      default: return <AlertCircle className="w-8 h-8 text-[#8b7355]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#fdfaf1] w-full max-w-xs rounded-[32px] shadow-2xl overflow-hidden border border-white/50 animate-in zoom-in-95 duration-200">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="mb-5 p-4 bg-white rounded-2xl shadow-sm relative">
            {getIcon()}
            {countdown !== null && (
              <div className="absolute -top-2 -right-2 bg-[#8b7355] text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center animate-bounce shadow-md">
                {countdown}
              </div>
            )}
          </div>
          <h3 className="text-xl font-black text-[#5c4033] mb-3 leading-tight">{title}</h3>
          <p className="text-sm text-[#8b7355] leading-relaxed whitespace-pre-wrap font-medium">{message}</p>
          
          {countdown !== null && (
            <div className="mt-4 flex items-center space-x-1.5 text-[#8b7355]/40">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {countdown}초 후 자동으로 닫힙니다
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white/50 flex flex-col space-y-2">
          <button
            onClick={() => {
              if (onPrimaryAction) onPrimaryAction();
              else onClose();
            }}
            className="w-full py-4 bg-[#8b7355] text-white rounded-2xl font-bold hover:bg-[#7a654a] transition-all active:scale-95 shadow-md flex items-center justify-center space-x-2"
          >
            <span>{primaryLabel}</span>
          </button>
          {secondaryLabel && (
            <button
              onClick={onClose}
              className="w-full py-4 bg-white text-[#8b7355] border border-[#8b7355]/20 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
