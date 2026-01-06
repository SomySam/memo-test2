import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import MemoPage from '@/pages/MemoPage';
import ProfilePage from '@/pages/ProfilePage';
import Header from '@/components/Header';
import Loading from '@/components/Loading';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/constants';

const App: React.FC = () => {
  const { user, loading, initAuth } = useAuthStore();

  // Firebase 인증 상태 구독 초기화
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  if (loading) {
    return <Loading message="LOADING..." />;
  }

  return (
    <HashRouter>
      <div className="max-w-md mx-auto min-h-screen bg-[#fdfaf1] shadow-xl flex flex-col overflow-hidden">
        {user && <Header />}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route
              path={ROUTES.HOME}
              element={user ? <Navigate to={ROUTES.MEMO} replace /> : <LoginPage />}
            />
            <Route
              path={ROUTES.MEMO}
              element={user ? <MemoPage /> : <Navigate to={ROUTES.HOME} replace />}
            />
            <Route
              path={ROUTES.PROFILE}
              element={user ? <ProfilePage /> : <Navigate to={ROUTES.HOME} replace />}
            />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
