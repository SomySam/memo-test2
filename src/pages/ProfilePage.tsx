import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, updateProfile, updatePassword, deleteUser } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { LogOut, User as UserIcon, Mail, Shield, Camera, CheckCircle, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import Button from '@/components/atoms/Button';
import PasswordInput from '@/components/molecules/PasswordInput';
import { COLLECTIONS, ERROR_MESSAGES, ROUTES, UI_CONSTANTS } from '@/constants';
import { validateNickname, validatePassword } from '@/utils/validation';
import { logError, parseFirebaseError } from '@/utils/logger';
import { useAuthStore } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthStore();
  const {
    isOpen,
    title,
    message,
    type,
    primaryLabel,
    secondaryLabel,
    onPrimaryAction,
    openModal,
    closeModal,
  } = useModalStore();

  const [newNickname, setNewNickname] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // 구글 로그인 사용자 여부 확인
  const isGoogleUser = user?.providerData?.some((provider) => provider.providerId === 'google.com');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.email) return;
      try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.email));
        if (userDoc.exists()) {
          setNewNickname(userDoc.data().nickname);
        }
      } catch (error) {
        logError('Profile fetch', error);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchUserProfile();
  }, [user?.email]);

  const handleLogout = useCallback(() => {
    openModal({
      title: '로그아웃',
      message: '정말 로그아웃 하시겠습니까?',
      type: 'confirm',
      primaryLabel: '로그아웃',
      secondaryLabel: '취소',
      onPrimaryAction: async () => {
        try {
          await signOut(auth);
          closeModal();
          navigate(ROUTES.HOME, { replace: true });
        } catch (error) {
          logError('Logout', error);
          openModal({
            title: '오류',
            message: ERROR_MESSAGES.PROFILE.LOGOUT_FAILED,
            type: 'error',
          });
        }
      },
    });
  }, [openModal, closeModal, navigate]);

  const handleDeleteAccount = useCallback(() => {
    openModal({
      title: '계정 탈퇴',
      message: '정말 탈퇴하시겠습니까? 작성하신 모든 메모와 계정 정보가 영구적으로 삭제됩니다.',
      type: 'confirm',
      primaryLabel: '탈퇴하기',
      secondaryLabel: '취소',
      onPrimaryAction: async () => {
        if (!user?.email) return;

        openModal({
          title: '계정 탈퇴 처리 중...',
          message: '데이터를 영구적으로 삭제하고 있습니다. 잠시만 기다려주세요.',
          type: 'info',
          primaryLabel: '처리 중...',
          onPrimaryAction: undefined,
        });

        try {
          const userMemosRef = collection(db, COLLECTIONS.MEMOS, user.email, COLLECTIONS.MEMO);
          const memoSnapshot = await getDocs(userMemosRef);

          const batch = writeBatch(db);
          memoSnapshot.forEach((memoDoc) => {
            batch.delete(memoDoc.ref);
          });

          batch.delete(doc(db, COLLECTIONS.USERS, user.email));
          await batch.commit();
          await deleteUser(user);

          navigate(ROUTES.HOME, { replace: true });
        } catch (error) {
          logError('Delete Account', error);
          const errorCode = parseFirebaseError(error);

          if (errorCode === 'auth/requires-recent-login') {
            openModal({
              title: '재인증 필요',
              message:
                ERROR_MESSAGES.AUTH.REQUIRES_RECENT_LOGIN +
                '\n로그아웃 후 다시 로그인하여 시도해주세요.',
              type: 'error',
              primaryLabel: '로그아웃 하기',
              onPrimaryAction: async () => {
                await signOut(auth);
                navigate(ROUTES.HOME);
              },
            });
          } else {
            openModal({
              title: '탈퇴 실패',
              message: ERROR_MESSAGES.PROFILE.DELETE_ACCOUNT_FAILED + ' 다시 시도해주세요.',
              type: 'error',
            });
          }
        }
      },
    });
  }, [user, openModal, navigate]);

  const handleUpdateNickname = useCallback(async () => {
    const trimmedNickname = newNickname.trim();
    if (!validateNickname(trimmedNickname) || !user?.email || !user) return;

    setIsUpdating(true);
    try {
      await updateProfile(user, { displayName: trimmedNickname });

      await updateDoc(doc(db, COLLECTIONS.USERS, user.email), {
        nickname: trimmedNickname,
        updatedAt: serverTimestamp(),
      });

      refreshUser();

      openModal({
        title: '변경 완료',
        message: `닉네임이 '${trimmedNickname}'(으)로 변경되었습니다.`,
        type: 'success',
      });
    } catch (error) {
      logError('Update nickname', error);
      openModal({
        title: '변경 실패',
        message: ERROR_MESSAGES.PROFILE.UPDATE_FAILED,
        type: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  }, [newNickname, user, refreshUser, openModal]);

  const handleUpdatePassword = useCallback(async () => {
    if (!validatePassword(newPassword)) {
      openModal({
        title: '비밀번호 오류',
        message: ERROR_MESSAGES.AUTH.PASSWORD_TOO_SHORT,
        type: 'error',
      });
      return;
    }

    if (!user) return;

    setPasswordUpdating(true);
    try {
      await updatePassword(user, newPassword);
      openModal({
        title: '변경 성공',
        message: '비밀번호가 변경되었습니다.',
        type: 'success',
      });
      setNewPassword('');
      setShowPasswordChange(false);
    } catch (error) {
      logError('Update password', error);
      const errorCode = parseFirebaseError(error);

      if (errorCode === 'auth/requires-recent-login') {
        openModal({
          title: '재인증 필요',
          message: ERROR_MESSAGES.AUTH.REQUIRES_RECENT_LOGIN,
          type: 'error',
          onPrimaryAction: async () => {
            await signOut(auth);
            navigate(ROUTES.HOME);
          },
        });
      } else {
        openModal({
          title: '변경 실패',
          message: '비밀번호 변경에 실패했습니다.',
          type: 'error',
        });
      }
    } finally {
      setPasswordUpdating(false);
    }
  }, [newPassword, user, openModal, navigate]);

  return (
    <div className="flex flex-col h-full bg-[#fdfaf1]">
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={title}
        message={message}
        type={type}
        primaryLabel={primaryLabel}
        onPrimaryAction={onPrimaryAction}
        secondaryLabel={secondaryLabel}
      />

      <div className="bg-[#8b7355] p-8 pb-10 flex flex-col items-center text-white relative">
        <div className="relative mb-4 group">
          <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-[#a89078] flex items-center justify-center shadow-xl">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="프로필 사진" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-12 h-12" aria-hidden="true" />
            )}
          </div>
          <div
            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg text-[#8b7355] cursor-pointer hover:scale-110 transition-transform"
            role="button"
            aria-label="프로필 사진 변경"
          >
            <Camera className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
        <h3 className="text-xl font-bold">
          {profileLoading ? '...' : newNickname || user?.email?.split('@')[0]}님
        </h3>
        <p className="text-white/70 text-sm mt-1">{user?.email}</p>
      </div>

      <div className="flex-1 bg-white -mt-10 h-full px-8 py-10 shadow-2xl space-y-8 overflow-y-auto">
        <h4 className="text-xs font-black text-[#8b7355] uppercase tracking-widest mb-4 p-4">
          Account Settings
        </h4>

        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#fdfaf1] rounded-2xl text-[#8b7355]">
              <UserIcon className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium">Nickname</p>
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="w-full text-[#5c4033] font-bold focus:outline-none border-b border-[#8b7355]/10 focus:border-[#8b7355] transition-colors"
                placeholder="닉네임을 입력하세요"
                maxLength={UI_CONSTANTS.MAX_NICKNAME_LENGTH}
                aria-label="닉네임"
              />
            </div>
            <Button
              onClick={handleUpdateNickname}
              disabled={
                isUpdating || newNickname === user?.displayName || !validateNickname(newNickname)
              }
              loading={isUpdating}
              variant="primary"
              size="sm"
              aria-label="닉네임 변경"
            >
              변경
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#fdfaf1] rounded-2xl text-[#8b7355]">
              <Mail className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Email</p>
              <p className="text-[#5c4033] font-bold">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-green-500 bg-green-50 px-2 py-1 rounded-md">
            <CheckCircle className="w-3 h-3" aria-hidden="true" />
            <span className="text-[10px] font-bold">인증됨</span>
          </div>
        </div>

        {!isGoogleUser && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#fdfaf1] rounded-2xl text-[#8b7355]">
                  <Shield className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Security</p>
                  <p className="text-[#5c4033] font-bold">비밀번호 관리</p>
                </div>
              </div>
              <Button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                variant="primary"
                size="sm"
                aria-label={showPasswordChange ? '비밀번호 변경 취소' : '비밀번호 변경'}
              >
                {showPasswordChange ? '취소' : '변경하기'}
              </Button>
            </div>

            {showPasswordChange && (
              <div className="bg-[#fdfaf1] p-4 rounded-2xl border border-[#8b7355]/10 space-y-3 animate-in fade-in slide-in-from-top-2">
                <PasswordInput
                  placeholder="새 비밀번호 (6자 이상)"
                  className="text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  aria-label="새 비밀번호"
                  showToggle={false}
                />
                <Button
                  onClick={handleUpdatePassword}
                  disabled={passwordUpdating || !validatePassword(newPassword)}
                  loading={passwordUpdating}
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="text-sm"
                  aria-label="비밀번호 업데이트"
                >
                  비밀번호 업데이트
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="pt-6 border-t border-gray-100 flex flex-col items-center space-y-3">
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="md"
            fullWidth
            icon={<LogOut />}
            className="text-sm"
            aria-label="로그아웃"
          >
            로그아웃
          </Button>

          <Button
            onClick={handleDeleteAccount}
            variant="danger"
            size="sm"
            fullWidth
            icon={<Trash2 />}
            className="text-xs underline decoration-dotted underline-offset-4"
            aria-label="계정 영구 탈퇴"
          >
            계정 영구 탈퇴
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
