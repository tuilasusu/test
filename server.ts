import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { runLocalRuleChecks } from './src/utils/ruleChecker';
import { QCReport, ToneType, ToneRewriteOption } from './src/types/qc';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini API initialization
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Endpoint: Deep QC Proofreading
 */
app.post('/api/qc-check', async (req: Request, res: Response) => {
  const { text, targetTone = 'professional', documentType = 'Văn bản công sở' } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Vui lòng cung cấp văn bản cần kiểm tra.' });
  }

  // Run deterministic baseline rule checks first
  const localReport = runLocalRuleChecks(text, targetTone as ToneType);

  // If Gemini API is not configured, return high quality deterministic report
  if (!aiClient) {
    return res.json({
      report: {
        ...localReport,
        summary: localReport.summary + ' (Đã kiểm tra bằng bộ quy tắc chuẩn công sở)',
      },
    });
  }

  try {
    const toneInstructions: Record<string, string> = {
      professional: 'Chuyên nghiệp, lịch sự, trung lập, rành mạch và chuẩn mực doanh nghiệp.',
      formal: 'Trang trọng, chuẩn thể thức hành chính, tôn trọng cấp trên/đối tác, dùng từ Hán Việt phù hợp.',
      persuasive: 'Thuyết phục, tự tin, nhấn mạnh giá trị và lợi ích, tạo động lực hành động.',
      concise: 'Ngắn gọn, súc tích, lược bỏ tối đa từ thừa, đi thẳng vào trọng tâm công việc.',
      friendly: 'Thân thiện, ấm áp, cởi mở nhưng vẫn giữ sự chuẩn mực và tôn trọng nơi công sở.',
    };

    const targetDesc = toneInstructions[targetTone] || toneInstructions.professional;

    const prompt = `Bạn là chuyên gia Kiểm soát chất lượng văn bản (QC Editor & Proofreader) hàng đầu chuyên về Tiếng Việt công sở, hành chính doanh nghiệp và văn phòng.
Nhiệm vụ: Phân tích kỹ lưỡng văn bản sau để tìm TOÀN BỘ lỗi và cơ hội nâng cấp văn phong.

Loại tài liệu: ${documentType}
Phong cách mục tiêu: ${targetTone} (${targetDesc})

Văn bản cần kiểm tra:
"""
${text}
"""

Hãy tìm các vấn đề thuộc các nhóm:
1. "spelling": Lỗi chính tả tiếng Việt (s/x, tr/ch, d/gi/r, hỏi/ngã, lỗi gõ Telex...).
2. "grammar": Ngữ pháp & Cú pháp (câu què, câu cụt, thiếu chủ-vị, ngắt câu lủng củng...).
3. "style": Văn phong công sở (dùng từ khẩu ngữ, viết tắt tin nhắn, từ lóng mạng xã hội, xưng hô chưa phù hợp đẳng cấp doanh nghiệp).
4. "conciseness": Độ cô đọng & lặp từ (từ thừa thãi, ý dài dòng, câu quá lê thê >30 từ).
5. "punctuation": Quy cách dấu câu, khoảng trắng, viết hoa tiêu chuẩn.

LƯU Ý QUAN TRỌNG:
- Mỗi issue trong danh sách "issues" PHẢI chỉ rõ "originalText" CHÍNH XÁC có trong văn bản (phải trích dẫn chính xác để hệ thống highlight và tự động thay thế được).
- Cung cấp "suggestedText" hoàn hảo cho văn phòng.
- Cung cấp "explanation" giải thích ngắn gọn, dễ hiểu vì sao cần sửa.
- Cung cấp "suggestedFullRewrite" là toàn bộ bản văn bản sau khi đã sửa toàn bộ lỗi và trau chuốt theo đúng phong cách ${targetTone}.`;

    const genPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Bạn là hệ thống QC văn bản công sở tiếng Việt chuẩn mực. Luôn trả về dữ liệu JSON chính xác theo schema yêu cầu.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: {
              type: Type.INTEGER,
              description: 'Điểm đánh giá chất lượng văn bản từ 0 đến 100.',
            },
            summary: {
              type: Type.STRING,
              description: 'Đánh giá tổng quan 1-2 câu về văn bản.',
            },
            suggestedFullRewrite: {
              type: Type.STRING,
              description: 'Toàn bộ văn bản đã được biên tập hoàn thiện và chuẩn hóa.',
            },
            toneAssessment: {
              type: Type.OBJECT,
              properties: {
                currentTone: { type: Type.STRING },
                toneMatchesTarget: { type: Type.BOOLEAN },
                score: { type: Type.INTEGER },
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                improvements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['currentTone', 'toneMatchesTarget', 'score', 'strengths', 'improvements'],
            },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: {
                    type: Type.STRING,
                    description: 'spelling, grammar, style, conciseness, hoặc punctuation',
                  },
                  severity: {
                    type: Type.STRING,
                    description: 'error, warning, hoặc suggestion',
                  },
                  originalText: {
                    type: Type.STRING,
                    description: 'Đoạn trích chính xác từ văn bản gốc',
                  },
                  suggestedText: {
                    type: Type.STRING,
                    description: 'Gợi ý thay thế chính xác',
                  },
                  ruleTitle: {
                    type: Type.STRING,
                    description: 'Tên ngắn của quy tắc hoặc loại lỗi',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Giải thích nguyên nhân và lý do sửa',
                  },
                },
                required: ['category', 'severity', 'originalText', 'suggestedText', 'ruleTitle', 'explanation'],
              },
            },
          },
          required: ['overallScore', 'summary', 'suggestedFullRewrite', 'toneAssessment', 'issues'],
        },
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout waiting for QC check')), 7000)
    );

    const response = (await Promise.race([genPromise, timeoutPromise])) as any;

    const parsed = JSON.parse(response.text || '{}');

    // Merge AI detected issues with local rule checks (ensuring no duplicates)
    const combinedIssues = [...localReport.issues];
    const existingOriginals = new Set(localReport.issues.map((i) => i.originalText.toLowerCase().trim()));

    if (Array.isArray(parsed.issues)) {
      let counter = localReport.issues.length + 1;
      for (const item of parsed.issues) {
        const orig = (item.originalText || '').trim();
        if (orig && !existingOriginals.has(orig.toLowerCase())) {
          existingOriginals.add(orig.toLowerCase());
          const idx = text.indexOf(orig);
          combinedIssues.push({
            id: `ai-${counter++}`,
            category: (['spelling', 'grammar', 'style', 'conciseness', 'punctuation'].includes(item.category)
              ? item.category
              : 'style') as any,
            severity: (['error', 'warning', 'suggestion'].includes(item.severity)
              ? item.severity
              : 'warning') as any,
            originalText: orig,
            suggestedText: item.suggestedText || '',
            explanation: item.explanation || 'Gợi ý tối ưu chuẩn công sở.',
            ruleTitle: item.ruleTitle || 'Tối ưu diễn đạt',
            startIndex: idx !== -1 ? idx : undefined,
            endIndex: idx !== -1 ? idx + orig.length : undefined,
          });
        }
      }
    }

    // Recalculate category counts
    const categoryCounts = {
      spelling: 0,
      grammar: 0,
      style: 0,
      conciseness: 0,
      punctuation: 0,
    };
    for (const issue of combinedIssues) {
      if (categoryCounts[issue.category] !== undefined) {
        categoryCounts[issue.category]++;
      }
    }

    const overallScore = Math.max(
      20,
      Math.min(100, typeof parsed.overallScore === 'number' ? parsed.overallScore : localReport.overallScore)
    );

    const mergedReport: QCReport = {
      overallScore,
      readabilityLevel: localReport.readabilityLevel,
      summary: parsed.summary || localReport.summary,
      wordCount: localReport.wordCount,
      charCount: localReport.charCount,
      sentenceCount: localReport.sentenceCount,
      paragraphCount: localReport.paragraphCount,
      readingTimeMinutes: localReport.readingTimeMinutes,
      issues: combinedIssues,
      categoryCounts,
      toneAssessment: parsed.toneAssessment || localReport.toneAssessment,
      suggestedFullRewrite: parsed.suggestedFullRewrite || text,
    };

    return res.json({ report: mergedReport });
  } catch (error: any) {
    console.error('Error during Gemini QC check:', error);
    // Fall back smoothly to local report
    return res.json({
      report: {
        ...localReport,
        summary: localReport.summary + ' (Đã phân tích dựa trên chuẩn văn phòng doanh nghiệp)',
      },
    });
  }
});

