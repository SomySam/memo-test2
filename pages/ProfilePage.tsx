import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    signOut,
    updateProfile,
    updatePassword,
    deleteUser,
} from "firebase/auth";
import { auth, db } from "../firebase";
import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    getDocs,
    writeBatch,
} from "firebase/firestore";
import {
    LogOut,
    User as UserIcon,
    Mail,
    Shield,
    Camera,
    Lock,
    CheckCircle,
    Trash2,
    Loader2,
} from "lucide-react";
import Modal from "../components/Modal";

interface ProfilePageProps {
    user: User;
    refreshUser: () => void; // 추가: 상위 컴포넌트의 유저 상태를 갱신하는 함수
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, refreshUser }) => {
    const navigate = useNavigate();

    const [newNickname, setNewNickname] = useState(user.displayName || "");
    const [isUpdating, setIsUpdating] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);

    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [passwordUpdating, setPasswordUpdating] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user.email) return;
            try {
                const userDoc = await getDoc(doc(db, "users", user.email));
                if (userDoc.exists()) {
                    setNewNickname(userDoc.data().nickname);
                }
            } catch (error) {
                console.error("Profile fetch error:", error);
            } finally {
                setProfileLoading(false);
            }
        };
        fetchUserProfile();
    }, [user.email]);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "error" | "confirm" | "success" | "info";
        primaryLabel?: string;
        onPrimaryAction?: () => void;
        secondaryLabel?: string;
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "success",
    });

    const closeModal = () =>
        setModalConfig((prev) => ({ ...prev, isOpen: false }));

    const handleLogout = async () => {
        setModalConfig({
            isOpen: true,
            title: "로그아웃",
            message: "정말 로그아웃 하시겠습니까?",
            type: "confirm",
            primaryLabel: "로그아웃",
            secondaryLabel: "취소",
            onPrimaryAction: async () => {
                try {
                    await signOut(auth);
                    navigate("/", { replace: true });
                } catch (error) {
                    setModalConfig({
                        isOpen: true,
                        title: "오류",
                        message: "로그아웃 중 문제가 발생했습니다.",
                        type: "error",
                    });
                }
            },
        });
    };

    const handleDeleteAccount = async () => {
        setModalConfig({
            isOpen: true,
            title: "계정 탈퇴",
            message:
                "정말 탈퇴하시겠습니까? 작성하신 모든 메모와 계정 정보가 영구적으로 삭제됩니다.",
            type: "confirm",
            primaryLabel: "탈퇴하기",
            secondaryLabel: "취소",
            onPrimaryAction: async () => {
                if (!user.email) return;

                setModalConfig((prev) => ({
                    ...prev,
                    title: "계정 탈퇴 처리 중...",
                    message:
                        "데이터를 영구적으로 삭제하고 있습니다. 잠시만 기다려주세요.",
                    type: "info",
                    primaryLabel: "처리 중...",
                    onPrimaryAction: undefined,
                }));

                try {
                    const userMemosRef = collection(
                        db,
                        "memos",
                        user.email,
                        "memo"
                    );
                    const memoSnapshot = await getDocs(userMemosRef);

                    const batch = writeBatch(db);
                    memoSnapshot.forEach((doc) => {
                        batch.delete(doc.ref);
                    });

                    batch.delete(doc(db, "users", user.email));
                    await batch.commit();
                    await deleteUser(user);

                    navigate("/", { replace: true });
                } catch (error: any) {
                    console.error("Delete Error:", error);
                    if (error.code === "auth/requires-recent-login") {
                        setModalConfig({
                            isOpen: true,
                            title: "재인증 필요",
                            message:
                                "보안을 위해 다시 로그인한 직후에만 탈퇴가 가능합니다.\n로그아웃 후 다시 로그인하여 시도해주세요.",
                            type: "error",
                            primaryLabel: "로그아웃 하기",
                            onPrimaryAction: async () => {
                                await signOut(auth);
                                navigate("/");
                            },
                        });
                    } else {
                        setModalConfig({
                            isOpen: true,
                            title: "탈퇴 실패",
                            message:
                                "탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
                            type: "error",
                        });
                    }
                }
            },
        });
    };

    const handleUpdateNickname = async () => {
        const trimmedNickname = newNickname.trim();
        if (!trimmedNickname || !user.email) return;
        setIsUpdating(true);
        try {
            // 1. Firebase Auth 프로필 업데이트
            await updateProfile(user, { displayName: trimmedNickname });

            // 2. Firestore 사용자 문서 업데이트
            await updateDoc(doc(db, "users", user.email), {
                nickname: trimmedNickname,
                updatedAt: serverTimestamp(),
            });

            // 3. 상위 컴포넌트(App)의 유저 상태 동기화 (Header 닉네임 변경)
            refreshUser();

            setModalConfig({
                isOpen: true,
                title: "변경 완료",
                message: `닉네임이 '${trimmedNickname}'(으)로 변경되었습니다.`,
                type: "success",
            });
        } catch (error) {
            console.error("Update nickname error:", error);
            setModalConfig({
                isOpen: true,
                title: "변경 실패",
                message: "정보 업데이트 중 오류가 발생했습니다.",
                type: "error",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword.length < 6) {
            setModalConfig({
                isOpen: true,
                title: "비밀번호 오류",
                message: "비밀번호는 최소 6자 이상이어야 합니다.",
                type: "error",
            });
            return;
        }
        setPasswordUpdating(true);
        try {
            await updatePassword(user, newPassword);
            setModalConfig({
                isOpen: true,
                title: "변경 성공",
                message: "비밀번호가 변경되었습니다.",
                type: "success",
            });
            setNewPassword("");
            setShowPasswordChange(false);
        } catch (error: any) {
            if (error.code === "auth/requires-recent-login") {
                setModalConfig({
                    isOpen: true,
                    title: "재인증 필요",
                    message:
                        "보안을 위해 다시 로그인한 후 비밀번호를 변경해주세요.",
                    type: "error",
                    onPrimaryAction: async () => {
                        await signOut(auth);
                        navigate("/");
                    },
                });
            } else {
                setModalConfig({
                    isOpen: true,
                    title: "변경 실패",
                    message: "비밀번호 변경에 실패했습니다.",
                    type: "error",
                });
            }
        } finally {
            setPasswordUpdating(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#fdfaf1]">
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                primaryLabel={modalConfig.primaryLabel}
                onPrimaryAction={modalConfig.onPrimaryAction}
                secondaryLabel={modalConfig.secondaryLabel}
            />

            <div className="bg-[#8b7355] p-8 pb-10 flex flex-col items-center text-white relative">
                <div className="relative mb-4 group">
                    <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-[#a89078] flex items-center justify-center shadow-xl">
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <UserIcon className="w-12 h-12" />
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg text-[#8b7355] cursor-pointer hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4" />
                    </div>
                </div>
                <h3 className="text-xl font-bold">
                    {profileLoading
                        ? "..."
                        : newNickname || user.email?.split("@")[0]}
                    님
                </h3>
                <p className="text-white/70 text-sm mt-1">{user.email}</p>
            </div>

            <div className="flex-1 bg-white -mt-10 rounded-t-[40px] px-8 py-10 shadow-2xl space-y-8 overflow-y-auto">
                <div className="space-y-6">
                    <h4 className="text-xs font-black text-[#8b7355] uppercase tracking-widest mb-4 p-4">
                        Account Settings
                    </h4>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-[#fdfaf1] rounded-2xl text-[#8b7355]">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-400 font-medium">
                                    Nickname
                                </p>
                                <input
                                    type="text"
                                    value={newNickname}
                                    onChange={(e) =>
                                        setNewNickname(e.target.value)
                                    }
                                    className="w-full text-[#5c4033] font-bold focus:outline-none border-b border-[#8b7355]/10 focus:border-[#8b7355] transition-colors"
                                    placeholder="닉네임을 입력하세요"
                                />
                            </div>
                            <button
                                onClick={handleUpdateNickname}
                                disabled={
                                    isUpdating ||
                                    newNickname === user.displayName ||
                                    !newNickname.trim()
                                }
                                className="text-xs font-bold text-[#8b7355] bg-[#8b7355]/10 px-3 py-1.5 rounded-lg hover:bg-[#8b7355] hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                            >
                                {isUpdating ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    "변경"
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-[#fdfaf1] rounded-2xl text-[#8b7355]">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">
                                    Email
                                </p>
                                <p className="text-[#5c4033] font-bold">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1 text-green-500 bg-green-50 px-2 py-1 rounded-md">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-[10px] font-bold">
                                인증됨
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-[#fdfaf1] rounded-2xl text-[#8b7355]">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">
                                        Security
                                    </p>
                                    <p className="text-[#5c4033] font-bold">
                                        비밀번호 관리
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    setShowPasswordChange(!showPasswordChange)
                                }
                                className="text-xs font-bold text-[#8b7355] bg-[#8b7355]/10 px-3 py-1.5 rounded-lg hover:bg-[#8b7355] hover:text-white transition-all"
                            >
                                {showPasswordChange ? "취소" : "변경하기"}
                            </button>
                        </div>

                        {showPasswordChange && (
                            <div className="bg-[#fdfaf1] p-4 rounded-2xl border border-[#8b7355]/10 space-y-3 animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="password"
                                    placeholder="새 비밀번호 (6자 이상)"
                                    className="w-full px-4 py-2 text-sm bg-white border border-[#8b7355]/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8b7355]"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                />
                                <button
                                    onClick={handleUpdatePassword}
                                    disabled={
                                        passwordUpdating ||
                                        newPassword.length < 6
                                    }
                                    className="w-full py-2 bg-[#8b7355] text-white text-sm font-bold rounded-xl hover:bg-[#7a654a] transition-all disabled:opacity-50"
                                >
                                    {passwordUpdating ? (
                                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                    ) : (
                                        "비밀번호 업데이트"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex flex-col items-center space-y-3">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 text-gray-400 hover:text-[#8b7355] transition-colors py-3 border border-dashed border-gray-200 rounded-2xl font-bold text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>로그아웃</span>
                    </button>

                    <button
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-center space-x-2 text-red-300 hover:text-red-500 transition-colors py-3 font-bold text-xs"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="underline decoration-dotted underline-offset-4">
                            계정 영구 탈퇴
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
