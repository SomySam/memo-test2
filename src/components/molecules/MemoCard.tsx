import React from 'react';
import { Clock, Edit2, Trash2, Check, X } from 'lucide-react';
import { formatDate } from '@/utils/date';

export interface MemoCardProps {
  id: string;
  content: string;
  createdAt: number;
  isEditing: boolean;
  editText: string;
  isUpdating: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditTextChange: (text: string) => void;
}

const MemoCard: React.FC<MemoCardProps> = ({
  content,
  createdAt,
  isEditing,
  editText,
  isUpdating,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onEditTextChange,
}) => (
    <div className="bg-white rounded-[24px] shadow-sm p-5 border border-white hover:shadow-md transition-all group animate-in fade-in slide-in-from-bottom-2">
      {isEditing ? (
        <div className="mb-4">
          <textarea
            className="w-full p-3 rounded-xl bg-[#fdfaf1] border border-[#8b7355]/20 focus:outline-none focus:ring-1 focus:ring-[#8b7355] text-[#5c4033] text-[16px] leading-relaxed resize-none min-h-[100px]"
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            autoFocus
            aria-label="메모 수정"
          />
        </div>
      ) : (
        <p className="text-[#5c4033] text-[16px] leading-relaxed mb-4 whitespace-pre-wrap">
          {content}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-50/50">
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3 text-[#8b7355]/40" aria-hidden="true" />
          <span className="text-[11px] font-bold text-[#8b7355]/40">
            {formatDate(createdAt)}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {isEditing ? (
            <>
              <button
                onClick={onSaveEdit}
                disabled={isUpdating}
                className="p-2 text-green-500 hover:bg-green-50 rounded-xl transition-all"
                aria-label="수정 완료"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" aria-hidden="true"></div>
                ) : (
                  <Check className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
              <button
                onClick={onCancelEdit}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                aria-label="취소"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="p-2 text-gray-300 hover:text-[#8b7355] hover:bg-[#8b7355]/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                aria-label="메모 수정"
              >
                <Edit2 className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                aria-label="메모 삭제"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
);

export default React.memo(MemoCard);
