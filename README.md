# MEMO - 나만의 안전한 기록 공간

React + TypeScript + Firebase 기반의 간편한 메모 관리 애플리케이션입니다.

## 🚀 주요 기능

- ✅ 이메일/비밀번호 및 Google OAuth 인증
- ✅ 실시간 메모 동기화
- ✅ 메모 CRUD (생성, 읽기, 수정, 삭제)
- ✅ 메모 정렬 (최신순/오래된순)
- ✅ 사용자 프로필 관리
- ✅ 반응형 모바일 우선 디자인

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript 5.8
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 3, PostCSS
- **Backend**: Firebase (Authentication, Firestore)
- **Build Tool**: Vite 6
- **Code Quality**: ESLint, Prettier
- **Icons**: Lucide React

## 📁 프로젝트 구조

```
memo-test2-main/
├── public/              # 정적 파일 (이미지, 로고)
├── src/
│   ├── components/      # 재사용 가능한 UI 컴포넌트
│   ├── config/          # Firebase 설정
│   ├── constants/       # 상수 정의
│   ├── hooks/           # Custom React Hooks
│   ├── pages/           # 페이지 컴포넌트
│   ├── types/           # TypeScript 타입 정의
│   ├── utils/           # 유틸리티 함수
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── firestore.rules      # Firestore 보안 규칙
├── firestore.indexes.json
└── package.json
```

## 🔧 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 Firebase 설정을 입력하세요:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 프로덕션 빌드
```bash
npm run build
```

## 📝 사용 가능한 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run preview` - 빌드 미리보기
- `npm run lint` - ESLint 검사
- `npm run lint:fix` - ESLint 자동 수정
- `npm run format` - Prettier 포맷팅
- `npm run type-check` - TypeScript 타입 체크

## 🔐 보안

### Firestore 보안 규칙
- 사용자는 자신의 데이터만 접근 가능
- 메모 내용 최대 10,000자 제한
- 닉네임 최대 50자 제한
- 서버 측 필드 검증

### Firebase 배포
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## 📱 반응형 디자인
- 모바일 우선 접근
- 최대 너비 448px로 최적화
- 태블릿 및 데스크톱 지원

---

**최근 업데이트**: 2026-01-05
- 프로젝트 구조 개선 (src 폴더 구조화)
- TypeScript 타입 안전성 강화
- Tailwind CSS 로컬 설치 및 최적화
- ESLint & Prettier 설정
- Custom Hooks (useAuth, useModal)
- 메모 정렬 기능 (최신순/오래된순)
- 보안 강화 (Firestore Security Rules)
- 접근성 개선 (ARIA labels)
