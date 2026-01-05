
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc,
  updateDoc
} from 'firebase/firestore';
import { Plus, Edit2, Trash2, Clock, MessageSquare, Loader2, Check, X } from 'lucide-react';
import { Memo } from '../types';
import Modal from '../components/Modal';

interface MemoPageProps {
  user: User;
}

const MemoPage: React.FC<MemoPageProps> = ({ user }) => {
  const [memoText, setMemoText] = useState('');
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 수정 관련 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'error' | 'confirm' | 'success';
    primaryLabel?: string;
    onPrimaryAction?: () => void;
    secondaryLabel?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    if (!user.email) return;

    const userMemoCollectionRef = collection(db, 'memos', user.email, 'memo');
    const q = query(userMemoCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const memoData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Memo[];
        setMemos(memoData);
        setLoading(false);
      }, 
      (error: any) => {
        console.error("Firestore Error:", error);
        setLoading(false);
        setModalConfig({
          isOpen: true,
          title: '데이터 로드 실패',
          message: '메모를 가져오는 중 문제가 발생했습니다.\n다시 로그인해보세요.',
          type: 'error'
        });
      }
    );

    return () => unsubscribe();
  }, [user.email]);

  const handleSaveMemo = async () => {
    if (!memoText.trim() || isSaving || !user.email) return;
    
    setIsSaving(true);
    try {
      const userMemoCollectionRef = collection(db, 'memos', user.email, 'memo');
      await addDoc(userMemoCollectionRef, {
        content: memoText,
        createdAt: Date.now(),
        userId: user.uid
      });
      setMemoText('');
    } catch (error: any) {
      console.error("Save Error:", error);
      setModalConfig({
        isOpen: true,
        title: '저장 실패',
        message: '메모를 저장하지 못했습니다.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (memo: Memo) => {
    setEditingId(memo.id);
    setEditText(memo.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleUpdateMemo = async (id: string) => {
    if (!editText.trim() || isUpdating || !user.email) return;
    
    setIsUpdating(true);
    try {
      const memoDocRef = doc(db, 'memos', user.email, 'memo', id);
      await updateDoc(memoDocRef, {
        content: editText,
        updatedAt: Date.now()
      });
      setEditingId(null);
      setEditText('');
    } catch (error: any) {
      console.error("Update Error:", error);
      setModalConfig({
        isOpen: true,
        title: '수정 실패',
        message: '메모를 수정하지 못했습니다.',
        type: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMemo = (id: string) => {
    if (!user.email) return;

    setModalConfig({
      isOpen: true,
      title: '메모 삭제',
      message: '이 메모를 삭제하시겠습니까?',
      type: 'confirm',
      primaryLabel: '삭제',
      secondaryLabel: '취소',
      onPrimaryAction: async () => {
        try {
          const memoDocRef = doc(db, 'memos', user.email!, 'memo', id);
          await deleteDoc(memoDocRef);
          closeModal();
        } catch (error) {
          setModalConfig({
            isOpen: true,
            title: '삭제 실패',
            message: '메모 삭제 중 오류가 발생했습니다.',
            type: 'error'
          });
        }
      }
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-5 space-y-8 bg-[#fdfaf1] min-h-full">
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

      {/* 메모 입력 섹션 */}
      <div className="bg-white rounded-[32px] shadow-xl p-6 border border-[#8b7355]/5 flex flex-col focus-within:ring-2 focus-within:ring-[#8b7355]/20 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-[#8b7355]">
            <div className="p-1.5 bg-[#fdfaf1] rounded-lg">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quick Note</span>
          </div>
          <span className="text-[10px] text-gray-300 font-bold">{user.email}</span>
        </div>
        
        <textarea
          placeholder="여기에 기록을 남겨보세요..."
          className="w-full flex-1 resize-none focus:outline-none text-[#5c4033] placeholder-[#8b7355]/20 min-h-[120px] text-lg bg-transparent leading-relaxed"
          value={memoText}
          onChange={(e) => setMemoText(e.target.value)}
          disabled={isSaving}
        />
        
        <div className="flex justify-end mt-4 pt-4 border-t border-gray-50">
          <button
            onClick={handleSaveMemo}
            disabled={!memoText.trim() || isSaving}
            className={`flex items-center space-x-2 bg-[#8b7355] text-white px-8 py-4 rounded-2xl transition-all shadow-lg active:scale-95 font-bold ${(!memoText.trim() || isSaving) ? 'opacity-50 grayscale' : 'hover:bg-[#7a654a]'}`}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            <span>저장하기</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 pb-24">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-8 h-8 text-[#8b7355]/20 animate-spin mb-2" />
            <p className="text-xs font-bold text-[#8b7355]/40 tracking-widest">LOADING MEMOS</p>
          </div>
        ) : memos.length === 0 ? (
          <div className="text-center py-20 px-10">
            <p className="text-base font-bold text-[#5c4033]/40 mb-1">메모가 비어있습니다</p>
            <p className="text-xs text-[#8b7355]/20">소중한 생각을 기록해보세요.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {memos.map((memo) => (
              <div key={memo.id} className="bg-white rounded-[24px] shadow-sm p-5 border border-white hover:shadow-md transition-all group animate-in fade-in slide-in-from-bottom-2">
                {editingId === memo.id ? (
                  <div className="mb-4">
                    <textarea
                      className="w-full p-3 rounded-xl bg-[#fdfaf1] border border-[#8b7355]/20 focus:outline-none focus:ring-1 focus:ring-[#8b7355] text-[#5c4033] text-[16px] leading-relaxed resize-none min-h-[100px]"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                    />
                  </div>
                ) : (
                  <p className="text-[#5c4033] text-[16px] leading-relaxed mb-4 whitespace-pre-wrap">{memo.content}</p>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50/50">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-[#8b7355]/40" />
                    <span className="text-[11px] font-bold text-[#8b7355]/40">{formatDate(memo.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {editingId === memo.id ? (
                      <>
                        <button 
                          onClick={() => handleUpdateMemo(memo.id)}
                          disabled={isUpdating}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-xl transition-all"
                          title="수정 완료"
                        >
                          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={cancelEditing}
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                          title="취소"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => startEditing(memo)}
                          className="p-2 text-gray-300 hover:text-[#8b7355] hover:bg-[#8b7355]/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMemo(memo.id)}
                          className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoPage;
