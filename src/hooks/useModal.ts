import { useState, useRef, useEffect } from 'react';
import { ModalConfig } from '@/types';

interface UseModalReturn {
  modalConfig: ModalConfig;
  countdown: number | null;
  openModal: (config: Omit<ModalConfig, 'isOpen'>) => void;
  closeModal: () => void;
  startCountdown: (seconds: number, callback: () => void) => void;
}

export const useModal = (): UseModalReturn => {
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
    setCountdown(null);
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const openModal = (config: Omit<ModalConfig, 'isOpen'>) => {
    setModalConfig({ ...config, isOpen: true });
  };

  const closeModal = () => {
    clearAllTimers();
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const startCountdown = (seconds: number, callback: () => void) => {
    clearAllTimers();
    setCountdown(seconds);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = setTimeout(() => {
      callback();
      closeModal();
    }, seconds * 1000);
  };

  return {
    modalConfig,
    countdown,
    openModal,
    closeModal,
    startCountdown,
  };
};