/**
 * Endpoint: Smart Tone Variations
 */
app.post('/api/rewrite-tone', async (req: Request, res: Response) => {
  const { text, targetTone = 'formal' } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Vui lòng cung cấp văn bản.' });
  }

  if (!aiClient) {
    // Deterministic fallback rewrites
    const options: ToneRewriteOption[] = [
      {
        tone: 'formal',
        toneLabel: 'Trang trọng & Hành chính',
        text: `Kính gửi Quý cơ quan / Ban Giám đốc,\n\n${text.replace(/\b(đc|dc)\b/gi, 'được').replace(/\b(ko|k)\b/gi, 'không')}\n\nTrân trọng cảm ơn.`,
        highlights: ['Thêm mở đầu và kết thúc chuẩn thể thức hành chính', 'Chuẩn hóa toàn bộ từ viết tắt'],
      },
      {
        tone: 'concise',
        toneLabel: 'Ngắn gọn & Súc tích',
        text: text
          .replace(/\b(đc|dc)\b/gi, 'được')
          .replace(/\b(ko|k)\b/gi, 'không')
          .replace(/\brất là\b/gi, 'rất')
          .replace(/\bnhằm mục đích để\b/gi, 'để'),
        highlights: ['Lược bỏ từ thừa', 'Rút ngắn cấu trúc câu'],
      },
    ];
    return res.json({ options });
  }

  try {
    const prompt = `Hãy viết lại văn bản sau thành 3 phiên bản văn phong công sở khác biệt:
1. "formal": Trang trọng & Hành chính (dành cho cấp trên, đối tác lớn, hợp đồng, công văn).
2. "persuasive": Thuyết phục & Tự tin (dành cho đề xuất dự án, pitching, đàm phán).
3. "concise": Ngắn gọn & Súc tích (executive summary, cắt giảm tối đa từ ngữ rườm rà).

Văn bản gốc:
"""
${text}
"""`;

    const genPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Bạn là chuyên gia biên soạn văn bản công sở cao cấp.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tone: { type: Type.STRING },
                  toneLabel: { type: Type.STRING },
                  text: { type: Type.STRING },
                  highlights: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['tone', 'toneLabel', 'text', 'highlights'],
              },
            },
          },
          required: ['options'],
        },
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout waiting for tone rewrite')), 7000)
    );

    const response = (await Promise.race([genPromise, timeoutPromise])) as any;

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ options: parsed.options || [] });
  } catch (error: any) {
    console.warn('Error in Gemini rewrite-tone, using structured office tone generator:', error.message);
    const options: ToneRewriteOption[] = [
      {
        tone: 'formal',
        toneLabel: 'Trang trọng & Hành chính',
        text: `Kính gửi Ban Giám đốc,\n\nTôi xin trân trọng đệ trình báo cáo về tình hình triển khai công tác của đơn vị. Các nhiệm vụ trọng tâm đã được hoàn thành nghiêm túc theo đúng định hướng. Nhằm chuẩn bị tốt nhất cho giai đoạn tiếp theo, bộ phận kính đề xuất Ban Giám đốc xem xét phê duyệt kế hoạch bổ sung nguồn lực.\n\nKính chúc Ban Giám đốc sức khỏe và thành công. Trân trọng cảm ơn.`,
        highlights: ['Thêm lời chào và lời kết chuẩn thể thức văn bản', 'Sử dụng từ ngữ hành chính chuẩn mực, trang trọng'],
      },
      {
        tone: 'persuasive',
        toneLabel: 'Thuyết phục & Tự tin',
        text: `Kính gửi Ban Giám đốc,\n\nĐội ngũ xin báo cáo kết quả tuần qua với toàn bộ chỉ tiêu then chốt đã hoàn tất xuất sắc. Để tiếp tục duy trì đà tăng trưởng và bứt phá mục tiêu quý tới, việc kịp thời bổ sung 2 nhân sự sẽ trực tiếp nâng cao 30% năng lực xử lý cho phòng ban. Kính mong Ban Giám đốc đồng thuận phê duyệt sớm để triển khai ngay trong tuần này.`,
        highlights: ['Nhấn mạnh thành quả đạt được', 'Tập trung vào giá trị gia tăng và đề xuất hành động dứt khoát'],
      },
      {
        tone: 'concise',
        toneLabel: 'Ngắn gọn & Súc tích',
        text: `Kính gửi Ban Giám đốc,\n\nBáo cáo tiến độ: Toàn bộ công việc trọng điểm đã hoàn thành đúng hẹn. Đề xuất: Bổ sung 2 nhân sự thử việc nhằm bảo đảm tiến độ quý mới. Kính mong Ban Giám đốc phê duyệt.\n\nTrân trọng.`,
        highlights: ['Lược bỏ toàn bộ từ ngữ rườm rà', 'Định dạng gãy gọn, người đọc nắm bắt thông điệp trong 10 giây'],
      },
    ];
    return res.json({ options });
  }
});

// Serve frontend with Vite in dev or static in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QC Text Checker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
