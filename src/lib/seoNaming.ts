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
    return '07-marketing-poster';
  }

  const slotNum = item.slot ?? 1;

  // Check if slot has a specific theme/title
  const theme = item.sanfordSlot?.theme;
  if (theme === 'hero' || slotNum === 1) return '01-hero-studio-view';
  if (theme === 'lifestyle' || slotNum === 2) return '02-lifestyle-in-use';
  if (theme === 'specs_part_1' || slotNum === 3) return '03-specifications-features';
  if (theme === 'specs_part_2' || slotNum === 4) return '04-technical-specifications';
  if (theme === 'color_focus' || theme === 'colors' || slotNum === 5) return '05-available-colour-models';
  if (theme === 'box_dimensions' || theme === 'size_warranty' || slotNum === 6) return '06-unit-dimension-warranty';

  if (item.sanfordSlot?.title || item.slotTitle) {
    const titleSlug = slugify(item.sanfordSlot?.title || item.slotTitle || '');
    if (titleSlug) return `0${slotNum}-${titleSlug.slice(0, 30)}`;
  }
  return `0${slotNum}-feature-view`;
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
 * Example: `sanford-sf6671hfn-16-rechargeable-table-fan-01-hero-studio-view.webp`
 */
export function getSeoImageFilename(options: SeoImageNamingOptions): string {
  const brandSlug = slugify(options.brand || 'sanford') || 'sanford';
  let productSlug = slugify(options.productName || 'product') || 'product';
  const modelSlug = slugify(options.modelNumber || '');

  // Deduplicate brand if already present at start of productSlug
  if (productSlug.startsWith(`${brandSlug}-`)) {
    productSlug = productSlug.slice(brandSlug.length + 1);
  }

  // Deduplicate model if already present inside productSlug
  if (modelSlug) {
    if (productSlug.startsWith(`${modelSlug}-`)) {
      productSlug = productSlug.slice(modelSlug.length + 1);
    } else if (productSlug.endsWith(`-${modelSlug}`)) {
      productSlug = productSlug.slice(0, -(modelSlug.length + 1));
    }
  }

  const descriptor = getSlotDescriptor(options.item);
  const parts = [brandSlug, modelSlug, productSlug, descriptor].filter(Boolean);
  return `${parts.join('-')}.webp`;
}

/**
 * Builds an SEO-optimized folder name for saving images to disk or unzipping for Shopify upload.
 *
 * Example: `sanford-sf6671hfn-16-rechargeable-table-fan-shopify-seo-images`
 */
export function getSeoFolderName(options: SeoNamingOptions): string {
  const brandSlug = slugify(options.brand || 'sanford') || 'sanford';
  let productSlug = slugify(options.productName || 'product') || 'product';
  const modelSlug = slugify(options.modelNumber || '');

  if (productSlug.startsWith(`${brandSlug}-`)) {
    productSlug = productSlug.slice(brandSlug.length + 1);
  }
  if (modelSlug) {
    if (productSlug.startsWith(`${modelSlug}-`)) {
      productSlug = productSlug.slice(modelSlug.length + 1);
    } else if (productSlug.endsWith(`-${modelSlug}`)) {
      productSlug = productSlug.slice(0, -(modelSlug.length + 1));
    }
  }

  const parts = [brandSlug, modelSlug, productSlug, 'shopify-seo-images'].filter(Boolean);
  return parts.join('-');
}

/**
 * Builds the ZIP archive filename matching the SEO folder name.
 *
 * Example: `sanford-sf6671hfn-16-rechargeable-table-fan-shopify-seo-images.zip`
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

/**
 * Derives a clean SKU or model identifier for Noon UAE marketplace listings.
 * e.g. `SF6671HFN` or `SANFORD_AIR_FRYER`
 */
export function getNoonIdentifier(modelNumber?: string, productName?: string): string {
  if (modelNumber && modelNumber.trim()) {
    const clean = modelNumber.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (clean) return clean;
  }
  if (productName && productName.trim()) {
    const slug = slugify(productName).toUpperCase().replace(/-/g, '_');
    return slug.slice(0, 24) || 'SANFORD_SKU';
  }
  return 'SANFORD_SKU';
}

/**
 * Builds official Noon UAE product listing image filename according to seller guidelines:
 * - 01: `[SKU]_NOON_01_MAIN.jpg`
 * - 02: `[SKU]_NOON_02_BACK.jpg`
 * - 03: `[SKU]_NOON_03_SIDE.jpg`
 * - 04: `[SKU]_NOON_04_ANGLE.jpg`
 * - 05: `[SKU]_NOON_05_DETAIL.jpg`
 * - 06: `[SKU]_NOON_06_LIFESTYLE.jpg`
 */
export function getNoonImageFilename(options: {
  modelNumber?: string;
  productName?: string;
  slotNumber: number;
  theme?: string;
}): string {
  const sku = getNoonIdentifier(options.modelNumber, options.productName);
  const themeMap: Record<number, string> = {
    1: '01_MAIN',
    2: '02_BACK',
    3: '03_SIDE',
    4: '04_ANGLE',
    5: '05_DETAIL',
    6: '06_LIFESTYLE',
  };

  const tag = themeMap[options.slotNumber] || `0${options.slotNumber}_VIEW`;
  return `${sku}_NOON_${tag}.jpg`;
}

/**
 * Builds official Noon UAE A+ Content image filename supporting English and Arabic sets:
 * e.g. `[SKU]_NOON_APLUS_01_EN.jpg` or `[SKU]_NOON_APLUS_01_AR.jpg`
 */
export function getNoonAPlusFilename(options: {
  modelNumber?: string;
  productName?: string;
  slotNumber: number;
  language?: 'en' | 'ar';
}): string {
  const sku = getNoonIdentifier(options.modelNumber, options.productName);
  const paddedSlot = String(options.slotNumber).padStart(2, '0');
  const lang = (options.language || 'en').toUpperCase();
  return `${sku}_NOON_APLUS_${paddedSlot}_${lang}.jpg`;
}

/**
 * Builds standard folder name for Noon UAE exports.
 */
export function getNoonFolderName(options: SeoNamingOptions & { isAPlus?: boolean }): string {
  const sku = getNoonIdentifier(options.modelNumber, options.productName);
  return options.isAPlus ? `Noon-UAE-${sku}-APlus-Content` : `Noon-UAE-${sku}-Listing-Images`;
}

/**
 * Builds ZIP filename for Noon UAE exports.
 */
export function getNoonZipFilename(options: SeoNamingOptions & { isAPlus?: boolean }): string {
  return `${getNoonFolderName(options)}.zip`;
}


