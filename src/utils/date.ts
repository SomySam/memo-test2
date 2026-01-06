import { UI_CONSTANTS } from '@/constants';

/**
 * 타임스탬프를 사용자 친화적인 날짜 형식으로 변환
 * - 오늘: 시:분 형식
 * - 과거: 년 월 일 형식
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < UI_CONSTANTS.MILLISECONDS_PER_DAY && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
};
