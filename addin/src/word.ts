/**
 * Word interop: read the document as indexed paragraphs and apply
 * paragraph-anchored redlines.
 *
 * Requirement sets:
 * - Reading paragraphs, Range.search, insertText('Replace')  → WordApi 1.1
 * - Paragraph.getRange                                        → WordApi 1.3 (manifest minimum)
 * - insertComment + document.changeTrackingMode (tracked)     → WordApi 1.4 (runtime-gated)
 *
 * Hosts below 1.4 (Office 2016–2021 LTSC) get plain replacement with an
 * amber highlight instead of a tracked change + comment.
 */

export type DocParagraph = { index: number; text: string };

export type RedlineInput = {
  paragraphIndex: number;
  originalText: string;
  suggestedText: string;
  rationale: string;
};

export type ApplyOutcome = "applied-tracked" | "applied-highlight" | "not-found";

/** Word's search API rejects strings longer than 255 characters. */
const SEARCH_LIMIT = 250;

export function isWordHost(): boolean {
  return (
    typeof Office !== "undefined" &&
    !!Office.context &&
    typeof Word !== "undefined"
  );
}

export function supportsTrackedChanges(): boolean {
  try {
    return Office.context.requirements.isSetSupported("WordApi", "1.4");
  } catch {
    return false;
  }
}

export async function readDocumentParagraphs(): Promise<DocParagraph[]> {
  return Word.run(async context => {
    const paragraphs = context.document.body.paragraphs;
    paragraphs.load("text");
    await context.sync();
    return paragraphs.items.map((paragraph, index) => ({
      index,
      text: (paragraph.text ?? "").trim(),
    }));
  });
}

export async function applyRedline(redline: RedlineInput): Promise<ApplyOutcome> {
  const useTrackedChanges = supportsTrackedChanges();
  const original = redline.originalText.trim();

  return Word.run(async context => {
    const body = context.document.body;
    const paragraphs = body.paragraphs;
    paragraphs.load("text");
    await context.sync();

    let targetRange: Word.Range | null = null;
    const paragraph = paragraphs.items[redline.paragraphIndex];
    // Word's caret codes (^p, ^t, …) are active even without wildcards, so a
    // caret in the needle would corrupt the search.
    const searchable = original.length > 0 && original.length <= SEARCH_LIMIT && !original.includes("^");

    // 1) Whole-paragraph replacement when the anchor paragraph *is* the text.
    if (paragraph && paragraph.text.trim() === original) {
      targetRange = paragraph.getRange("Content");
    }

    // 2) Search inside the anchor paragraph.
    if (!targetRange && paragraph && searchable && paragraph.text.includes(original)) {
      const results = paragraph.getRange("Content").search(original, { matchCase: true });
      results.load("items");
      await context.sync();
      if (results.items.length > 0) targetRange = results.items[0];
    }

    // 3) Fall back to a whole-document search (paragraph indexes drift when
    //    the document is edited between analyze and apply).
    if (!targetRange && searchable) {
      const results = body.search(original, { matchCase: true });
      results.load("items");
      await context.sync();
      if (results.items.length > 0) targetRange = results.items[0];
    }

    if (!targetRange) return "not-found";

    if (useTrackedChanges) {
      const doc = context.document;
      doc.load("changeTrackingMode");
      await context.sync();
      const previousMode = doc.changeTrackingMode;

      doc.changeTrackingMode = Word.ChangeTrackingMode.trackAll;
      await context.sync();

      const inserted = targetRange.insertText(redline.suggestedText, Word.InsertLocation.replace);
      if (redline.rationale) {
        inserted.insertComment(`Legal OS: ${redline.rationale}`);
      }
      await context.sync();

      doc.changeTrackingMode = previousMode;
      await context.sync();
      return "applied-tracked";
    }

    const inserted = targetRange.insertText(redline.suggestedText, Word.InsertLocation.replace);
    inserted.font.highlightColor = "#FFD966";
    await context.sync();
    return "applied-highlight";
  });
}

export function documentDisplayName(): string | undefined {
  try {
    const url = (Office.context.document as { url?: string })?.url;
    if (!url) return undefined;
    const segments = url.split(/[\\/]/);
    return segments[segments.length - 1] || undefined;
  } catch {
    return undefined;
  }
}
