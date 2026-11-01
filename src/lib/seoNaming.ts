import type { GenerationItem } from '../types';

/**
 * Converts any arbitrary text into a clean, URL-safe and SEO-friendly slug.
 * Removes symbols, handles hyphens, and keeps letters and numbers in lowercase.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[\s_/\\]+/g, '-')       // Replace whitespace, underscores, and slashes with hyphens
    .replace(/[^a-z0-9-]/g, '')        // Strip non-alphanumeric chars except hyphens
    .replace(/-+/g, '-')               // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');          // Trim leading and trailing hyphens
}

/**
 * Returns a standardized, keyword-rich SEO descriptor for a given generation item/slot.
 * Tailored for Shopify media galleries and Google Image search ranking.
 */
export function getSlotDescriptor(item: {
  kind?: string;
  slot?: number | null;
  slotTitle?: string;
  sanfordSlot?: { title?: string; theme?: string };
}): string {
  if (item.kind === 'poster') {
    return 'catalogue-marketing-poster';
  }

  const slotNum = item.slot ?? 1;

  // Check if slot has a specific theme/title
  const theme = item.sanfordSlot?.theme;
  if (theme === 'hero') return 'hero-studio-view';
  if (theme === 'lifestyle') return 'lifestyle-in-use';
  if (theme === 'specs_part_1') return 'specifications-part-1';
  if (theme === 'specs_part_2') return 'specifications-part-2';
  if (theme === 'color_focus') return 'single-colour-focus-parts';
  if (theme === 'box_dimensions') return 'whats-in-the-box-dimensions';

  // Standard slot mapping
  switch (slotNum) {
    case 1:
      return 'hero-studio-view';
    case 2:
      return 'lifestyle-in-use';
    case 3:
      return 'specifications-part-1';
    case 4:
      return 'specifications-part-2';
    case 5:
      return 'single-colour-focus-parts';
    case 6:
      return 'whats-in-the-box-dimensions';
    default:
      if (item.sanfordSlot?.title || item.slotTitle) {
        const titleSlug = slugify(item.sanfordSlot?.title || item.slotTitle || '');
        if (titleSlug) return titleSlug.slice(0, 30);
      }
      return `feature-view-${slotNum}`;
  }
}

export interface SeoNamingOptions {
  brand?: string;
  productName?: string;
  modelNumber?: string;
}

export interface SeoImageNamingOptions extends SeoNamingOptions {
  item: GenerationItem | {
    kind?: 'feature' | 'poster';
    slot?: number | null;
    slotTitle?: string;
    sanfordSlot?: { title?: string; theme?: string };
  };
  index?: number;
}

/**
 * Builds an SEO-optimized filename for Shopify image uploads.
 * Always ends strictly in `.webp`.
 *
 * Example: `sanford-rechargeable-flashlight-sf6123fl-slot-01-hero-studio-view.webp`
 */
export function getSeoImageFilename(options: SeoImageNamingOptions): string {
  const brandSlug = slugify(options.brand || 'sanford') || 'sanford';
  const productSlug = slugify(options.productName || 'product') || 'product';
  const modelSlug = slugify(options.modelNumber || '');

  const isPoster = options.item.kind === 'poster';
  const slotNum = isPoster ? (options.index ?? 7) : (options.item.slot ?? 1);
  const paddedSlot = `slot-${String(slotNum).padStart(2, '0')}`;
  const descriptor = getSlotDescriptor(options.item);

  const parts = [brandSlug, productSlug, modelSlug, paddedSlot, descriptor].filter(Boolean);
  return `${parts.join('-')}.webp`;
}

/**
 * Builds an SEO-optimized folder name for saving images to disk or unzipping for Shopify upload.
 *
 * Example: `sanford-rechargeable-flashlight-sf6123fl-shopify-images`
 */
export function getSeoFolderName(options: SeoNamingOptions): string {
  const brandSlug = slugify(options.brand || 'sanford') || 'sanford';
  const productSlug = slugify(options.productName || 'product') || 'product';
  const modelSlug = slugify(options.modelNumber || '');

  const parts = [brandSlug, productSlug, modelSlug, 'shopify-images'].filter(Boolean);
  return parts.join('-');
}

/**
 * Builds the ZIP archive filename matching the SEO folder name.
 *
 * Example: `sanford-rechargeable-flashlight-sf6123fl-shopify-images.zip`
 */
export function getSeoZipFilename(options: SeoNamingOptions): string {
  return `${getSeoFolderName(options)}.zip`;
}

