import React, { useState } from 'react';
import { QCIssue, QCReport } from '../types/qc';
import { generateWordDiff } from '../utils/diffHelper';
import {
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Upload,
  Sparkles,
  Columns2,
  FileCheck,
  FileEdit,
} from 'lucide-react';

interface InteractiveEditorProps {
  text: string;
  onChangeText: (newText: string) => void;
  report: QCReport | null;
  activeIssueId: string | null;
  onSelectIssue: (issueId: string) => void;
  onClear: () => void;
  onReset: () => void;
  hasChanges: boolean;
}

export const InteractiveEditor: React.FC<InteractiveEditorProps> = ({
  text,
  onChangeText,
  report,
  activeIssueId,
  onSelectIssue,
  onClear,
  onReset,
  hasChanges,
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'diff' | 'final'>('edit');
  const [copied, setCopied] = useState(false);

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChangeText(content);
      }
    };
    reader.readAsText(file);
  };

  // Build highlighted view if report has issues
  const renderHighlightedText = () => {
    if (!report || report.issues.length === 0 || !text) {
      return null;
    }

    // Sort issues by start position
    const sortedIssues = [...report.issues]
      .filter((i) => text.toLowerCase().includes(i.originalText.toLowerCase()))
      .sort((a, b) => {
        const idxA = text.toLowerCase().indexOf(a.originalText.toLowerCase());
        const idxB = text.toLowerCase().indexOf(b.originalText.toLowerCase());
        return idxA - idxB;
      });

    // Create segments
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    for (let idx = 0; idx < sortedIssues.length; idx++) {
      const issue = sortedIssues[idx];
      const matchPos = text.toLowerCase().indexOf(issue.originalText.toLowerCase(), lastIndex);

      if (matchPos === -1) continue;

      // Add text before match
      if (matchPos > lastIndex) {
        elements.push(
          <span key={`plain-${lastIndex}`}>{text.slice(lastIndex, matchPos)}</span>
        );
      }

      const matchText = text.slice(matchPos, matchPos + issue.originalText.length);
      const isSelected = activeIssueId === issue.id;

      // Category underline styles
      let underlineStyle = 'decoration-rose-500 bg-rose-50/80 text-rose-950';
      if (issue.category === 'grammar') {
        underlineStyle = 'decoration-amber-500 bg-amber-50/80 text-amber-950';
      } else if (issue.category === 'style') {
        underlineStyle = 'decoration-blue-500 bg-blue-50/80 text-blue-950';
      } else if (issue.category === 'conciseness') {
        underlineStyle = 'decoration-emerald-500 bg-emerald-50/80 text-emerald-950';
      } else if (issue.category === 'punctuation') {
        underlineStyle = 'decoration-purple-500 bg-purple-50/80 text-purple-950';
      }

      elements.push(
        <button
          key={`issue-${issue.id}-${matchPos}`}
          type="button"
          onClick={() => onSelectIssue(issue.id)}
          className={`cursor-pointer underline decoration-wavy decoration-2 font-medium px-0.5 rounded transition-all inline ${underlineStyle} ${
            isSelected ? 'ring-2 ring-blue-600 shadow-xs' : 'hover:opacity-80'
          }`}
          title={`${issue.ruleTitle}: "${issue.originalText}" -> "${issue.suggestedText}"`}
        >
          {matchText}
        </button>
      );

      lastIndex = matchPos + issue.originalText.length;
    }

    if (lastIndex < text.length) {
      elements.push(<span key={`plain-end`}>{text.slice(lastIndex)}</span>);
    }

    return elements;
  };

  const polishedText = report?.suggestedFullRewrite || text;
  const wordDiff = generateWordDiff(text, polishedText);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full min-h-[580px] overflow-hidden">
      {/* Top Editor Tab Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 px-3 sm:px-4 py-2 bg-slate-50/60 gap-1">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'edit'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Soạn thảo & Sửa lỗi</span>
            <span className="sm:hidden">Soạn thảo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'diff'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">So sánh Đối chiếu</span>
            <span className="sm:hidden">Đối chiếu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('final')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'final'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bản hoàn thiện</span>
            <span className="sm:hidden">Hoàn thiện</span>
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1 text-slate-500">
          <label
            className="p-1.5 hover:text-slate-800 hover:bg-slate-200/60 rounded-md cursor-pointer transition-colors"
            title="Tải tệp văn bản (.txt, .md)"
          >
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".txt,.md,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {hasChanges && (
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors"
              title="Khôi phục văn bản ban đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleCopy(activeTab === 'final' ? polishedText : text)}
            className="p-1.5 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors"
            title="Sao chép nội dung"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClear}
            className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Xóa trắng văn bản"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 flex flex-col relative overflow-y-auto font-sans leading-relaxed text-sm">
        {activeTab === 'edit' && (
          <div className="flex-1 flex flex-col space-y-4">
            {/* If there are highlighted issues, show visual interactive overlay preview */}
            {report && report.issues.length > 0 && (
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 mb-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    Chế độ phát hiện lỗi trực quan (Nhấp vào từ gạch chân để sửa)
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">
                    {report.issues.length} vị trí cần chú ý
                  </span>
                </div>
                <div className="text-slate-800 whitespace-pre-wrap leading-relaxed select-text font-normal">
                  {renderHighlightedText()}
                </div>
              </div>
            )}

            {/* Direct Text Editor */}
            <div className="flex-1 flex flex-col">
              <label htmlFor="qc-editor-textarea" className="text-xs font-bold text-slate-500 mb-1">
                Khung nhập và chỉnh sửa văn bản:
              </label>
              <textarea
                id="qc-editor-textarea"
                value={text}
                onChange={(e) => onChangeText(e.target.value)}
                placeholder="Dán hoặc soạn thảo văn bản công sở của bạn tại đây (email, báo cáo, đề xuất, công văn...)..."
                className="w-full flex-1 min-h-[300px] p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 leading-relaxed text-sm resize-none font-sans"
              />
            </div>
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs font-semibold pb-2 border-b border-slate-100">
              <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                Đoạn văn bản bị loại bỏ / sửa
              </span>
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Đoạn văn bản được thêm vào / tối ưu
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-sans whitespace-pre-wrap text-sm leading-loose">
              {wordDiff.map((part, index) => {
                if (part.type === 'removed') {
                  return (
                    <del
                      key={index}
                      className="bg-rose-100 text-rose-800 line-through decoration-rose-500 px-1 py-0.5 rounded mx-0.5"
                    >
                      {part.value}
                    </del>
                  );
                }
                if (part.type === 'added') {
                  return (
                    <ins
                      key={index}
                      className="bg-emerald-100 text-emerald-800 no-underline font-semibold px-1 py-0.5 rounded mx-0.5"
                    >
                      {part.value}
                    </ins>
                  );
                }
                return <span key={index}>{part.value}</span>;
              })}
            </div>
          </div>
        )}

        {activeTab === 'final' && (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Toàn bộ văn bản đã được tối ưu hóa toàn diện theo chuẩn công sở:
              </span>
              <button
                type="button"
                onClick={() => handleCopy(polishedText)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép bản hoàn thiện'}</span>
              </button>
            </div>

            <div className="p-5 bg-blue-50/30 rounded-xl border border-blue-100 text-slate-800 whitespace-pre-wrap leading-relaxed text-sm flex-1 font-sans">
              {polishedText}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="border-t border-slate-200 px-4 py-2 bg-slate-50 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>{report?.wordCount ?? text.trim().split(/\s+/).filter(Boolean).length} từ</span>
          <span>{report?.charCount ?? text.length} ký tự</span>
          <span>{report?.sentenceCount ?? 1} câu</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Tự động kiểm tra chất lượng theo chuẩn công vụ</span>
        </div>
      </div>
    </div>
  );
};
