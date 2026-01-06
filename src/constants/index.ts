// Firebase Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  MEMOS: 'memos',
  MEMO: 'memo',
} as const;

// UI Constants
export const UI_CONSTANTS = {
  MAX_MEMO_LENGTH: 10000,
  MIN_PASSWORD_LENGTH: 6,
  MAX_NICKNAME_LENGTH: 50,
  AUTO_CLOSE_COUNTDOWN_SECONDS: 3,
  MILLISECONDS_PER_DAY: 24 * 60 * 60 * 1000,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_EMAIL: '올바른 이메일 형식이 아닙니다.',
    PASSWORD_TOO_SHORT: '비밀번호는 6자 이상이어야 합니다.',
    ACCOUNT_NOT_FOUND: '가입된 계정이 없습니다.',
    PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',
    REQUIRES_RECENT_LOGIN: '보안을 위해 다시 로그인한 후 시도해주세요.',
  },
  MEMO: {
    LOAD_FAILED: '메모를 가져오는 중 문제가 발생했습니다.',
    SAVE_FAILED: '메모를 저장하지 못했습니다.',
    UPDATE_FAILED: '메모를 수정하지 못했습니다.',
    DELETE_FAILED: '메모 삭제 중 오류가 발생했습니다.',
  },
  PROFILE: {
    UPDATE_FAILED: '정보 업데이트 중 오류가 발생했습니다.',
    LOGOUT_FAILED: '로그아웃 중 문제가 발생했습니다.',
    DELETE_ACCOUNT_FAILED: '탈퇴 처리 중 오류가 발생했습니다.',
  },
  NETWORK: {
    CONNECTION_ERROR: '서비스 연결이 원활하지 않습니다.\n인터넷 연결을 확인해 주세요.',
  },
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  MEMO: '/memo',
  PROFILE: '/profile',
} as const;

// Sort Options
export const SORT_OPTIONS = {
  NEWEST_FIRST: 'newest',
  OLDEST_FIRST: 'oldest',
} as const;

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];
