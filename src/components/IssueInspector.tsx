import React, { useState } from 'react';
import { QCIssue, QCReport, IssueCategory, ToneType, ToneRewriteOption } from '../types/qc';
import { CATEGORY_BADGES } from './ScoreCard';
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Copy,
  ChevronRight,
} from 'lucide-react';

interface IssueInspectorProps {
  report: QCReport | null;
  selectedCategory: IssueCategory | 'all';
  activeIssueId: string | null;
  onSelectIssue: (issueId: string) => void;
  onApplyFix: (issue: QCIssue) => void;
  onDismissFix: (issueId: string) => void;
  onApplyFullText: (text: string) => void;
  targetTone: ToneType;
}

export const IssueInspector: React.FC<IssueInspectorProps> = ({
  report,
  selectedCategory,
  activeIssueId,
  onSelectIssue,
  onApplyFix,
  onDismissFix,
  onApplyFullText,
  targetTone,
}) => {
  const [toneOptions, setToneOptions] = useState<ToneRewriteOption[]>([]);
  const [loadingToneOptions, setLoadingToneOptions] = useState(false);
  const [copiedOptionIdx, setCopiedOptionIdx] = useState<number | null>(null);

  if (!report) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-700 text-sm">Chưa có kết quả kiểm tra</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Vui lòng bấm nút "Kiểm tra chất lượng" để hệ thống quét toàn diện văn bản của bạn.
        </p>
      </div>
    );
  }

  const filteredIssues =
    selectedCategory === 'all'
      ? report.issues
      : report.issues.filter((i) => i.category === selectedCategory);

  const fetchToneVariations = async () => {
    if (!report.suggestedFullRewrite) return;
    setLoadingToneOptions(true);
    try {
      const res = await fetch('/api/rewrite-tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: report.suggestedFullRewrite,
          targetTone,
        }),
      });
      const data = await res.json();
      if (data.options) {
        setToneOptions(data.options);
      }
    } catch (err) {
      console.error('Error fetching tone options:', err);
    } finally {
      setLoadingToneOptions(false);
    }
  };

  const handleCopyOption = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedOptionIdx(idx);
    setTimeout(() => setCopiedOptionIdx(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Tone Assessment Card */}
      <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/50 rounded-2xl border border-indigo-100 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Đánh giá sắc thái & Văn phong</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              report.toneAssessment.toneMatchesTarget
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            {report.toneAssessment.toneMatchesTarget ? 'Khớp phong cách' : 'Cần điều chỉnh'}
          </span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          Phong cách hiện tại:{' '}
          <strong className="text-slate-900">{report.toneAssessment.currentTone}</strong>
        </p>

        {report.toneAssessment.strengths.length > 0 && (
          <div className="mt-2.5 space-y-1">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              Điểm cộng văn phong:
            </div>
            <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5 pl-1">
              {report.toneAssessment.strengths.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </div>
        )}

        {report.toneAssessment.improvements.length > 0 && (
          <div className="mt-2.5 space-y-1">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-600" />
              Cơ hội nâng cấp:
            </div>
            <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5 pl-1">
              {report.toneAssessment.improvements.map((imp, idx) => (
                <li key={idx}>{imp}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Issues List Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Chi tiết đề xuất chỉnh sửa
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
              {filteredIssues.length}
            </span>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">Không có vấn đề nào ở mục này!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Văn bản của bạn đạt chuẩn quy cách cho nhóm lỗi đã chọn.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1 mt-1 space-y-2">
            {filteredIssues.map((issue) => {
              const badgeCfg = CATEGORY_BADGES[issue.category];
              const Icon = badgeCfg.icon;
              const isSelected = activeIssueId === issue.id;

              return (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue.id)}
                  className={`pt-3 pb-3 px-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500 shadow-xs'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50'
                  }`}
                >
                  {/* Category & Rule Title */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${badgeCfg.bg} ${badgeCfg.color} ${badgeCfg.border}`}
                      >
                        <Icon className="w-3 h-3" />
                        {badgeCfg.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{issue.ruleTitle}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onApplyFix(issue);
                        }}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-2xs flex items-center gap-1 transition-all"
                        title="Áp dụng sửa ngay"
                      >
                        <Check className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismissFix(issue.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Bỏ qua gợi ý này"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Before vs After comparison */}
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80 my-2 flex items-center justify-between gap-2 text-xs">
                    <div className="flex-1 font-mono text-slate-600">
                      <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">
                        Văn bản gốc:
                      </span>
                      <span className="line-through text-rose-700 bg-rose-50 px-1 py-0.5 rounded">
                        {issue.originalText}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                    <div className="flex-1 font-mono text-slate-900">
                      <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">
                        Đề xuất thay thế:
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">
                        {issue.suggestedText}
                      </span>
                    </div>
                  </div>

                  {/* Explanation */}
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {issue.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Smart Tone Rewrite Generator Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Phiên bản chuyển đổi văn phong AI
            </h4>
          </div>
          <button
            type="button"
            onClick={fetchToneVariations}
            disabled={loadingToneOptions}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
          >
            {loadingToneOptions ? (
              <span className="animate-spin inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            <span>{toneOptions.length > 0 ? 'Tạo lại các phiên bản' : 'Tạo 3 phiên bản văn phong'}</span>
          </button>
        </div>

        {toneOptions.length === 0 ? (
          <p className="text-xs text-slate-500 leading-relaxed">
            Nhấn "Tạo 3 phiên bản văn phong" để AI xuất ra đồng thời 3 phong cách: Trang trọng hành
            chính, Thuyết phục đàm phán, và Ngắn gọn súc tích.
          </p>
        ) : (
          <div className="space-y-3 mt-3">
            {toneOptions.map((opt, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900">{opt.toneLabel}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyOption(opt.text, idx)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600"
                      title="Sao chép"
                    >
                      {copiedOptionIdx === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplyFullText(opt.text)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-[11px]"
                    >
                      Sử dụng bản này
                    </button>
                  </div>
                </div>

                <p className="text-slate-800 line-clamp-3 italic bg-white p-2 rounded border border-slate-100">
                  "{opt.text}"
                </p>

                {opt.highlights && opt.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {opt.highlights.map((h, hIdx) => (
                      <span
                        key={hIdx}
                        className="text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded font-medium"
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
