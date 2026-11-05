import React, { useState } from 'react';
import { X, Copy, Check, Download, Printer, FileText } from 'lucide-react';
import { QCReport } from '../types/qc';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  report: QCReport | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, text, report }) => {
  const [copiedType, setCopiedType] = useState<'plain' | 'md' | null>(null);

  if (!isOpen) return null;

  const finalText = report?.suggestedFullRewrite || text;

  const handleCopy = (content: string, type: 'plain' | 'md') => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([finalText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `van-ban-chuan-hoa-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Văn bản công sở chuẩn hóa</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.8; padding: 40px; color: #1e293b; max-width: 800px; margin: auto; }
            h1 { font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; color: #0f172a; }
            .content { white-space: pre-wrap; font-size: 15px; }
            .footer { margin-top: 40px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <h1>VĂN BẢN ĐÃ QUA KIỂM SOÁT CHẤT LƯỢNG (QC)</h1>
          <div class="content">${finalText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div class="footer">Được kiểm tra bởi Hệ thống Văn Phòng QC • Điểm chất lượng: ${
            report?.overallScore ?? 100
          }/100</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Xuất bản văn bản công sở</h3>
              <p className="text-xs text-slate-500">
                Tải về hoặc sao chép văn bản đã tối ưu hóa chất lượng
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
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => handleCopy(finalText, 'plain')}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-2 text-slate-800 font-semibold text-center"
            >
              {copiedType === 'plain' ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <Copy className="w-5 h-5 text-blue-600" />
              )}
              <span>{copiedType === 'plain' ? 'Đã sao chép' : 'Sao chép văn bản thuần'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-2 text-slate-800 font-semibold text-center"
            >
              <Download className="w-5 h-5 text-indigo-600" />
              <span>Tải tệp văn bản (.txt)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-2 text-slate-800 font-semibold text-center"
            >
              <Printer className="w-5 h-5 text-slate-700" />
              <span>In ấn / Lưu file PDF</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleCopy(
                  `# BẢN VĂN ĐÃ ĐƯỢC CHUẨN HÓA QC\n\n${finalText}\n\n---\n*Điểm chất lượng: ${
                    report?.overallScore ?? 100
                  }/100 - Phong cách: Chuẩn công sở*`,
                  'md'
                )
              }
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-2 text-slate-800 font-semibold text-center"
            >
              {copiedType === 'md' ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <FileText className="w-5 h-5 text-emerald-600" />
              )}
              <span>{copiedType === 'md' ? 'Đã chép Markdown' : 'Sao chép Markdown'}</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-700 block">Xem trước văn bản hoàn thiện:</span>
            <p className="line-clamp-4 italic text-slate-800 whitespace-pre-wrap font-sans">
              "{finalText}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
