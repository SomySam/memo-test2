
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MemoPage from './pages/MemoPage';
import ProfilePage from './pages/ProfilePage';
import Header from './components/Header';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 사용자 상태를 강제로 새로고침하여 Header 등 UI를 동기화하는 함수
  const refreshUser = () => {
    if (auth.currentUser) {
      // 새로운 객체 참조를 만들어 React가 상태 변화를 감지하게 함
      setUser({ ...auth.currentUser } as User);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fdfaf1]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b7355]"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="max-w-md mx-auto min-h-screen bg-[#fdfaf1] shadow-xl flex flex-col overflow-hidden">
        {user && <Header user={user} />}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Navigate to="/memo" /> : <LoginPage />} 
            />
            <Route 
              path="/memo" 
              element={user ? <MemoPage user={user} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <ProfilePage user={user} refreshUser={refreshUser} /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
