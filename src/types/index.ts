export interface Memo {
  id: string;
  content: string;
  createdAt: number;
  userId: string;
  updatedAt?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  nickname: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'error' | 'confirm' | 'success' | 'info';
  primaryLabel?: string;
  onPrimaryAction?: () => void;
  secondaryLabel?: string;
  countdown?: number | null;
}

export interface FirebaseError {
  code: string;
  message: string;
}
