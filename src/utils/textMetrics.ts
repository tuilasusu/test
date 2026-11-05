export interface TextMetrics {
  wordCount: number;
  charCount: number;
  charCountNoSpaces: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTimeMinutes: number;
  avgWordsPerSentence: number;
  readabilityScore: number;
  readabilityLevel: 'Rất dễ đọc' | 'Chuẩn công sở' | 'Khá phức tạp' | 'Cần tinh gọn';
}

/**
 * Calculates metrics and readability statistics for Vietnamese / English office text.
 */
export function calculateTextMetrics(text: string): TextMetrics {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      wordCount: 0,
      charCount: 0,
      charCountNoSpaces: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      readingTimeMinutes: 0,
      avgWordsPerSentence: 0,
      readabilityScore: 100,
      readabilityLevel: 'Chuẩn công sở',
    };
  }

  // Word count (split on whitespace)
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Characters
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;

  // Paragraph count
  const paragraphs = text
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const paragraphCount = Math.max(1, paragraphs.length);

  // Sentence count (splitting on ., !, ?, or multiple linebreaks)
  const sentenceMatches = text.match(/[^.!?\n]+[.!?]?/g) || [];
  const sentences = sentenceMatches.map((s) => s.trim()).filter((s) => s.length > 2);
  const sentenceCount = Math.max(1, sentences.length);

  // Average words per sentence
  const avgWordsPerSentence = Math.round((wordCount / sentenceCount) * 10) / 10;

  // Reading time in minutes (approx 200 wpm)
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Office Readability Score calculation:
  // Ideal sentence length in Vietnamese office correspondence: 12-22 words.
  // Over 28 words per sentence starts getting penalized for being convoluted.
  let readabilityScore = 100;

  if (avgWordsPerSentence > 20) {
    const penalty = Math.min(35, (avgWordsPerSentence - 20) * 2.5);
    readabilityScore -= penalty;
  } else if (avgWordsPerSentence < 8 && wordCount > 30) {
    // Too fragmented
    readabilityScore -= 10;
  }

  // Check long sentences (>35 words)
  const overlyLongSentences = sentences.filter((s) => s.split(/\s+/).length > 35).length;
  readabilityScore -= overlyLongSentences * 5;

  readabilityScore = Math.max(20, Math.min(100, Math.round(readabilityScore)));

  let readabilityLevel: 'Rất dễ đọc' | 'Chuẩn công sở' | 'Khá phức tạp' | 'Cần tinh gọn';
  if (readabilityScore >= 85) {
    readabilityLevel = 'Chuẩn công sở';
  } else if (readabilityScore >= 70) {
    readabilityLevel = 'Rất dễ đọc';
  } else if (readabilityScore >= 55) {
    readabilityLevel = 'Khá phức tạp';
  } else {
    readabilityLevel = 'Cần tinh gọn';
  }

  return {
    wordCount,
    charCount,
    charCountNoSpaces,
    sentenceCount,
    paragraphCount,
    readingTimeMinutes,
    avgWordsPerSentence,
    readabilityScore,
    readabilityLevel,
  };
}
