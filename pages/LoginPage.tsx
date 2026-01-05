import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    User as UserIcon,
} from "lucide-react";
import { auth, db } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import Modal from "../components/Modal";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [loading, setLoading] = useState(false);

    // 카운트다운 상태 관리
    const [countdown, setCountdown] = useState<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "error" | "confirm" | "success";
        primaryLabel?: string;
        onPrimaryAction?: () => void;
        secondaryLabel?: string;
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "error",
    });

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        const trimmedEmail = email.trim();
        if (trimmedEmail.length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setEmailError(
                emailRegex.test(trimmedEmail)
                    ? ""
                    : "올바른 이메일 형식이 아닙니다."
            );
        } else {
            setEmailError("");
        }
    }, [email]);

    useEffect(() => {
        if (password.length > 0) {
            setPasswordError(
                password.length < 6 ? "비밀번호는 6자 이상이어야 합니다." : ""
            );
        } else {
            setPasswordError("");
        }
    }, [password]);

    // 타이머 정리
    const clearAllTimers = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        timerRef.current = null;
        intervalRef.current = null;
        setCountdown(null);
    };

    useEffect(() => {
        return () => clearAllTimers();
    }, []);

    const closeModal = () => {
        clearAllTimers();
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
    };

    // 카운트다운 시작 함수
    const startCountdown = (seconds: number, callback: () => void) => {
        clearAllTimers();
        setCountdown(seconds);

        intervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev === null || prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        timerRef.current = setTimeout(() => {
            callback();
            closeModal();
        }, seconds * 1000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalEmail = email.trim();
        if (emailError || passwordError || !finalEmail || !password) return;

        setLoading(true);
        try {
            if (isLogin) {
                // [필독] Firestore에서 해당 이메일 문서 존재 여부를 선제적으로 확인
                const userDocRef = doc(db, "users", finalEmail);
                const userSnap = await getDoc(userDocRef);

                if (!userSnap.exists()) {
                    // 존재하지 않는 계정인 경우 -> 회원가입 유도
                    setModalConfig({
                        isOpen: true,
                        title: "가입된 계정 없음",
                        message: `입력하신 이메일(${finalEmail})은\n아직 회원이 아닙니다.\n회원가입 페이지로 이동할까요?`,
                        type: "confirm",
                        primaryLabel: "회원가입 하기",
                        secondaryLabel: "취소",
                        onPrimaryAction: () => {
                            setIsLogin(false);
                            closeModal();
                        },
                    });

                    // 가입 유도 모달도 3초 뒤에 자동 이동을 원하시면 아래 주석 해제
                    // startCountdown(3, () => { setIsLogin(false); });

                    setLoading(false);
                    return;
                }

                // 계정이 있는 경우에만 Auth 로그인 시도
                try {
                    await setPersistence(auth, browserLocalPersistence);
                    await signInWithEmailAndPassword(
                        auth,
                        finalEmail,
                        password
                    );
                    navigate("/memo");
                } catch (authError: any) {
                    // 패스워드 불일치 시나리오
                    setModalConfig({
                        isOpen: true,
                        title: "로그인 실패",
                        message:
                            "비밀번호가 일치하지 않습니다.\n다시 한번 확인해 주세요.",
                        type: "error",
                        primaryLabel: "다시 시도",
                        onPrimaryAction: closeModal,
                    });

                    // 3초 카운트다운 시작
                    startCountdown(3, () => {
                        // 특별한 동작 없이 모달만 닫음 (입력 폼 유지)
                    });
                }
            } else {
                // 회원가입
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    finalEmail,
                    password
                );
                const finalNickname =
                    nickname.trim() || finalEmail.split("@")[0];

                await updateProfile(userCredential.user, {
                    displayName: finalNickname,
                });

                await setDoc(doc(db, "users", finalEmail), {
                    uid: userCredential.user.uid,
                    email: finalEmail,
                    nickname: finalNickname,
                    createdAt: serverTimestamp(),
                });

                navigate("/memo");
            }
        } catch (error: any) {
            console.error("Auth Exception:", error);
            setModalConfig({
                isOpen: true,
                title: "오류 발생",
                message:
                    "서비스 연결이 원활하지 않습니다.\n인터넷 연결을 확인해 주세요.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            if (result.user.email) {
                await setDoc(
                    doc(db, "users", result.user.email),
                    {
                        uid: result.user.uid,
                        email: result.user.email,
                        nickname:
                            result.user.displayName ||
                            result.user.email.split("@")[0],
                        lastLogin: serverTimestamp(),
                    },
                    { merge: true }
                );
            }
            navigate("/memo");
        } catch (error: any) {
            if (error.code !== "auth/popup-closed-by-user") {
                setModalConfig({
                    isOpen: true,
                    title: "구글 로그인 실패",
                    message: "로그인 팝업이 차단되었거나 취소되었습니다.",
                    type: "error",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="relative flex flex-col bg-[#F8F3E0]"
            style={{
                backgroundImage: "url('/assets/bg_image2.png')",
                backgroundPosition: "0 130%",
                backgroundSize: "100% auto",
                backgroundRepeat: "no-repeat",
                height: "100vh",
            }}
        >
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                primaryLabel={modalConfig.primaryLabel}
                onPrimaryAction={modalConfig.onPrimaryAction}
                secondaryLabel={modalConfig.secondaryLabel}
                countdown={countdown}
            />

            <div className="p-4">
                <button
                    onClick={() => {
                        setIsLogin(true);
                        setEmail("");
                        setPassword("");
                        clearAllTimers();
                    }}
                    className="text-[#8b7355] hover:opacity-70 transition-opacity"
                >
                    <ArrowLeft className="w-8 h-8" />
                </button>
            </div>

            <div className="flex flex-col items-center justify-center px-8 mt-4">
                <div className="mb-10 text-center">
                    <div className="relative inline-block">
                        <img
                            src="/assets/logo.png"
                            alt="Memo Logo"
                            className="w-28 h-28 opacity-90 object-contain"
                            style={{ mixBlendMode: "multiply" }}
                        />
                        <div className="mt-4">
                            <span className="text-3xl font-black tracking-widest text-[#5c4033]">
                                MEMO
                            </span>
                            <p className="text-xs text-[#8b7355] mt-1 font-medium">
                                나만의 안전한 기록 공간
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-5">
                    {!isLogin && (
                        <div className="space-y-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <UserIcon className="w-5 h-5 text-[#8b7355]/50" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="사용하실 닉네임"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#8b7355]/20 focus:outline-none focus:ring-2 focus:ring-[#8b7355] bg-white text-[#5c4033]"
                                    value={nickname}
                                    onChange={(e) =>
                                        setNickname(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Mail className="w-5 h-5 text-[#8b7355]/50" />
                            </div>
                            <input
                                type="email"
                                placeholder="이메일 주소"
                                className={`w-full pl-12 pr-4 py-4 rounded-2xl border ${
                                    emailError
                                        ? "border-red-400"
                                        : "border-[#8b7355]/20"
                                } focus:outline-none focus:ring-2 focus:ring-[#8b7355] bg-white text-[#5c4033]`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        {emailError && (
                            <p className="text-[10px] text-red-500 px-2 font-black uppercase tracking-tight">
                                {emailError}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Lock className="w-5 h-5 text-[#8b7355]/50" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="비밀번호 (6자 이상)"
                                className={`w-full pl-12 pr-12 py-4 rounded-2xl border ${
                                    passwordError
                                        ? "border-red-400"
                                        : "border-[#8b7355]/20"
                                } focus:outline-none focus:ring-2 focus:ring-[#8b7355] bg-white text-[#5c4033]`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-4 flex items-center text-[#8b7355]/50 hover:text-[#8b7355]"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {passwordError && (
                            <p className="text-[10px] text-red-500 px-2 font-black uppercase tracking-tight">
                                {passwordError}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!emailError || !!passwordError}
                        className={`w-full py-4 bg-[#8b7355] text-white rounded-2xl font-bold text-xl shadow-lg active:scale-95 flex items-center justify-center transition-all ${
                            loading
                                ? "opacity-70 cursor-not-allowed"
                                : "hover:bg-[#7a654a]"
                        }`}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : isLogin ? (
                            "로그인"
                        ) : (
                            "회원가입"
                        )}
                    </button>
                </form>

                <div className="flex items-center w-full my-6 text-[#8b7355]/30">
                    <div className="flex-1 h-px bg-current"></div>
                    <span className="px-4 text-[10px] font-black tracking-widest uppercase">
                        Social
                    </span>
                    <div className="flex-1 h-px bg-current"></div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-4 bg-white border border-[#8b7355]/10 rounded-2xl flex items-center justify-center space-x-3 shadow-sm hover:shadow-md active:scale-95 transition-all"
                >
                    <img
                        src="/assets/Logo-google-icon-PNG.png"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    <span className="text-[#5c4033] font-bold">
                        Google로 로그인
                    </span>
                </button>
            </div>

            <div className=" p-8 text-center ">
                <p className="text-[#8b7355]/60 text-sm">
                    {isLogin ? "계정이 없으신가요?" : "회원이신가요?"}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setEmailError("");
                            setPasswordError("");
                            clearAllTimers();
                        }}
                        className="font-bold text-[#8b7355] ml-2 hover:underline"
                    >
                        {isLogin ? "가입하기" : "로그인하기"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
