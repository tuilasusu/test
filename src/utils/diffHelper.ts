import { QCIssue } from '../types/qc';

/**
 * Replaces a target substring in the original text with the suggested text.
 * Finds the best match or uses index when provided.
 */
export function applySingleFix(
  text: string,
  issue: Pick<QCIssue, 'originalText' | 'suggestedText' | 'startIndex' | 'endIndex'>
): string {
  if (!text || !issue.originalText) return text;

  // If valid startIndex and endIndex are provided and match the text
  if (
    typeof issue.startIndex === 'number' &&
    typeof issue.endIndex === 'number' &&
    issue.startIndex >= 0 &&
    issue.endIndex <= text.length &&
    text.slice(issue.startIndex, issue.endIndex).toLowerCase() === issue.originalText.toLowerCase()
  ) {
    return (
      text.slice(0, issue.startIndex) +
      issue.suggestedText +
      text.slice(issue.endIndex)
    );
  }

  // Fallback: search for first occurrence of originalText
  const idx = text.indexOf(issue.originalText);
  if (idx !== -1) {
    return text.slice(0, idx) + issue.suggestedText + text.slice(idx + issue.originalText.length);
  }

  // Case-insensitive fallback
  const lowerText = text.toLowerCase();
  const lowerOrig = issue.originalText.toLowerCase();
  const ciIdx = lowerText.indexOf(lowerOrig);
  if (ciIdx !== -1) {
    return text.slice(0, ciIdx) + issue.suggestedText + text.slice(ciIdx + issue.originalText.length);
  }

  return text;
}

/**
 * Replaces all given issues in a text.
 * Sorts by position descending if indices are available to prevent index shifting,
 * or safely substitutes matched substrings.
 */
export function applyAllFixes(text: string, issues: QCIssue[]): string {
  if (!text || !issues.length) return text;

  let result = text;

  // Process unique distinct originalText replacements to prevent double-replacements
  for (const issue of issues) {
    result = applySingleFix(result, issue);
  }

  return result;
}

export interface DiffPart {
  type: 'unchanged' | 'removed' | 'added';
  value: string;
}

/**
 * Simple word-level diff generator between original and modified text.
 */
export function generateWordDiff(original: string, modified: string): DiffPart[] {
  if (original === modified) {
    return [{ type: 'unchanged', value: original }];
  }

  const origTokens = original.split(/(\s+)/);
  const modTokens = modified.split(/(\s+)/);

  const diff: DiffPart[] = [];
  let i = 0;
  let j = 0;

  while (i < origTokens.length || j < modTokens.length) {
    if (i < origTokens.length && j < modTokens.length && origTokens[i] === modTokens[j]) {
      diff.push({ type: 'unchanged', value: origTokens[i] });
      i++;
      j++;
    } else {
      if (i < origTokens.length) {
        diff.push({ type: 'removed', value: origTokens[i] });
        i++;
      }
      if (j < modTokens.length) {
        diff.push({ type: 'added', value: modTokens[j] });
        j++;
      }
    }
  }

  return diff;
}
