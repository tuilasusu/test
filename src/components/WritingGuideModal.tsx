import React from 'react';
import { X, BookOpen, Check, AlertCircle, BookmarkCheck } from 'lucide-react';

interface WritingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WritingGuideModal: React.FC<WritingGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Cẩm nang Quy chuẩn Soạn thảo Văn bản Công sở
              </h3>
              <p className="text-xs text-slate-500">
                Tiêu chuẩn tiếng Việt hành chính & giao tiếp doanh nghiệp hiện đại
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
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed font-sans">
          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-blue-700">
              <BookmarkCheck className="w-4 h-4" />
              1. Quy định viết hoa theo Nghị định 30/2020/NĐ-CP
            </h4>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <p>
                <strong>Tên cơ quan, tổ chức:</strong> Viết hoa chữ cái đầu của các từ, cụm từ chỉ loại
                hình cơ quan, chức năng, lĩnh vực hoạt động. <em>Ví dụ:</em> Bộ Tài chính, Ban Giám
                đốc, Phòng Kế toán - Tài vụ, Công ty Cổ phần...
              </p>
              <p>
                <strong>Chức vụ, chức danh:</strong> Khi đi kèm với tên người cụ thể hoặc trong văn
                cảnh trang trọng. <em>Ví dụ:</em> Tổng Giám đốc, Chủ tịch Hội đồng Quản trị, Trưởng
                phòng...
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-rose-700">
              <AlertCircle className="w-4 h-4" />
              2. 12 cặp từ chính tả văn phòng hay bị nhầm lẫn nhất
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="line-through text-rose-600">xuất xắc</span>
                <span className="font-bold text-emerald-700">→ xuất sắc</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="line-through text-rose-600">sử lý công việc</span>
                <span className="font-bold text-emerald-700">→ xử lý công việc</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="line-through text-rose-600">cọ sát thực tế</span>
                <span className="font-bold text-emerald-700">→ cọ xát thực tế</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="line-through text-rose-600">sát nhập công ty</span>
                <span className="font-bold text-emerald-700">→ sáp nhập công ty</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="line-through text-rose-600">bổ xung nhân sự</span>
                <span className="font-bold text-emerald-700">→ bổ sung nhân sự</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="line-through text-rose-600">sơ xuất nhỏ</span>
                <span className="font-bold text-emerald-700">→ sơ suất nhỏ</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="line-through text-rose-600">vô hình chung</span>
                <span className="font-bold text-emerald-700">→ vô hình trung</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="line-through text-rose-600">chuẩn chu</span>
                <span className="font-bold text-emerald-700">→ chỉn chu</span>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-700">
              <Check className="w-4 h-4" />
              3. Quy tắc 3C trong văn phong email công việc
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50">
                <strong className="text-blue-900 block mb-1">Clear (Rõ ràng)</strong>
                Mỗi câu chỉ nên truyền đạt 1 ý chính. Không viết câu quá 25 từ. Đặt thông tin quan
                trọng nhất ở dòng đầu tiên.
              </div>
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <strong className="text-emerald-900 block mb-1">Concise (Súc tích)</strong>
                Cắt bỏ các từ đệm: "rất là", "nhằm mục đích để", "theo như chúng tôi được biết".
              </div>
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                <strong className="text-amber-900 block mb-1">Courteous (Lịch thiệp)</strong>
                Dùng đại từ nhân xưng chuẩn mực ("Kính gửi", "Trân trọng"), tránh từ ngữ suồng sã
                hoặc viết tắt tin nhắn ("đc", "ko", "nha").
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
