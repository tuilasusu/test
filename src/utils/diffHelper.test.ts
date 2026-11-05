import test from 'node:test';
import assert from 'node:assert/strict';
import { applySingleFix, applyAllFixes, generateWordDiff } from './diffHelper';
import { QCIssue } from '../types/qc';

test('applySingleFix substitutes target text accurately', () => {
  const original = 'Tôi thấy báo cáo rất xuất xắc.';
  const fixed = applySingleFix(original, {
    originalText: 'xuất xắc',
    suggestedText: 'xuất sắc',
  });
  assert.equal(fixed, 'Tôi thấy báo cáo rất xuất sắc.');
});

test('applyAllFixes applies multiple fixes in sequence', () => {
  const original = 'Chào sếp, việc này ko làm kịp đc.';
  const issues: QCIssue[] = [
    {
      id: '1',
      category: 'style',
      severity: 'error',
      originalText: 'ko',
      suggestedText: 'không',
      explanation: 'viết tắt',
      ruleTitle: 'Lỗi',
    },
    {
      id: '2',
      category: 'style',
      severity: 'error',
      originalText: 'đc',
      suggestedText: 'được',
      explanation: 'viết tắt',
      ruleTitle: 'Lỗi',
    },
  ];

  const fixed = applyAllFixes(original, issues);
  assert.equal(fixed, 'Chào sếp, việc này không làm kịp được.');
});

test('generateWordDiff identifies additions and removals', () => {
  const diff = generateWordDiff('báo cáo sơ xuất', 'báo cáo sơ suất');
  const removed = diff.find((d) => d.type === 'removed');
  const added = diff.find((d) => d.type === 'added');
  assert.equal(removed?.value, 'xuất');
  assert.equal(added?.value, 'suất');
});
