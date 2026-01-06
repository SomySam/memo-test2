import { UI_CONSTANTS } from '@/constants';

/**
 * 이메일 형식 검증
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * 비밀번호 길이 검증
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= UI_CONSTANTS.MIN_PASSWORD_LENGTH;
};

/**
 * 메모 내용 검증
 */
export const validateMemoContent = (content: string): boolean => {
  const trimmed = content.trim();
  return trimmed.length > 0 && trimmed.length <= UI_CONSTANTS.MAX_MEMO_LENGTH;
};

/**
 * 닉네임 검증
 */
export const validateNickname = (nickname: string): boolean => {
  const trimmed = nickname.trim();
  return trimmed.length > 0 && trimmed.length <= UI_CONSTANTS.MAX_NICKNAME_LENGTH;
};
