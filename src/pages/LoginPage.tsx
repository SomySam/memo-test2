import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User as UserIcon } from 'lucide-react';
import { auth, db } from '@/config/firebase';
import Button from '@/components/atoms/Button';
import InputField from '@/components/molecules/InputField';
import PasswordInput from '@/components/molecules/PasswordInput';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Modal from '@/components/Modal';
import { useModalStore } from '@/stores/modalStore';
import { COLLECTIONS, ERROR_MESSAGES, ROUTES, UI_CONSTANTS } from '@/constants';
import { validateEmail, validatePassword } from '@/utils/validation';
import { logError, parseFirebaseError } from '@/utils/logger';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    isOpen,
    title,
    message,
    type,
    primaryLabel,
    secondaryLabel,
    onPrimaryAction,
    countdown,
    openModal,
    closeModal,
    startCountdown,
  } = useModalStore();

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 컴포넌트 마운트 시 모달 초기화
  useEffect(() => {
    closeModal();
  }, [closeModal]);

  useEffect(() => {
    const trimmedEmail = email.trim();
    if (trimmedEmail.length > 0) {
      setEmailError(validateEmail(trimmedEmail) ? '' : ERROR_MESSAGES.AUTH.INVALID_EMAIL);
    } else {
      setEmailError('');
    }
  }, [email]);

  useEffect(() => {
    if (password.length > 0) {
      setPasswordError(validatePassword(password) ? '' : ERROR_MESSAGES.AUTH.PASSWORD_TOO_SHORT);
    } else {
      setPasswordError('');
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = email.trim();
    if (emailError || passwordError || !finalEmail || !password) return;

    setLoading(true);
    try {
      if (isLogin) {
        try {
          await setPersistence(auth, browserLocalPersistence);
          await signInWithEmailAndPassword(auth, finalEmail, password);
          navigate(ROUTES.MEMO);
        } catch (authError) {
          logError('Sign In', authError);
          const errorCode = parseFirebaseError(authError);

          if (errorCode === 'auth/user-not-found') {
            openModal({
              title: '가입된 계정 없음',
              message: `입력하신 이메일(${finalEmail})은\n아직 회원이 아닙니다.\n회원가입 페이지로 이동할까요?`,
              type: 'confirm',
              primaryLabel: '회원가입 하기',
              secondaryLabel: '취소',
              onPrimaryAction: () => {
                setIsLogin(false);
                closeModal();
              },
            });
          } else if (
            errorCode === 'auth/wrong-password' ||
            errorCode === 'auth/invalid-credential'
          ) {
            openModal({
              title: '로그인 실패',
              message: ERROR_MESSAGES.AUTH.PASSWORD_MISMATCH + '\n다시 한번 확인해 주세요.',
              type: 'error',
              primaryLabel: '다시 시도',
              onPrimaryAction: closeModal,
            });
            startCountdown(UI_CONSTANTS.AUTO_CLOSE_COUNTDOWN_SECONDS, () => {});
          } else {
            openModal({
              title: '로그인 실패',
              message: '로그인 중 오류가 발생했습니다.\n다시 시도해 주세요.',
              type: 'error',
              primaryLabel: '다시 시도',
              onPrimaryAction: closeModal,
            });
          }
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, finalEmail, password);
        const finalNickname = nickname.trim() || finalEmail.split('@')[0];

        await updateProfile(userCredential.user, {
          displayName: finalNickname,
        });

        await setDoc(doc(db, COLLECTIONS.USERS, finalEmail), {
          uid: userCredential.user.uid,
          email: finalEmail,
          nickname: finalNickname,
          createdAt: serverTimestamp(),
        });

        navigate(ROUTES.MEMO);
      }
    } catch (error) {
      logError('Auth Exception', error);
      openModal({
        title: '오류 발생',
        message: ERROR_MESSAGES.NETWORK.CONNECTION_ERROR,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result.user?.email) {
        await setDoc(
          doc(db, COLLECTIONS.USERS, result.user.email),
          {
            uid: result.user.uid,
            email: result.user.email,
            nickname: result.user.displayName || result.user.email.split('@')[0],
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
        navigate(ROUTES.MEMO);
      }
    } catch (error) {
      logError('Google Sign In', error);
      openModal({
        title: '구글 로그인 실패',
        message: '로그인 중 오류가 발생했습니다.\n다시 시도해 주세요.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, openModal]);

  const handleModeSwitch = useCallback(() => {
    setIsLogin((prev) => !prev);
    setEmailError('');
    setPasswordError('');
    closeModal();
  }, [closeModal]);

  return (
    <div
      className="relative flex flex-col bg-[#F8F3E0]"
      style={{
        backgroundImage: "url('/bg_image2.png')",
        backgroundPosition: '0 130%',
        backgroundSize: '100% auto',
        backgroundRepeat: 'no-repeat',
        height: '100vh',
      }}
    >
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={title}
        message={message}
        type={type}
        primaryLabel={primaryLabel}
        onPrimaryAction={onPrimaryAction}
        secondaryLabel={secondaryLabel}
        countdown={countdown}
      />

      <div className="flex flex-col items-center justify-center px-8 pt-20">
        <div className="mb-10 text-center">
          <div className="relative inline-block">
            <img
              src="/logo.png"
              alt="Memo Logo"
              className="w-28 h-28 opacity-90 object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
            <div className="mt-4">
              <span className="text-3xl font-black tracking-widest text-[#5c4033]">MEMO</span>
              <p className="text-xs text-[#8b7355] mt-1 font-medium">나만의 안전한 기록 공간</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {!isLogin && (
            <InputField
              type="text"
              placeholder="사용하실 닉네임"
              icon={<UserIcon />}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              aria-label="닉네임"
            />
          )}

          <InputField
            id="email"
            type="email"
            placeholder="이메일 주소"
            icon={<Mail />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            errorMessage={emailError}
            required
            aria-label="이메일"
          />

          <PasswordInput
            id="password"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorMessage={passwordError}
            required
            aria-label="비밀번호"
          />

          <Button
            type="submit"
            disabled={loading || !!emailError || !!passwordError}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
            aria-label={isLogin ? '로그인' : '회원가입'}
          >
            {isLogin ? '로그인' : '회원가입'}
          </Button>
        </form>

        <div className="flex items-center w-full my-6 text-[#8b7355]/30">
          <div className="flex-1 h-px bg-current"></div>
          <span className="px-4 text-[10px] font-black tracking-widest uppercase">Social</span>
          <div className="flex-1 h-px bg-current"></div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          variant="secondary"
          size="md"
          fullWidth
          icon={
            <img src="/Logo-google-icon-PNG.png" alt="" className="w-5 h-5" aria-hidden="true" />
          }
          aria-label="Google로 로그인"
        >
          Google로 로그인 ^^
        </Button>
      </div>

      <div className="p-8 text-center">
        <p className="text-[#8b7355]/60 text-sm">
          {isLogin ? '계정이 없으신가요?' : '회원이신가요?'}
          <button
            onClick={handleModeSwitch}
            className="font-bold text-[#8b7355] ml-2 hover:underline"
            aria-label={isLogin ? '회원가입 화면으로 전환' : '로그인 화면으로 전환'}
          >
            {isLogin ? '가입하기' : '로그인하기'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
