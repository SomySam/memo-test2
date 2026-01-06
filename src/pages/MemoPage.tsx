import React, { useState, useCallback } from 'react';
import { Plus, MessageSquare, ArrowUpDown } from 'lucide-react';
import Modal from '@/components/Modal';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import MemoCard from '@/components/molecules/MemoCard';
import { ERROR_MESSAGES, SORT_OPTIONS, SortOption } from '@/constants';
import { validateMemoContent } from '@/utils/validation';
import { logError } from '@/utils/logger';
import { useAuthStore } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import { useMemos, useAddMemo, useUpdateMemo, useDeleteMemo } from '@/hooks/useMemos';

const MemoPage: React.FC = () => {
  const { user } = useAuthStore();
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
  } = useModalStore();

  const [memoText, setMemoText] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOption>(SORT_OPTIONS.NEWEST_FIRST);

  // 수정 관련 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // TanStack Query 훅 사용
  const { data: memos = [], isLoading } = useMemos(user?.email || null, sortOrder);
  const addMemoMutation = useAddMemo(user?.email || null);
  const updateMemoMutation = useUpdateMemo(user?.email || null);
  const deleteMemoMutation = useDeleteMemo(user?.email || null);

  const handleSaveMemo = async () => {
    if (!validateMemoContent(memoText) || addMemoMutation.isPending) return;

    try {
      await addMemoMutation.mutateAsync(memoText);
      setMemoText('');
    } catch (error) {
      logError('Save Memo', error);
      openModal({
        title: '저장 실패',
        message: ERROR_MESSAGES.MEMO.SAVE_FAILED,
        type: 'error',
      });
    }
  };

  const startEditing = useCallback((id: string, content: string) => {
    setEditingId(id);
    setEditText(content);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditText('');
  }, []);

  const handleUpdateMemo = useCallback(async (id: string) => {
    if (!validateMemoContent(editText) || updateMemoMutation.isPending) return;

    try {
      await updateMemoMutation.mutateAsync({ id, content: editText });
      setEditingId(null);
      setEditText('');
    } catch (error) {
      logError('Update Memo', error);
      openModal({
        title: '수정 실패',
        message: ERROR_MESSAGES.MEMO.UPDATE_FAILED,
        type: 'error',
      });
    }
  }, [editText, updateMemoMutation, openModal]);

  const handleDeleteMemo = useCallback((id: string) => {
    openModal({
      title: '메모 삭제',
      message: '이 메모를 삭제하시겠습니까?',
      type: 'confirm',
      primaryLabel: '삭제',
      secondaryLabel: '취소',
      onPrimaryAction: async () => {
        try {
          await deleteMemoMutation.mutateAsync(id);
          closeModal();
        } catch (error) {
          logError('Delete Memo', error);
          openModal({
            title: '삭제 실패',
            message: ERROR_MESSAGES.MEMO.DELETE_FAILED,
            type: 'error',
          });
        }
      },
    });
  }, [deleteMemoMutation, openModal, closeModal]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) =>
      prev === SORT_OPTIONS.NEWEST_FIRST ? SORT_OPTIONS.OLDEST_FIRST : SORT_OPTIONS.NEWEST_FIRST
    );
  }, []);

  return (
    <div className="p-5 space-y-8 bg-[#fdfaf1] min-h-full">
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

      {/* 메모 입력 섹션 */}
      <div className="bg-white rounded-[32px] shadow-xl p-6 border border-[#8b7355]/5 flex flex-col focus-within:ring-2 focus-within:ring-[#8b7355]/20 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-[#8b7355]">
            <div className="p-1.5 bg-[#fdfaf1] rounded-lg">
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quick Note</span>
          </div>
          <span className="text-[10px] text-gray-300 font-bold">{user?.email}</span>
        </div>

        <textarea
          placeholder="여기에 기록을 남겨보세요..."
          className="w-full flex-1 resize-none focus:outline-none text-[#5c4033] placeholder-[#8b7355]/20 min-h-[120px] text-lg bg-transparent leading-relaxed"
          value={memoText}
          onChange={(e) => setMemoText(e.target.value)}
          disabled={addMemoMutation.isPending}
          aria-label="새 메모 작성"
        />

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-50">
          <Button
            onClick={handleSaveMemo}
            disabled={!validateMemoContent(memoText) || addMemoMutation.isPending}
            loading={addMemoMutation.isPending}
            variant="primary"
            size="md"
            icon={<Plus />}
            aria-label="메모 저장"
          >
            저장하기
          </Button>
        </div>
      </div>

      {/* 정렬 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={toggleSortOrder}
          className="flex items-center space-x-2 text-sm text-[#8b7355] bg-white px-4 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
          aria-label={`정렬 순서: ${sortOrder === SORT_OPTIONS.NEWEST_FIRST ? '최신순' : '오래된순'}`}
        >
          <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
          <span className="font-bold">
            {sortOrder === SORT_OPTIONS.NEWEST_FIRST ? '최신순' : '오래된순'}
          </span>
        </button>
      </div>

      <div className="space-y-6 pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center py-20">
            <Spinner size="lg" variant="light" className="mb-2" />
            <p className="text-xs font-bold text-[#8b7355]/40 tracking-widest" role="status">
              LOADING MEMOS
            </p>
          </div>
        ) : memos.length === 0 ? (
          <div className="text-center py-20 px-10">
            <p className="text-base font-bold text-[#5c4033]/40 mb-1">메모가 비어있습니다</p>
            <p className="text-xs text-[#8b7355]/20">소중한 생각을 기록해보세요.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {memos.map((memo) => (
              <MemoCard
                key={memo.id}
                id={memo.id}
                content={memo.content}
                createdAt={memo.createdAt}
                isEditing={editingId === memo.id}
                editText={editText}
                isUpdating={updateMemoMutation.isPending && editingId === memo.id}
                onEdit={() => startEditing(memo.id, memo.content)}
                onDelete={() => handleDeleteMemo(memo.id)}
                onSaveEdit={() => handleUpdateMemo(memo.id)}
                onCancelEdit={cancelEditing}
                onEditTextChange={setEditText}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoPage;
