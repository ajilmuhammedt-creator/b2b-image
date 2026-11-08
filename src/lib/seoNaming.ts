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

/**
 * Derives a clean Amazon identifier from product model number or sanitized product title.
 * Used for official Amazon filename convention (e.g. `SF6671HFN` or `SANFORD-FAN`).
 */
export function getAmazonIdentifier(modelNumber?: string, productName?: string): string {
  if (modelNumber && modelNumber.trim()) {
    // Keep alphanumeric and uppercase, remove spaces/symbols
    const cleanModel = modelNumber.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (cleanModel) return cleanModel;
  }
  if (productName && productName.trim()) {
    const slug = slugify(productName).toUpperCase().replace(/-/g, '_');
    return slug.slice(0, 24) || 'SANFORD_ITEM';
  }
  return 'SANFORD_PRODUCT';
}

/**
 * Builds an official Amazon listing image filename adhering to Seller Central specifications:
 * - Main hero: `IDENTIFIER.MAIN.jpg`
 * - Secondary images: `IDENTIFIER.PT01.jpg`, `IDENTIFIER.PT02.jpg`, `IDENTIFIER.PT03.jpg`, etc.
 * Consecutive numbering is preserved if conditional slots (like slot 5) are skipped.
 */
export function getAmazonImageFilename(options: {
  modelNumber?: string;
  productName?: string;
  slotNumber: number;
  secondaryIndex?: number;
  format?: 'jpeg' | 'png';
}): string {
  const identifier = getAmazonIdentifier(options.modelNumber, options.productName);
  const ext = options.format === 'png' ? 'png' : 'jpg';

  if (options.slotNumber === 1) {
    return `${identifier}.MAIN.${ext}`;
  }

  // Secondary images (PT01 to PT08)
  const ptNum = options.secondaryIndex !== undefined
    ? Math.max(1, options.secondaryIndex)
    : Math.max(1, options.slotNumber - 1);
  const paddedPt = String(ptNum).padStart(2, '0');

  return `${identifier}.PT${paddedPt}.${ext}`;
}

/**
 * Builds an official Amazon A+ Content module filename.
 */
export function getAmazonAPlusFilename(options: {
  modelNumber?: string;
  productName?: string;
  aplusType?: string;
  index?: number;
  format?: 'jpeg' | 'png';
}): string {
  const identifier = getAmazonIdentifier(options.modelNumber, options.productName);
  const ext = options.format === 'png' ? 'png' : 'jpg';
  const typeMap: Record<string, string> = {
    standard_banner_970x300: 'APLUS-BANNER-970x300',
    premium_banner_1464x600: 'APLUS-PREMIUM-1464x600',
    triple_card_300x300: `APLUS-CARD-300x300-${options.index ?? 1}`,
    technical_deepdive_970x600: 'APLUS-TECHNICAL-970x600',
  };
  const descriptor = (options.aplusType && typeMap[options.aplusType]) || `APLUS-MODULE-${options.index ?? 1}`;
  return `${identifier}.${descriptor}.${ext}`;
}

/**
 * Builds standard folder name for Amazon listing exports.
 */
export function getAmazonFolderName(options: SeoNamingOptions): string {
  const identifier = getAmazonIdentifier(options.modelNumber, options.productName);
  return `Amazon-${identifier}-Listing-Images`;
}

/**
 * Builds the ZIP archive filename for Amazon listing exports.
 */
export function getAmazonZipFilename(options: SeoNamingOptions): string {
  return `${getAmazonFolderName(options)}.zip`;
}

