/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ToneType, QCReport, QCIssue, IssueCategory, DocumentHistoryItem } from './types/qc';
import { SAMPLE_TEMPLATES, SampleTemplate } from './data/sampleTemplates';
import { Header } from './components/Header';
import { ScoreCard } from './components/ScoreCard';
import { InteractiveEditor } from './components/InteractiveEditor';
import { IssueInspector } from './components/IssueInspector';
import { WritingGuideModal } from './components/WritingGuideModal';
import { HistoryModal } from './components/HistoryModal';
import { ExportModal } from './components/ExportModal';
import { applySingleFix, applyAllFixes } from './utils/diffHelper';
import { runLocalRuleChecks } from './utils/ruleChecker';

const STORAGE_KEY_HISTORY = 'vanphong_qc_history_v1';

export default function App() {
  const initialTemplate = SAMPLE_TEMPLATES[0];

  const [text, setText] = useState<string>(initialTemplate.text);
  const [initialText, setInitialText] = useState<string>(initialTemplate.text);
  const [currentTone, setCurrentTone] = useState<ToneType>(initialTemplate.targetTone);
  const [report, setReport] = useState<QCReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');

  // Modals
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // History state
  const [history, setHistory] = useState<DocumentHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  }, [history]);

  // Main QC Check function
  const runQCCheck = useCallback(
    async (textToCheck: string, tone: ToneType) => {
      if (!textToCheck.trim()) {
        setReport(null);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/qc-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToCheck,
            targetTone: tone,
            documentType: 'Văn bản công sở',
          }),
        });

        if (!response.ok) {
          throw new Error('Server request failed');
        }

        const data = await response.json();
        if (data.report) {
          setReport(data.report);

          // Add to history if non-empty
          const newItem: DocumentHistoryItem = {
            id: `scan-${Date.now()}`,
            title: textToCheck.slice(0, 40).replace(/\n/g, ' ') + '...',
            timestamp: Date.now(),
            text: textToCheck,
            score: data.report.overallScore,
            targetTone: tone,
            issueCount: data.report.issues.length,
          };

          setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
        }
      } catch (err) {
        console.warn('AI QC request failed, using instant local rule engine:', err);
        const fallback = runLocalRuleChecks(textToCheck, tone);
        setReport(fallback);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial check on mount
  useEffect(() => {
    runQCCheck(initialTemplate.text, initialTemplate.targetTone);
  }, []);

  // Handle template selection
  const handleSelectTemplate = (template: SampleTemplate) => {
    setText(template.text);
    setInitialText(template.text);
    setCurrentTone(template.targetTone);
    setActiveIssueId(null);
    runQCCheck(template.text, template.targetTone);
  };

  // Handle tone change
  const handleSelectTone = (newTone: ToneType) => {
    setCurrentTone(newTone);
    runQCCheck(text, newTone);
  };

  // Apply single fix
  const handleApplyFix = (issue: QCIssue) => {
    const updatedText = applySingleFix(text, issue);
    setText(updatedText);

    if (report) {
      const remainingIssues = report.issues.filter((i) => i.id !== issue.id);
      const newCategoryCounts = { ...report.categoryCounts };
      if (newCategoryCounts[issue.category] > 0) {
        newCategoryCounts[issue.category]--;
      }

      const newScore = Math.min(100, report.overallScore + 5);

      setReport({
        ...report,
        issues: remainingIssues,
        categoryCounts: newCategoryCounts,
        overallScore: newScore,
      });
    }

    if (activeIssueId === issue.id) {
      setActiveIssueId(null);
    }
  };

  // Apply all fixes
  const handleApplyAll = () => {
    if (!report || report.issues.length === 0) return;
    const allFixed = applyAllFixes(text, report.issues);
    setText(allFixed);

    setReport({
      ...report,
      issues: [],
      categoryCounts: {
        spelling: 0,
        grammar: 0,
        style: 0,
        conciseness: 0,
        punctuation: 0,
      },
      overallScore: 100,
      summary: 'Tuyệt vời! Tất cả các lỗi đã được sửa hoàn tất theo chuẩn công sở.',
    });
    setActiveIssueId(null);
  };

  // Dismiss fix
  const handleDismissFix = (issueId: string) => {
    if (!report) return;
    const remainingIssues = report.issues.filter((i) => i.id !== issueId);
    setReport({
      ...report,
      issues: remainingIssues,
    });
    if (activeIssueId === issueId) {
      setActiveIssueId(null);
    }
  };

  // Apply full polished text
  const handleApplyFullText = (newText: string) => {
    setText(newText);
    runQCCheck(newText, currentTone);
  };

  // Reset text
  const handleReset = () => {
    setText(initialText);
    runQCCheck(initialText, currentTone);
  };

  // Clear text
  const handleClear = () => {
    setText('');
    setReport(null);
    setActiveIssueId(null);
  };

  // Select history item
  const handleSelectHistoryItem = (item: DocumentHistoryItem) => {
    setText(item.text);
    setCurrentTone(item.targetTone);
    runQCCheck(item.text, item.targetTone);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Application Header */}
      <Header
        currentTone={currentTone}
        onSelectTone={handleSelectTone}
        onSelectTemplate={handleSelectTemplate}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        historyCount={history.length}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Editor & Canvas (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <InteractiveEditor
              text={text}
              onChangeText={setText}
              report={report}
              activeIssueId={activeIssueId}
              onSelectIssue={setActiveIssueId}
              onClear={handleClear}
              onReset={handleReset}
              hasChanges={text !== initialText}
            />
          </div>

          {/* Right Column: Score & Inspector (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Score & Status Card */}
            <ScoreCard
              report={report}
              isLoading={isLoading}
              onApplyAll={handleApplyAll}
              onTriggerCheck={() => runQCCheck(text, currentTone)}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Issues & Tone Inspector */}
            <IssueInspector
              report={report}
              selectedCategory={selectedCategory}
              activeIssueId={activeIssueId}
              onSelectIssue={setActiveIssueId}
              onApplyFix={handleApplyFix}
              onDismissFix={handleDismissFix}
              onApplyFullText={handleApplyFullText}
              targetTone={currentTone}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <WritingGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        text={text}
        report={report}
      />
    </div>
  );
}
