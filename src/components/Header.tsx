import React from 'react';
import { ToneType } from '../types/qc';
import { SAMPLE_TEMPLATES, SampleTemplate } from '../data/sampleTemplates';
import {
  FileCheck2,
  Sparkles,
  BookOpen,
  History,
  Download,
  FileText,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  currentTone: ToneType;
  onSelectTone: (tone: ToneType) => void;
  onSelectTemplate: (template: SampleTemplate) => void;
  onOpenGuide: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  historyCount: number;
}

export const TONE_CONFIGS: Record<
  ToneType,
  { label: string; desc: string; icon: string; bg: string; text: string; activeBorder: string }
> = {
  professional: {
    label: 'Chuyên nghiệp',
    desc: 'Chuẩn mực công sở, lịch sự, rõ ràng',
    icon: '👔',
    bg: 'hover:bg-blue-50',
    text: 'text-blue-700',
    activeBorder: 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 text-blue-800',
  },
  formal: {
    label: 'Trang trọng',
    desc: 'Hành chính, gửi cấp trên, đối tác lớn',
    icon: '🏛️',
    bg: 'hover:bg-amber-50',
    text: 'text-amber-800',
    activeBorder: 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20 text-amber-900',
  },
  persuasive: {
    label: 'Thuyết phục',
    desc: 'Đề xuất dự án, pitching, đàm phán',
    icon: '🎯',
    bg: 'hover:bg-indigo-50',
    text: 'text-indigo-700',
    activeBorder: 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 text-indigo-900',
  },
  concise: {
    label: 'Ngắn gọn',
    desc: 'Súc tích, cô đọng, cắt từ thừa',
    icon: '⚡',
    bg: 'hover:bg-emerald-50',
    text: 'text-emerald-700',
    activeBorder: 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 text-emerald-900',
  },
  friendly: {
    label: 'Thân thiện',
    desc: 'Giao tiếp team nội bộ, CSKH chu đáo',
    icon: '🤝',
    bg: 'hover:bg-teal-50',
    text: 'text-teal-700',
    activeBorder: 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20 text-teal-900',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentTone,
  onSelectTone,
  onSelectTemplate,
  onOpenGuide,
  onOpenHistory,
  onOpenExport,
  historyCount,
}) => {
  const [templateMenuOpen, setTemplateMenuOpen] = React.useState(false);

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:h-16 gap-2">
          {/* Logo & Branding */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                    VĂN PHÒNG <span className="text-blue-600">QC</span>
                  </span>
                  <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                    Bản Doanh Nghiệp
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Kiểm soát chính tả, ngữ pháp & chuẩn hóa văn phong công sở
                </p>
              </div>
            </div>

            {/* Mobile Actions in top right */}
            <div className="flex items-center gap-1 sm:hidden">
              <button
                type="button"
                onClick={onOpenExport}
                className="p-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg shadow-xs"
                title="Xuất văn bản"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 overflow-x-auto">
            {/* Sample Templates Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                aria-label="Chọn mẫu văn bản công sở"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Mẫu văn bản</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {templateMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setTemplateMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Chọn mẫu văn bản thử nghiệm:
                    </div>
                    {SAMPLE_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          onSelectTemplate(tmpl);
                          setTemplateMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors flex flex-col gap-0.5 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span className="truncate">{tmpl.title}</span>
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-normal shrink-0 ml-1">
                            {tmpl.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{tmpl.description}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Guide Button */}
            <button
              type="button"
              onClick={onOpenGuide}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              title="Cẩm nang quy chuẩn văn bản công sở"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Quy chuẩn văn bản</span>
              <span className="md:hidden">Quy chuẩn</span>
            </button>

            {/* History Button */}
            <button
              type="button"
              onClick={onOpenHistory}
              className="relative flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              title="Lịch sử kiểm tra gần đây"
            >
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Lịch sử</span>
              {historyCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Export Button (Desktop) */}
            <button
              type="button"
              onClick={onOpenExport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              title="Xuất văn bản"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất văn bản</span>
            </button>
          </div>
        </div>

        {/* Tone Selector Bar */}
        <div className="py-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium shrink-0">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-800">Phong cách mục tiêu:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            {(Object.keys(TONE_CONFIGS) as ToneType[]).map((t) => {
              const cfg = TONE_CONFIGS[t];
              const isSelected = currentTone === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onSelectTone(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    isSelected
                      ? cfg.activeBorder
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                  title={cfg.desc}
                >
                  <span>{cfg.icon}</span>
                  <span className="font-semibold">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
