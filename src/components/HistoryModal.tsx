import React from 'react';
import { DocumentHistoryItem } from '../types/qc';
import { X, History, Trash2, ArrowUpRight, Clock, Award } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DocumentHistoryItem[];
  onSelectHistoryItem: (item: DocumentHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Lịch sử văn bản đã kiểm tra</h3>
              <p className="text-xs text-slate-500">
                Các bản quét được lưu trên trình duyệt của bạn ({history.length} bản ghi)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>Chưa có lịch sử kiểm tra nào được lưu.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      , {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{item.text}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end font-extrabold text-xs text-slate-800">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{item.score}/100</span>
                    </div>
                    <span className="text-[10px] text-rose-600 font-semibold">
                      {item.issueCount} đề xuất
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ lịch sử</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
