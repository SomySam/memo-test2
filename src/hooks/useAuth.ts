import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  refreshUser: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshUser = () => {
    if (auth.currentUser) {
      setUser({ ...auth.currentUser } as User);
    }
  };

  return { user, loading, refreshUser };
};
