import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "firebase/auth";
import { Edit3, User as UserIcon, Home } from "lucide-react";

interface HeaderProps {
    user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
    const location = useLocation();
    const isProfilePage = location.pathname === "/profile";
    const displayName = user.displayName || user.email?.split("@")[0] || "User";

    return (
        <header className="bg-[#8b7355] text-white px-6 py-5 flex items-center justify-between shadow-lg sticky top-0 z-50">
            <Link
                to="/memo"
                className="flex items-center space-x-2 active:scale-95 transition-transform"
            >
                <div className="p-1.5 rounded-xl shadow-inner">
                    <img
                        src="/assets/logo.png"
                        alt="MEMO Logo"
                        className="w-9 h-9"
                    />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-black tracking-tighter leading-none">
                        MEMO.
                    </h1>
                    <span className="text-[9px] font-bold text-white/60 tracking-wider uppercase mt-0.5">
                        {displayName}
                    </span>
                </div>
            </Link>

            <div className="flex items-center space-x-3">
                <div className="bg-white/10 px-3 py-1 rounded-full flex items-center space-x-1.5 border border-white/10">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                        Online
                    </span>
                </div>

                <Link
                    to={isProfilePage ? "/memo" : "/profile"}
                    className={`p-2 rounded-2xl transition-all shadow-md active:scale-90 ${
                        isProfilePage
                            ? "bg-white text-[#8b7355]"
                            : "bg-[#a89078] text-white hover:bg-white/20"
                    }`}
                >
                    {isProfilePage ? (
                        <Home className="w-5 h-5" />
                    ) : (
                        <UserIcon className="w-5 h-5" />
                    )}
                </Link>
            </div>
        </header>
    );
};

export default Header;
