
# Simple Memo App (React + Firebase)

이 프로젝트는 React, TypeScript, Tailwind CSS를 사용하여 개발되었습니다.

## Firebase 연동을 위해 필요한 정보
2차 개발 시 `firebase.ts` 파일의 `firebaseConfig` 객체에 다음 정보를 입력해야 합니다.

1. **API Key**: Firebase 프로젝트 설정의 웹 앱 구성에서 확인 가능
2. **Auth Domain**: `[PROJECT_ID].firebaseapp.com`
3. **Project ID**: Firebase 프로젝트의 고유 ID
4. **Storage Bucket**: `[PROJECT_ID].appspot.com`
5. **Messaging Sender ID**: 클라우드 메시징 설정을 위한 발신자 ID
6. **App ID**: Firebase 웹 앱의 고유 ID

## 주요 기능
- 로그인/회원가입 UI (로그인 페이지 디자인 반영)
- 메모 작성 및 목록 표시
- 최근 저장된 메모 관리
- 프로필 관리 및 로그아웃/탈퇴 기능

## 디자인 가이드
- 메인 테마 색상: `#8b7355` (브라운 계열)
- 배경색: `#fdfaf1` (연한 베이지)
- 아이콘: Lucide-react 라이브러리 활용
- 폰트: Inter (시스템 기본 샌즈세리프)
