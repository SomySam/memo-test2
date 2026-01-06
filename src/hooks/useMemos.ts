import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { Memo } from '@/types';
import { COLLECTIONS, SortOption, SORT_OPTIONS } from '@/constants';
import { useEffect } from 'react';

const MEMO_QUERY_KEY = 'memos';

// Firestore에서 메모 가져오기
const fetchMemos = async (userEmail: string, sortOrder: SortOption): Promise<Memo[]> => {
  const userMemoCollectionRef = collection(db, COLLECTIONS.MEMOS, userEmail, COLLECTIONS.MEMO);
  const orderDirection = sortOrder === SORT_OPTIONS.NEWEST_FIRST ? 'desc' : 'asc';
  const q = query(userMemoCollectionRef, orderBy('createdAt', orderDirection));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Memo
  );
};

// 실시간 구독을 위한 훅
export const useMemos = (
  userEmail: string | null,
  sortOrder: SortOption = SORT_OPTIONS.NEWEST_FIRST
) => {
  const queryClient = useQueryClient();

  // 초기 데이터 로드 (useQuery)
  const queryResult = useQuery({
    queryKey: [MEMO_QUERY_KEY, userEmail, sortOrder],
    queryFn: () => fetchMemos(userEmail!, sortOrder),
    enabled: !!userEmail,
  });

  // 실시간 구독 설정
  useEffect(() => {
    if (!userEmail) return;

    const userMemoCollectionRef = collection(db, COLLECTIONS.MEMOS, userEmail, COLLECTIONS.MEMO);
    const orderDirection = sortOrder === SORT_OPTIONS.NEWEST_FIRST ? 'desc' : 'asc';
    const q = query(userMemoCollectionRef, orderBy('createdAt', orderDirection));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const memoData = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Memo
      );

      // 실시간 업데이트를 쿼리 캐시에 반영
      queryClient.setQueryData([MEMO_QUERY_KEY, userEmail, sortOrder], memoData);
    });

    return () => unsubscribe();
  }, [userEmail, sortOrder, queryClient]);

  return queryResult;
};

// 메모 추가 mutation
export const useAddMemo = (userEmail: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!userEmail) throw new Error('User email is required');

      const userMemoCollectionRef = collection(db, COLLECTIONS.MEMOS, userEmail, COLLECTIONS.MEMO);
      const docRef = await addDoc(userMemoCollectionRef, {
        content: content.trim(),
        createdAt: Date.now(),
        userId: auth.currentUser?.uid || '',
      });

      return docRef.id;
    },
    onSuccess: () => {
      // 메모가 추가되면 쿼리 무효화 (실시간 리스너가 자동으로 업데이트하지만, 안전장치로 추가)
      queryClient.invalidateQueries({ queryKey: [MEMO_QUERY_KEY, userEmail] });
    },
  });
};

// 메모 수정 mutation
export const useUpdateMemo = (userEmail: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      if (!userEmail) throw new Error('User email is required');

      const memoDocRef = doc(db, COLLECTIONS.MEMOS, userEmail, COLLECTIONS.MEMO, id);
      await updateDoc(memoDocRef, {
        content: content.trim(),
        updatedAt: Date.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMO_QUERY_KEY, userEmail] });
    },
  });
};

// 메모 삭제 mutation
export const useDeleteMemo = (userEmail: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!userEmail) throw new Error('User email is required');

      const memoDocRef = doc(db, COLLECTIONS.MEMOS, userEmail, COLLECTIONS.MEMO, id);
      await deleteDoc(memoDocRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMO_QUERY_KEY, userEmail] });
    },
  });
};
