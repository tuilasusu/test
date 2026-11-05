import { QCIssue, QCReport, ToneType } from '../types/qc';
import { calculateTextMetrics } from './textMetrics';

interface CommonRule {
  pattern: RegExp;
  replacement: string;
  category: 'spelling' | 'grammar' | 'style' | 'conciseness' | 'punctuation';
  severity: 'error' | 'warning' | 'suggestion';
  ruleTitle: string;
  explanation: string;
}

// Helper to construct Unicode-aware word boundary regex for Vietnamese
function viWord(wordPattern: string, flags = 'giu'): RegExp {
  return new RegExp(`(?<![\\p{L}\\p{N}])${wordPattern}(?![\\p{L}\\p{N}])`, flags);
}

const COMMON_OFFICE_RULES: CommonRule[] = [
  // Lỗi chính tả tiếng Việt văn phòng phổ biến
  {
    pattern: viWord('xuất xắc'),
    replacement: 'xuất sắc',
    category: 'spelling',
    severity: 'error',
    ruleTitle: 'Lỗi chính tả x/s',
    explanation: 'Viết đúng chuẩn từ điển tiếng Việt là "xuất sắc" (tài giỏi vượt bậc), không phải "xuất xắc".',
  },
  {
    pattern: viWord('sử lý'),
    replacement: 'xử lý',
    category: 'spelling',
    severity: 'error',
    ruleTitle: 'Lỗi chính tả x/s',
    explanation: 'Viết đúng chính tả là "xử lý" (giải quyết công việc), không dùng "sử lý".',
  },
  {
    pattern: viWord('cọ sát'),
    replacement: 'cọ xát',
    category: 'spelling',
    severity: 'error',
    ruleTitle: 'Lỗi chính tả x/s',
    explanation: 'Chuẩn chính tả là "cọ xát" (tiếp xúc va chạm học hỏi), "sát" chỉ gần kề.',
  },
  {
    pattern: viWord('rút cuộc'),
    replacement: 'rốt cuộc',
    category: 'spelling',
    severity: 'warning',
    ruleTitle: 'Từ ngữ chuẩn mực',
    explanation: 'Trong văn bản hành chính công sở, nên dùng "rốt cuộc" thay vì khẩu ngữ "rút cuộc".',
  },
  {
    pattern: viWord('sát nhập'),
    replacement: 'sáp nhập',
    category: 'spelling',
    severity: 'error',
    ruleTitle: 'Thuật ngữ doanh nghiệp',
    explanation: 'Thuật ngữ pháp lý doanh nghiệp chuẩn là "sáp nhập" (hợp nhất), không phải "sát nhập".',
  },
  {
    pattern: viWord('bổ xung'),
    replacement: 'bổ sung',
    category: 'spelling',
    severity: 'error',
    ruleTitle: 'Lỗi chính tả s/x',
    explanation: 'Từ chuẩn tiếng Việt là "bổ sung" (thêm vào cho đủ), không phải "bổ xung".',
  },
  {
    pattern: viWord('sơ xuất'),
    replacement: 'sơ suất',
    category: 'spelling',
    severity: 'error',
    ruleTitle: 'Lỗi chính tả s/x',
    explanation: 'Viết đúng là "sơ suất" (thiếu sót không cẩn thận), "suất" trong phần/suất ăn.',
  },
  {
    pattern: viWord('vô hình chung'),
    replacement: 'vô hình trung',
    category: 'spelling',
    severity: 'warning',
    ruleTitle: 'Thành ngữ - Cụm từ',
    explanation: '"Vô hình trung" (tự nhiên mà thành ra như thế) là cụm từ gốc Hán Việt đúng chuẩn.',
  },
  {
    pattern: viWord('chuẩn chu'),
    replacement: 'chỉn chu',
    category: 'spelling',
    severity: 'error',
    ruleTitle: 'Lỗi dùng từ',
    explanation: 'Từ ngữ chuẩn tiếng Việt thể hiện tính cẩn thận là "chỉn chu", không phải "chuẩn chu".',
  },
  {
    pattern: viWord('sáng lạng'),
    replacement: 'xán lạn',
    category: 'spelling',
    severity: 'error',
    ruleTitle: 'Lỗi từ Hán Việt',
    explanation: 'Từ đúng là "xán lạn" (tươi sáng, rực rỡ), thường bị nói trại thành "sáng lạng".',
  },
  {
    pattern: viWord('chính sát'),
    replacement: 'chính xác',
    category: 'spelling',
    severity: 'error',
    ruleTitle: 'Lỗi chính tả',
    explanation: 'Viết đúng là "chính xác", không dùng "chính sát".',
  },
  {
    pattern: viWord('tựu chung'),
    replacement: 'tựu trung',
    category: 'spelling',
    severity: 'warning',
    ruleTitle: 'Từ Hán Việt',
    explanation: 'Nên dùng "tựu trung" (tóm lại, quy về điểm chính) trong văn bản tổng kết.',
  },

  // Viết tắt & khẩu ngữ tin nhắn chat (Chat slang)
  {
    pattern: viWord('(?:đc|dc)'),
    replacement: 'được',
    category: 'style',
    severity: 'error',
    ruleTitle: 'Không viết tắt tin nhắn',
    explanation: 'Văn bản công sở không được dùng viết tắt chat "đc/dc", hãy ghi đầy đủ "được".',
  },
  {
    pattern: viWord('(?:ko|k|hem)'),
    replacement: 'không',
    category: 'style',
    severity: 'error',
    ruleTitle: 'Không viết tắt tin nhắn',
    explanation: 'Thay thế từ viết tắt "ko/k" bằng từ chuẩn mực "không".',
  },
  {
    pattern: viWord('(?:oke|okie|ok)'),
    replacement: 'đồng ý / xác nhận',
    category: 'style',
    severity: 'warning',
    ruleTitle: 'Khẩu ngữ ngoại lai',
    explanation: 'Trong email công việc, nên dùng "xác nhận", "nhất trí" hoặc "tiếp nhận" thay cho "ok".',
  },
  {
    pattern: viWord('bh'),
    replacement: 'bây giờ',
    category: 'style',
    severity: 'error',
    ruleTitle: 'Viết tắt tùy tiện',
    explanation: 'Không viết tắt "bh" trong báo cáo hoặc trao đổi công vụ.',
  },
  {
    pattern: viWord('nv'),
    replacement: 'nhân viên',
    category: 'style',
    severity: 'warning',
    ruleTitle: 'Viết tắt chức danh',
    explanation: 'Nên viết rõ "nhân viên" để thể hiện sự tôn trọng trong văn bản.',
  },
  {
    pattern: viWord('mn'),
    replacement: 'mọi người / quý đồng nghiệp',
    category: 'style',
    severity: 'warning',
    ruleTitle: 'Khẩu ngữ xưng hô',
    explanation: 'Thay vì viết tắt "mn", hãy dùng "quý đồng nghiệp", "anh/chị" hoặc "các phòng ban".',
  },
  {
    pattern: viWord('ib'),
    replacement: 'trao đổi riêng / gửi tin nhắn',
    category: 'style',
    severity: 'warning',
    ruleTitle: 'Tiếng lóng mạng xã hội',
    explanation: 'Dùng "trao đổi riêng" hoặc "liên hệ trực tiếp" thay vì lóng mạng xã hội "ib".',
  },
  {
    pattern: viWord('(?:ak|nhen|nha)'),
    replacement: 'ạ / nhé',
    category: 'style',
    severity: 'warning',
    ruleTitle: 'Trợ từ cảm thán không phù hợp',
    explanation: 'Tránh dùng từ đệm mạng xã hội (nha, nhen, ak) trong email và báo cáo công sở.',
  },
  {
    pattern: viWord('các sếp'),
    replacement: 'Ban Lãnh đạo',
    category: 'style',
    severity: 'warning',
    ruleTitle: 'Xưng hô công vụ chuẩn mực',
    explanation: 'Trong văn bản đề xuất hoặc báo cáo, nên xưng "Ban Lãnh đạo" hoặc "Quý cấp trên" thay vì "các sếp".',
  },
  {
    pattern: viWord('deal lương'),
    replacement: 'thương lượng đãi ngộ',
    category: 'style',
    severity: 'suggestion',
    ruleTitle: 'Việt hóa thuật ngữ nhân sự',
    explanation: 'Có thể thay "deal lương" bằng "thương thảo chế độ đãi ngộ" hoặc "thỏa thuận mức lương".',
  },

  // Văn phong dài dòng & rườm rà (Conciseness)
  {
    pattern: viWord('rất là'),
    replacement: 'rất',
    category: 'conciseness',
    severity: 'suggestion',
    ruleTitle: 'Từ thừa thãi',
    explanation: 'Cắt bỏ chữ "là" để câu văn gãy gọn, dứt khoát hơn: dùng "rất" thay vì "rất là".',
  },
  {
    pattern: viWord('vô cùng là'),
    replacement: 'vô cùng',
    category: 'conciseness',
    severity: 'suggestion',
    ruleTitle: 'Từ thừa thãi',
    explanation: 'Dùng trực tiếp "vô cùng" thay vì kéo dài thành "vô cùng là".',
  },
  {
    pattern: viWord('nhằm mục đích để'),
    replacement: 'để',
    category: 'conciseness',
    severity: 'suggestion',
    ruleTitle: 'Lặp ý mục đích',
    explanation: '"Nhằm mục đích để" bị trùng lặp nghĩa. Chỉ cần dùng ngắn gọn là "để" hoặc "nhằm".',
  },

  // Quy cách dấu câu & hình thức
  {
    pattern: /([,;:.?!])([^\s0-9\n"'\)\]\}])/g,
    replacement: '$1 $2',
    category: 'punctuation',
    severity: 'error',
    ruleTitle: 'Thiếu dấu cách sau dấu câu',
    explanation: 'Theo quy chuẩn soạn thảo văn bản, luôn phải có một dấu cách (space) sau dấu chấm, phẩy, hai chấm.',
  },
  {
    pattern: /[\!\?]{2,}/g,
    replacement: '!',
    category: 'punctuation',
    severity: 'warning',
    ruleTitle: 'Lạm dụng dấu cảm thán / chấm hỏi',
    explanation: 'Không dùng liên tiếp nhiều dấu chấm hỏi hoặc chấm than (??, !!) trong văn bản công việc.',
  },
];

/**
 * Runs deterministic rule-based checks on the input text.
 */
export function runLocalRuleChecks(text: string, targetTone: ToneType = 'professional'): QCReport {
  const metrics = calculateTextMetrics(text);
  const issues: QCIssue[] = [];
  const categoryCounts = {
    spelling: 0,
    grammar: 0,
    style: 0,
    conciseness: 0,
    punctuation: 0,
  };

  if (!text.trim()) {
    return {
      overallScore: 100,
      readabilityLevel: 'Chuẩn công sở',
      summary: 'Vui lòng nhập văn bản để hệ thống tiến hành kiểm tra QC.',
      wordCount: 0,
      charCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      readingTimeMinutes: 0,
      issues: [],
      categoryCounts,
      toneAssessment: {
        currentTone: 'Chưa xác định',
        toneMatchesTarget: true,
        score: 100,
        strengths: [],
        improvements: [],
      },
      suggestedFullRewrite: '',
    };
  }

  // Execute rules
  let issueCounter = 1;
  for (const rule of COMMON_OFFICE_RULES) {
    const matches = Array.from(text.matchAll(rule.pattern));
    for (const match of matches) {
      if (match.index !== undefined) {
        const originalText = match[0];
        let suggestedText = rule.replacement;

        // If replacement contains capture groups
        if (rule.replacement.includes('$')) {
          suggestedText = originalText.replace(rule.pattern, rule.replacement);
        }

        issues.push({
          id: `rule-${issueCounter++}`,
          category: rule.category,
          severity: rule.severity,
          originalText,
          suggestedText,
          explanation: rule.explanation,
          ruleTitle: rule.ruleTitle,
          startIndex: match.index,
          endIndex: match.index + originalText.length,
        });

        categoryCounts[rule.category]++;
      }
    }
  }

  // Check long sentences
  const sentenceList = text.match(/[^.!?\n]+[.!?]?/g) || [];
  sentenceList.forEach((s) => {
    const sTrimmed = s.trim();
    const wCount = sTrimmed.split(/\s+/).length;
    if (wCount > 35) {
      const idx = text.indexOf(sTrimmed);
      issues.push({
        id: `rule-${issueCounter++}`,
        category: 'conciseness',
        severity: 'warning',
        originalText: sTrimmed.slice(0, 45) + '...',
        suggestedText: 'Tách thành 2-3 câu ngắn',
        explanation: `Câu này chứa ${wCount} từ, dài hơn tiêu chuẩn công sở (15-25 từ), gây giảm khả năng tiếp nhận thông tin.`,
        ruleTitle: 'Câu quá dài, phức tạp',
        startIndex: idx !== -1 ? idx : undefined,
      });
      categoryCounts.conciseness++;
    }
  });

  // Calculate overall score (starts at 100, deducted per issue)
  let score = 100;
  score -= categoryCounts.spelling * 8; // Heavy penalty for spelling
  score -= categoryCounts.grammar * 6;
  score -= categoryCounts.style * 5;
  score -= categoryCounts.punctuation * 4;
  score -= categoryCounts.conciseness * 3;

  score = Math.max(25, Math.min(100, score));

  // Tone Assessment
  const toneStrengths: string[] = [];
  const toneImprovements: string[] = [];

  if (categoryCounts.style === 0 && categoryCounts.spelling === 0) {
    toneStrengths.push('Không có từ viết tắt chat tùy tiện.');
    toneStrengths.push('Văn phong nghiêm túc, đúng chuẩn công sở.');
  } else {
    toneImprovements.push('Cần loại bỏ triệt để từ ngữ khẩu ngữ mạng xã hội.');
  }

  if (metrics.avgWordsPerSentence <= 24) {
    toneStrengths.push('Độ dài câu cân đối, mạch lạc, dễ theo dõi.');
  } else {
    toneImprovements.push('Nên chia nhỏ các câu dài để người đọc nắm bắt ý nhanh hơn.');
  }

  const toneLabels: Record<ToneType, string> = {
    professional: 'Chuyên nghiệp & Chuẩn mực',
    formal: 'Trang trọng & Hành chính',
    persuasive: 'Thuyết phục & Tự tin',
    concise: 'Ngắn gọn & Súc tích',
    friendly: 'Thân thiện & Tích cực',
  };

  const summary =
    issues.length === 0
      ? `Văn bản đạt chuẩn xuất sắc (${score}/100). Không phát hiện lỗi chính tả hoặc vi phạm quy cách hành chính cơ bản.`
      : `Phát hiện ${issues.length} điểm cần cải thiện (${categoryCounts.spelling} lỗi chính tả, ${categoryCounts.style} lỗi văn phong, ${categoryCounts.punctuation} lỗi dấu câu). Điểm đánh giá: ${score}/100.`;

  return {
    overallScore: score,
    readabilityLevel: metrics.readabilityLevel,
    summary,
    wordCount: metrics.wordCount,
    charCount: metrics.charCount,
    sentenceCount: metrics.sentenceCount,
    paragraphCount: metrics.paragraphCount,
    readingTimeMinutes: metrics.readingTimeMinutes,
    issues,
    categoryCounts,
    toneAssessment: {
      currentTone: categoryCounts.style > 2 ? 'Khẩu ngữ / Tự do' : toneLabels[targetTone],
      toneMatchesTarget: categoryCounts.style === 0 && score >= 80,
      score: Math.max(30, score - categoryCounts.style * 4),
      strengths: toneStrengths,
      improvements: toneImprovements,
    },
    suggestedFullRewrite: '',
  };
}
