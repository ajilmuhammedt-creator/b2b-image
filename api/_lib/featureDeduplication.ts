/**
 * Feature Deduplication & Similarity Utilities (Server-side)
 * Enforces mutual exclusivity across Slot 3 & Slot 4 (Feature Highlight 1 & 2),
 * counting banners AND callouts together.
 *
 * Case-insensitive, and treats variations like:
 * "Adjustable timer" vs "Adjustable timer from 0 to 30 minutes" as duplicate features.
 */

export function normalizeFeature(feat: string): string {
  return feat
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks whether two feature strings describe the same product feature.
 * Matches:
 * 1. Exact or case-insensitive match
 * 2. Substring containment (e.g. "adjustable timer" inside "adjustable timer from 0 to 30 minutes")
 * 3. Significant token overlap (e.g. "timer adjustable" vs "adjustable timer from 0 to 30 minutes")
 */
export function isDuplicateFeature(featA?: string, featB?: string): boolean {
  if (!featA || !featB) return false;
  const a = normalizeFeature(featA);
  const b = normalizeFeature(featB);
  if (!a || !b) return false;
  if (a === b) return true;

  // Substring containment check: require min length of 3 to avoid single small words falsely matching
  const minLen = Math.min(a.length, b.length);
  if (minLen >= 3) {
    if (a.includes(b) || b.includes(a)) {
      return true;
    }
  }

  // Token-level overlap check (ignoring common connector stopwords)
  const stopwords = new Set([
    'and', 'with', 'for', 'the', 'from', 'to', 'of', 'in', 'on', 'a', 'an', 'is', 'by', 'as'
  ]);
  const tokensA = a.split(' ').filter((t) => t.length >= 2 && !stopwords.has(t));
  const tokensB = b.split(' ').filter((t) => t.length >= 2 && !stopwords.has(t));

  if (tokensA.length > 0 && tokensB.length > 0) {
    const setB = new Set(tokensB);
    const common = tokensA.filter((t) => setB.has(t));

    // If all significant tokens of the shorter feature are contained in the longer feature
    if (common.length > 0 && (common.length === tokensA.length || common.length === tokensB.length)) {
      return true;
    }
    // If 2 or more significant keywords match (e.g. "rapid air technology" vs "rapid air frying")
    if (common.length >= 2) {
      return true;
    }
  }

  return false;
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  featureA: string;
  featureB: string;
  locationA: string;
  locationB: string;
  message: string;
}

/**
 * Inspects all feature text fields across Slot 3 and Slot 4 (banners AND callouts together)
 * to verify that no feature is repeated or duplicated.
 */
export function findFeatureHighlightDuplicate(
  slot3?: { bannerFeature?: string; callout1?: string; callout2?: string },
  slot4?: { bannerFeature?: string; callout1?: string; callout2?: string },
): DuplicateCheckResult | null {
  if (!slot3 && !slot4) return null;

  const items: Array<{ text: string; location: string }> = [];

  if (slot3?.bannerFeature?.trim()) {
    items.push({ text: slot3.bannerFeature.trim(), location: 'Slot 3 Banner' });
  }
  if (slot3?.callout1?.trim()) {
    items.push({ text: slot3.callout1.trim(), location: 'Slot 3 Callout 1' });
  }
  if (slot3?.callout2?.trim()) {
    items.push({ text: slot3.callout2.trim(), location: 'Slot 3 Callout 2' });
  }
  if (slot4?.bannerFeature?.trim()) {
    items.push({ text: slot4.bannerFeature.trim(), location: 'Slot 4 Banner' });
  }
  if (slot4?.callout1?.trim()) {
    items.push({ text: slot4.callout1.trim(), location: 'Slot 4 Callout 1' });
  }
  if (slot4?.callout2?.trim()) {
    items.push({ text: slot4.callout2.trim(), location: 'Slot 4 Callout 2' });
  }

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const itemA = items[i];
      const itemB = items[j];
      if (isDuplicateFeature(itemA.text, itemB.text)) {
        const isExact = itemA.text.trim().toLowerCase() === itemB.text.trim().toLowerCase();
        return {
          hasDuplicate: true,
          featureA: itemA.text,
          featureB: itemB.text,
          locationA: itemA.location,
          locationB: itemB.location,
          message: isExact
            ? `Feature "${itemA.text}" is duplicated in ${itemA.location} and ${itemB.location}. A feature may appear only once across Slot 3 and Slot 4.`
            : `"${itemA.text}" (${itemA.location}) and "${itemB.text}" (${itemB.location}) describe the same feature. A feature may appear only once across Slot 3 and Slot 4 (banners and callouts combined).`,
        };
      }
    }
  }

  return null;
}
