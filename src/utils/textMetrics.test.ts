import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTextMetrics } from './textMetrics';

test('calculateTextMetrics handles empty string', () => {
  const metrics = calculateTextMetrics('');
  assert.equal(metrics.wordCount, 0);
  assert.equal(metrics.charCount, 0);
  assert.equal(metrics.sentenceCount, 0);
  assert.equal(metrics.readabilityScore, 100);
});

test('calculateTextMetrics counts words and sentences accurately', () => {
  const sample = 'Kính gửi Ban Giám Đốc. Tôi xin gửi báo cáo tuần này. Mọi việc đang đúng tiến độ.';
  const metrics = calculateTextMetrics(sample);
  assert.equal(metrics.wordCount, 18);
  assert.equal(metrics.sentenceCount, 3);
  assert.ok(metrics.readingTimeMinutes >= 1);
  assert.equal(metrics.readabilityLevel, 'Chuẩn công sở');
});

test('calculateTextMetrics penalizes excessively long sentences', () => {
  // Sentence with 40+ words
  const longSentence =
    'Chúng tôi xin kính trình lên cấp trên toàn bộ danh mục tài liệu bao gồm kế hoạch triển khai công việc cũng như các dự toán ngân sách chi tiết từng hạng mục mà phòng ban đã tổng hợp cẩn thận từ các nhà cung ứng bên ngoài trong suốt giai đoạn vừa qua nhằm mục đích xin ý kiến phê duyệt cuối cùng.';
  const metrics = calculateTextMetrics(longSentence);
  assert.ok(metrics.avgWordsPerSentence > 35);
  assert.ok(metrics.readabilityScore < 85);
});
