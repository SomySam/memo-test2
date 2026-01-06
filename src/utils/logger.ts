/**
 * 개발 환경에서만 에러 로깅
 * 프로덕션 환경에서는 민감 정보 노출 방지
 */
export const logError = (context: string, error: unknown): void => {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
};

/**
 * 개발 환경에서만 일반 로그 출력
 */
export const logInfo = (context: string, message: string): void => {
  if (import.meta.env.DEV) {
    console.log(`[${context}]`, message);
  }
};

/**
 * Firebase 에러 코드 파싱
 */
export const parseFirebaseError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return (error as { code: string }).code;
  }
  return 'unknown';
};
