import test from 'node:test';
import assert from 'node:assert/strict';
import { runLocalRuleChecks } from './ruleChecker';

test('runLocalRuleChecks catches common Vietnamese office typos', () => {
  const text = 'Anh Nam làm việc xuất xắc và sử lý công việc cọ sát rất tốt.';
  const report = runLocalRuleChecks(text);

  assert.ok(report.issues.length >= 3);
  const rules = report.issues.map((i) => i.suggestedText);
  assert.ok(rules.includes('xuất sắc'));
  assert.ok(rules.includes('xử lý'));
  assert.ok(rules.includes('cọ xát'));
});

test('runLocalRuleChecks catches chat abbreviations and informal slang', () => {
  const text = 'Chào các sếp, dự án này ko thể làm kịp đc bh đâu ak.';
  const report = runLocalRuleChecks(text);

  const originals = report.issues.map((i) => i.originalText.toLowerCase());
  assert.ok(originals.includes('các sếp'));
  assert.ok(originals.includes('ko'));
  assert.ok(originals.includes('đc'));
  assert.ok(originals.includes('bh'));
  assert.ok(report.overallScore < 80);
});

test('runLocalRuleChecks gives high score to clean text', () => {
  const clean = 'Kính gửi Ban Giám Đốc, tôi xin gửi bản đề xuất kế hoạch quý 3 để xin ý kiến phê duyệt.';
  const report = runLocalRuleChecks(clean);
  assert.equal(report.issues.length, 0);
  assert.ok(report.overallScore >= 95);
});
