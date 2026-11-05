import React from 'react';
import { QCReport, IssueCategory } from '../types/qc';
import {
  CheckCheck,
  AlertCircle,
  Clock,
  BookOpenCheck,
  SpellCheck,
  Languages,
  PenTool,
  Scissors,
  Quote,
  Sparkles,
} from 'lucide-react';

interface ScoreCardProps {
  report: QCReport | null;
  isLoading: boolean;
  onApplyAll: () => void;
  onTriggerCheck: () => void;
  selectedCategory: IssueCategory | 'all';
  onSelectCategory: (cat: IssueCategory | 'all') => void;
}

export const CATEGORY_BADGES: Record<
  IssueCategory,
  { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string; border: string }
> = {
  spelling: {
    label: 'Chính tả',
    icon: SpellCheck,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  grammar: {
    label: 'Ngữ pháp',
    icon: Languages,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  style: {
    label: 'Văn phong',
    icon: PenTool,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  conciseness: {
    label: 'Cô đọng',
    icon: Scissors,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  punctuation: {
    label: 'Dấu câu',
    icon: Quote,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
};

export const ScoreCard: React.FC<ScoreCardProps> = ({
  report,
  isLoading,
  onApplyAll,
  onTriggerCheck,
  selectedCategory,
  onSelectCategory,
}) => {
  if (!report) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm">Sẵn sàng kiểm soát văn bản</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Nhập hoặc chọn mẫu văn bản ở khung bên trái, sau đó nhấn "Kiểm tra chất lượng" để bắt đầu.
        </p>
        <button
          type="button"
          onClick={onTriggerCheck}
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          {isLoading ? 'Đang phân tích...' : 'Kiểm tra ngay'}
        </button>
      </div>
    );
  }

  const score = report.overallScore;

  // Score color grading
  let scoreColor = 'text-emerald-600';
  let scoreBg = 'bg-emerald-500';
  let scoreRing = 'border-emerald-500';
  let scoreText = 'Đạt chuẩn xuất sắc';

  if (score < 60) {
    scoreColor = 'text-rose-600';
    scoreBg = 'bg-rose-500';
    scoreRing = 'border-rose-500';
    scoreText = 'Cần rà soát kỹ';
  } else if (score < 80) {
    scoreColor = 'text-amber-600';
    scoreBg = 'bg-amber-500';
    scoreRing = 'border-amber-500';
    scoreText = 'Khá ổn, cần trau chuốt';
  }

  const totalIssues = report.issues.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
      {/* Top Score & Status */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Circular Score Badge */}
          <div className="relative w-16 h-16 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col items-center justify-center shadow-inner">
            <span className={`text-2xl font-black ${scoreColor} leading-none tracking-tight`}>
              {score}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">/100</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Chỉ số văn bản
              </span>
              <span className={`w-2 h-2 rounded-full ${scoreBg}`} />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{scoreText}</h4>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <BookOpenCheck className="w-3.5 h-3.5 text-blue-600" />
                {report.readabilityLevel}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                ~{report.readingTimeMinutes} phút đọc
              </span>
            </div>
          </div>
        </div>

        {/* Trigger recheck */}
        <button
          type="button"
          onClick={onTriggerCheck}
          disabled={isLoading}
          className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 flex items-center gap-1.5 shrink-0"
        >
          {isLoading ? (
            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{isLoading ? 'Đang phân tích...' : 'Phân tích lại'}</span>
        </button>
      </div>

      {/* Progress Bar of Score */}
      <div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${scoreBg}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Summary note */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
        <p className="font-medium">{report.summary}</p>
      </div>

      {/* Category Pill Filters */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span>Phân loại vấn đề ({totalIssues})</span>
          {totalIssues > 0 && (
            <button
              type="button"
              onClick={onApplyAll}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Áp dụng tất cả gợi ý</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`px-2 py-1.5 rounded-lg border text-center transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white border-slate-900 font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả ({totalIssues})
          </button>

          {(Object.keys(CATEGORY_BADGES) as IssueCategory[]).map((cat) => {
            const cfg = CATEGORY_BADGES[cat];
            const count = report.categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-2 py-1.5 rounded-lg border text-center transition-all flex items-center justify-center gap-1 ${
                  isSelected
                    ? `${cfg.bg} ${cfg.color} ${cfg.border} font-bold ring-1 ring-current`
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{cfg.label}</span>
                <span className="font-bold text-[11px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
