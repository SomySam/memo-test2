import { create } from 'zustand';
import { ModalConfig } from '@/types';

interface ModalState extends ModalConfig {
  openModal: (config: Omit<ModalConfig, 'isOpen'>) => void;
  closeModal: () => void;
  setCountdown: (countdown: number | null) => void;
  startCountdown: (seconds: number, callback: () => void) => void;
  timerRef: ReturnType<typeof setTimeout> | null;
  intervalRef: ReturnType<typeof setInterval> | null;
}

const defaultModalState: ModalConfig = {
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
  primaryLabel: undefined,
  onPrimaryAction: undefined,
  secondaryLabel: undefined,
  countdown: null,
};

export const useModalStore = create<ModalState>((set, get) => ({
  ...defaultModalState,
  timerRef: null,
  intervalRef: null,

  openModal: (config) =>
    set({
      ...config,
      isOpen: true,
    }),

  closeModal: () => {
    const state = get();
    if (state.timerRef) clearTimeout(state.timerRef);
    if (state.intervalRef) clearInterval(state.intervalRef);
    set({ ...defaultModalState, timerRef: null, intervalRef: null });
  },

  setCountdown: (countdown) => set({ countdown }),

  startCountdown: (seconds: number, callback: () => void) => {
    const state = get();

    // Clear existing timers
    if (state.timerRef) clearTimeout(state.timerRef);
    if (state.intervalRef) clearInterval(state.intervalRef);

    set({ countdown: seconds });

    const intervalRef = setInterval(() => {
      const currentState = get();
      const currentCountdown = currentState.countdown;

      if (currentCountdown === null || currentCountdown === undefined || currentCountdown <= 1) {
        if (currentState.intervalRef) clearInterval(currentState.intervalRef);
        set({ countdown: 0 });
      } else {
        set({ countdown: currentCountdown - 1 });
      }
    }, 1000);

    const timerRef = setTimeout(() => {
      callback();
      get().closeModal();
    }, seconds * 1000);

    set({ intervalRef, timerRef });
  },
}));
