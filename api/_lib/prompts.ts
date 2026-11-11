export function parseDimensionMeasurements(dimStr?: string): { height: string; width: string; depth: string } {
  if (!dimStr) return { height: '197mm', width: '78mm', depth: '57mm' };
  const matches = dimStr.match(/(\d+(?:\.\d+)?\s*(?:mm|cm|in|inch|inches)?)/gi);
  if (matches && matches.length >= 3) {
    const rawNums = matches.map((m) => parseFloat(m)).filter((n) => !isNaN(n));
    if (rawNums.length >= 3) {
      const sorted = [...rawNums].sort((a, b) => b - a);
      const h = sorted[0]; // biggest is usually height
      const w = sorted[1]; // middle is width
      const d = sorted[2]; // smallest is depth
      const unit = dimStr.toLowerCase().includes('cm') ? 'cm' : 'mm';
      return {
        height: `${h}${unit}`,
        width: `${w}${unit}`,
        depth: `${d}${unit}`,
      };
    }
  }
  return { height: '197mm', width: '78mm', depth: '57mm' };
}

export const PRODUCT_ACCURACY_BLOCK = `STRICT CATALOG ADHERENCE & HARDWARE ACCURACY (ZERO HALLUCINATIONS):
- Treat the uploaded product photograph and the provided catalog specifications as the STRICT, EXCLUSIVE source of truth.
- Faithfully preserve the product's exact shape, proportions, colors, materials, texture, buttons, switches, ports, branding, labels, and visible components from the reference photo.
- STRICT NEGATIVE HARDWARE RULE — DO NOT INVENT OR ADD UNLISTED FEATURES:
  * NEVER add fake digital displays, numeric LED screens (e.g. "100"), LCD panels, touchscreens, or illuminated readouts unless explicitly mentioned in the supplied specifications AND visibly present on the product photo.
  * NEVER invent unmentioned USB ports (such as extra USB-A or Type-C ports), extra control buttons, hinges, 90-degree folding mechanisms, or cooling plates that are not in the supplied specifications.
  * NEVER invent performance metrics, certifications, or technical capabilities not explicitly supplied.`;

export const PRECISE_POINTER_MAPPING_BLOCK = `PRECISE 1-TO-1 CALLOUT POINTER & INSET MAPPING RULE:
- When rendering any pointer lines, leader arrows, or circular zoom-in insets connecting labels/icons to product parts:
  1. STRICT 1-TO-1 MAPPING: Every pointer line or zoom inset MUST map uniquely and accurately to its exact corresponding physical component (e.g., a "Type-C" callout points strictly to the Type-C port; a "USB-A" callout points strictly to the USB-A port; an "LED Indicator" callout points solely to the pinhole LED indicator dot).
  2. NO AMBIGUOUS OR MULTI-TARGET POINTERS: Strictly forbid branching, forked, overlapping, or ambiguous pointer lines that connect one label to multiple unrelated ports/components.
  3. ONLY POINT TO VERIFIED REAL PARTS: Never draw pointer lines or zoom-in detail circles for hardware features that do not exist on the physical product.`;

export const SHARP_SANS_TYPOGRAPHY_BLOCK = `MANDATORY TYPOGRAPHY & FONT MANDATE (SHARP SANS ONLY):
- ALL text, headlines, marketing slogans, specification callouts, labels, numbers, promotional banners, and dimensional measurements rendered anywhere on the image MUST STRICTLY USE THE "Sharp Sans" FONT FAMILY ONLY.
- Font characteristics: "Sharp Sans" is a geometric, contemporary sans-serif typeface with circular counters, sharp modern apexes/vertices, clean lines, and high legibility.
- Use "Sharp Sans Bold" or "Sharp Sans Semibold" for all headlines, banner titles, badge text, and callout headers.
- Use "Sharp Sans Medium" or "Sharp Sans Regular" for supporting body text, slogans, and dimension units.
- STRICT NEGATIVE CONSTRAINT: Absolutely DO NOT use Arial, Helvetica, Roboto, Times New Roman, Georgia, serif fonts, script, handwriting, rounded bubble fonts, or generic system fonts. Every single letter and digit on the image MUST be rendered strictly in "Sharp Sans" font.`;

export const SHOPIFY_TYPOGRAPHY_COMPLIANCE_BLOCK = `SHOPIFY BRAND TYPOGRAPHY & FONT COMPLIANCE RULE (EXCLUSIVE SHARP SANS — ZERO FALLBACKS):
1. MANDATORY EXCLUSIVE FONT FAMILY ("Sharp Sans" ONLY):
   - Always render ALL text elements across this Shopify store asset exclusively in the "Sharp Sans" typeface family.
   - This applies strictly and without exception to EVERY text layer: headings, subheadings, Key Features graphics, specification overlays, feature lists, callout labels, pointer annotations, circular badges, corner cards, warranty ribbons, dimension numbers/units, swatch labels, and marketing banners.
2. GEOMETRIC CHARACTERISTICS & WEIGHT HIERARCHY:
   - Maintain true "Sharp Sans" geometric letterforms: clean circular counters ("O", "e", "a"), flat horizontal/vertical cut terminals, sharp modern pointed vertices ("A", "V", "W", "M"), open aperture curves, and tight balanced kerning.
   - Headings, banner titles, warranty ribbons, badge headlines, and spec values: "Sharp Sans Bold" or "Sharp Sans Semibold".
   - Subheadings, feature descriptions, callout labels, pointer annotations, slogans, and dimension units: "Sharp Sans Medium" or "Sharp Sans Regular".
3. STRICT NO-SUBSTITUTION & ZERO-FALLBACK ENFORCEMENT:
   - NEVER substitute, fall back to, mix, or approximate using ANY other font family — strictly FORBIDDEN: Arial, Helvetica, Roboto, Inter, Open Sans, Segoe UI, Montserrat fallback glyphs, system default sans-serif, serif fonts (Times New Roman, Georgia), monospace, script, condensed grotesque, or rounded bubble fonts.
   - Every single character, letter, digit, symbol, and unit anywhere on this Shopify image MUST strictly utilize "Sharp Sans" for 100% brand consistency.`;

export const NO_BRAND_OR_MODEL_RULE = `STRICT RULE - NO BRAND NAME & NO MODEL NUMBER TEXT:
- ABSOLUTELY DO NOT WRITE THE BRAND NAME (e.g. "Sanford" or any brand name) AS GRAPHICAL TEXT ON THE IMAGE.
- ABSOLUTELY DO NOT WRITE THE MODEL NUMBER OR ANY MODEL CODE/NUMBER ON THE IMAGE.
- STRICTLY FORBIDDEN: Do not create any brand name header, model number badge, model tag box, or "[SF...]" callout.
- The only branding allowed is whatever factory logo is already physically molded onto the source product in the reference photo.
- All text added to the image (callouts, headlines, banners, labels) must describe functional features and benefits ONLY.`;

export function buildSanfordSlotPrompt(params: {
  productName: string;
  theme: 'hero' | 'lifestyle' | 'specs_part_1' | 'specs_part_2' | 'colors' | 'size_warranty' | 'poster' | string;
  slotTitle: string;
  headline?: string;
  promoBanner?: string;
  brand?: string;
  modelNumber?: string;
  features: string[];
  excludedFeatures?: string[];
  dimensions?: string;
  weight?: string;
  whatsInTheBox?: string[];
  warranty?: string;
  colors?: string;
  accentColor?: string;
  background?: string;
}): string {
  const {
    productName,
    theme,
    slotTitle,
    headline,
    promoBanner,
    brand = 'Sanford',
    modelNumber = '',
    features,
    excludedFeatures = [],
    dimensions,
    weight,
    whatsInTheBox,
    warranty,
    colors,
    accentColor,
    background,
  } = params;

  // Clean brand name and model number regexes
  const brandRegex = new RegExp(`\\b${brand}\\b`, 'gi');
  const modelRegex = modelNumber
    ? new RegExp(`\\b${modelNumber}\\b`, 'gi')
    : /\b[A-Z]{2,4}\d{4,}[A-Z0-9]*\b/gi;

  const cleanText = (t?: string): string => {
    if (!t) return '';
    return t
      .replace(brandRegex, '')
      .replace(modelRegex, '')
      .replace(/\bSanford\b/gi, '')
      .replace(/\b[A-Z]{2,4}\d{4,}[A-Z0-9]*\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const cleanProductTitle = cleanText(productName) || productName;
  const cleanHeadline = cleanText(headline) || headline;
  const cleanPromoBanner = cleanText(promoBanner) || promoBanner;

  // Deduplicate cleaned features strictly
  const seenFeat = new Set<string>();
  const cleanedFeatures: string[] = [];
  for (const f of features) {
    const cleaned = cleanText(f);
    if (cleaned.length > 2) {
      const key = cleaned.toLowerCase();
      if (!seenFeat.has(key)) {
        seenFeat.add(key);
        cleanedFeatures.push(cleaned);
      }
    }
  }

  // Deduplicate excluded features (making sure none overlap with cleanedFeatures)
  const cleanExcluded: string[] = [];
  const seenExcl = new Set<string>();
  for (const ex of excludedFeatures) {
    const cleaned = cleanText(ex);
    if (cleaned.length > 2) {
      const key = cleaned.toLowerCase();
      if (!seenFeat.has(key) && !seenExcl.has(key)) {
        seenExcl.add(key);
        cleanExcluded.push(cleaned);
      }
    }
  }

  const featureListStr = cleanedFeatures.join('; ');

  // Robust check to prevent any technical specification or duplicate feature from appearing as a headline or banner
  const isDuplicateOrTechnicalSpec = (text?: string, featureList: string[] = []): boolean => {
    if (!text) return true;
    const clean = text.toLowerCase().trim();
    if (!clean) return true;

    // Direct or partial match with any bullet feature
    for (const feat of featureList) {
      const f = feat.toLowerCase().trim();
      if (!f) continue;
      if (clean === f || clean.includes(f) || f.includes(clean)) {
        return true;
      }
    }

    // Technical spec keywords that belong ONLY in upper-left badges, never in context slogans
    const specKeywords = [
      'charge', 'charging', 'battery', 'mah', 'rpm', 'watt', 'volt', 'speed', 'gear',
      'blade', 'motor', 'hours', 'hour', 'timer', 'fold', 'folding', 'cable', 'lanyard',
      'usb', 'type-c', 'level', 'dimension', 'weight', 'cold plate', 'screen', 'led'
    ];

    for (const kw of specKeywords) {
      if (new RegExp(`\\b${kw}\\b`, 'i').test(clean)) {
        return true;
      }
    }

    return false;
  };

  const bgDesc = background === 'pale tint' ? 'pale tinted, clean' : 'pure seamless white';
  const accentLine = accentColor && accentColor !== 'Auto' ? `Use ${accentColor} as the subtle accent color.` : '';

  let specificStyle = '';

  switch (theme) {
    case 'hero':
      specificStyle = `SLOT 1: HERO STUDIO VIEW (PURE WHITE BACKGROUND)
- Make the product the undisputed hero, centered at a clean front or three-quarter angle.
- Clean pure seamless white (#FFFFFF) studio background with soft, natural contact floor shadow.
- Studio softbox lighting creating crisp highlights on the product's metallic and matte surfaces.
- STRICT CONSTRAINT: ABSOLUTELY NO text, NO numbers, NO specifications, NO badges, NO watermarks, NO icons. Flawless commercial product photograph on pure white only.`;
      break;

    case 'lifestyle': {
      // 1. Prepare Top-Left Red Badge Tagline (e.g. "Built to Be\nYour Ultimate\nNight\nCompanion.")
      let rawTagline = cleanHeadline;
      if (!rawTagline || isDuplicateOrTechnicalSpec(rawTagline, cleanedFeatures)) {
        const baseName = cleanProductTitle.replace(/\b(sanford|sf\d+[a-z0-9]*)\b/gi, '').trim();
        if (/fan|cooling|air|ventilator/i.test(baseName)) {
          rawTagline = 'Built to Be Your Ultimate Cooling Companion.';
        } else if (/lantern|light|torch|lamp|emergency/i.test(baseName)) {
          rawTagline = 'Built to Be Your Ultimate Night Companion.';
        } else if (/grinder|mixer|blender|juicer|chopper/i.test(baseName)) {
          rawTagline = 'Built to Be Your Ultimate Kitchen Companion.';
        } else if (/kettle|cooker|oven|fryer|toaster|stove/i.test(baseName)) {
          rawTagline = 'Built to Be Your Ultimate Cooking Companion.';
        } else if (/iron|steamer/i.test(baseName)) {
          rawTagline = 'Built to Be Your Ultimate Wardrobe Companion.';
        } else {
          rawTagline = `Built to Be Your Ultimate ${baseName || 'Everyday'} Companion.`;
        }
      }

      // Format tagline into 2 to 4 clean, punchy lines for the top-left red rounded card
      const words = rawTagline.split(' ').filter(Boolean);
      let badgeTextLines: string;
      if (words.length <= 4) {
        badgeTextLines = words.join('\n');
      } else if (words.length <= 7) {
        const mid = Math.ceil(words.length / 2);
        badgeTextLines = `${words.slice(0, mid).join(' ')}\n${words.slice(mid).join(' ')}`;
      } else {
        const p1 = Math.ceil(words.length / 3);
        const p2 = Math.ceil((2 * words.length) / 3);
        badgeTextLines = `${words.slice(0, p1).join(' ')}\n${words.slice(p1, p2).join(' ')}\n${words.slice(p2).join(' ')}`;
      }

      // 2. Prepare Top-Right Floating Product Category Text (e.g. "Rechargeable\nEmergency Lantern")
      const cleanCategory = cleanProductTitle
        .replace(/\b(sanford|sf\d+[a-z0-9]*)\b/gi, '')
        .replace(/["']/g, '')
        .trim();
      const catWords = cleanCategory.split(' ').filter(Boolean);
      let categoryLines: string;
      if (catWords.length <= 3) {
        categoryLines = catWords.join('\n');
      } else {
        const mid = Math.ceil(catWords.length / 2);
        categoryLines = `${catWords.slice(0, mid).join(' ')}\n${catWords.slice(mid).join(' ')}`;
      }

      // 3. Dynamic lifestyle scene setting based on product category
      let sceneEnvironment = '';
      if (/lantern|light|torch|lamp|emergency/i.test(cleanProductTitle)) {
        sceneEnvironment = 'Outdoor evening campsite with lit tent and pine trees, or warm atmospheric room during evening. A person in outdoor jacket or casual wear holding or placing the glowing lantern, with warm luminous light illuminating their face and surroundings.';
      } else if (/fan|cooling|air|ventilator/i.test(cleanProductTitle)) {
        sceneEnvironment = 'Bright, clean, modern indoor living room or study desk with laptop and notebook. A relaxed, smiling person comfortably sitting at the desk or sofa, enjoying refreshing cooling breeze from the running fan placed near them.';
      } else if (/grinder|mixer|blender|juicer|kettle|cooker|oven|fryer/i.test(cleanProductTitle)) {
        sceneEnvironment = 'Sleek, bright modern kitchen countertop with fresh ingredients nearby. A smiling home cook actively using or preparing food/drinks with the appliance in realistic action.';
      } else {
        sceneEnvironment = 'Bright, authentic contemporary living space. A person actively and naturally interacting with the product in its everyday context.';
      }

      const modelLine = modelNumber
        ? `  * Do NOT write "${modelNumber}" or any model code anywhere on the picture.`
        : `  * Do NOT write any model code or model number anywhere on the picture.`;

      specificStyle = `SLOT 2: LIFESTYLE & IN-USE SCENE (EXACT BUYSANFORD STORE REFERENCE TEMPLATE)
- MANDATORY TWO-CORNER BUYSANFORD BRAND TEMPLATE:
  1. TOP-LEFT SOLID RED CORNER BADGE (BRAND LIFESTYLE HEADLINE):
     * Position: Pinned directly to the TOP-LEFT corner of the image canvas (top: 0, left: 0), flush with the top and left edges.
     * Shape: Solid vibrant RED rectangular card (#C8281E / #E52414 / Sanford Crimson Red).
     * Distinct Corner Geometry: The bottom-right corner of this red card is prominently rounded (border-bottom-right-radius: ~36px / rounded-br-3xl). The top edge, left edge, and top-right corner are rectangular and flush with the frame.
     * Typography: Crisp, high-contrast, bold pure WHITE heading text (#FFFFFF) strictly in "Sharp Sans Bold" font (NO Arial, Helvetica, or Roboto substitution):
"${badgeTextLines}"
     * Formatting: Left-aligned with comfortable padding inside the red card, 2 to 4 clean lines, ending with a period.

  2. TOP-RIGHT PRODUCT CATEGORY / TITLE (CLEAN WHITE FLOATING SUBHEADING):
     * Position: Upper-right area of the canvas.
     * Style: Clean, elegant, pure WHITE text (#FFFFFF) rendered directly over the scene (NO background box, NO container).
     * Font: Crisp "Sharp Sans Bold" or "Sharp Sans Semibold" ONLY (zero fallback to generic sans-serif, Arial, Helvetica, or Roboto).
     * Typography: Product category / title in 1 or 2 lines:
"${categoryLines}"
     * STRICT RULE: Absolutely NO brand name ("Sanford") and NO model code here. Only the generic product category/title.

- SCENE & COMPOSITION (PHOTOREALISTIC COMMERCIAL LIFESTYLE IN-USE):
  * Setting: ${sceneEnvironment}
  * Model: A real, natural human model actively using, holding, or enjoying the product in realistic everyday context.
  * Active Product State: The product must be turned on and operational (lantern glowing with luminous light, fan blowing air, blender active).
  * Product Fidelity: The product must accurately match the uploaded source reference photograph in shape, proportions, materials, colors, and components.
  * Photographic Quality: Commercial lifestyle advertising standard, cinematic depth of field, authentic environment, sharp focus on the product and person.

- STRICT NEGATIVE CONSTRAINTS (CRITICAL):
  * ABSOLUTELY NO technical specification callouts, NO bullet points, NO circular badges, NO battery/power numbers, NO dimension arrows.
  * ABSOLUTELY NO BRAND NAME ("Sanford") written on the canvas.
  * ABSOLUTELY NO MODEL NUMBER (${modelNumber || 'SF...'}) written on the canvas.
${modelLine}
  * The ONLY text permitted on the entire image is:
    (a) The white "Sharp Sans Bold" text INSIDE the top-left solid red corner card.
    (b) The clean white "Sharp Sans" product category text in the top-right corner.
  * STRICT TYPOGRAPHY RULE: Do NOT substitute or fall back to Arial, Helvetica, Roboto, or any non-Sharp-Sans font.
  * NO other floating text anywhere else on the image.`;
      break;
    }

    case 'specs_part_1':
    case 'specs_part_2': {
      const slotNumLabel = theme === 'specs_part_1' ? 'SLOT 3: PRODUCT SPECIFICATIONS — PART 1' : 'SLOT 4: PRODUCT SPECIFICATIONS — PART 2';
      const hasHeadline = cleanHeadline && !isDuplicateOrTechnicalSpec(cleanHeadline, cleanedFeatures);
      const headlineSection = hasHeadline
        ? `- UPPER-RIGHT USAGE CONTEXT SUBHEADING / SLOGAN (EXCLUSIVE SHARP SANS FONT):
  * In the upper-right corner, place ONLY the uppercase context slogan in clean, dark "Sharp Sans Semibold" / "Sharp Sans Medium" font ONLY (never Arial, Helvetica, or Roboto):
    "${cleanHeadline.toUpperCase()}"
  * This is an overarching usage slogan ONLY.
  * ABSOLUTELY DO NOT put any technical feature, battery spec, or charging text here.`
        : '';

      const hasPromoBanner = cleanPromoBanner && !isDuplicateOrTechnicalSpec(cleanPromoBanner, cleanedFeatures);
      const bannerSection = hasPromoBanner
        ? `- MANDATORY FULL-WIDTH SOLID RED BOTTOM MARKETING BANNER:
  * Across the very bottom of the image, include a full-width solid RED strip (#E53935 / #D32F2F) spanning 100% edge-to-edge.
  * Inside this red banner: large, bold, clean WHITE heading typography strictly in "Sharp Sans Bold" font ONLY displaying the main benefit: "${cleanPromoBanner}". Zero substitution with Arial, Helvetica, or Roboto.
  * On the left of the banner: an optional white circular badge with a minimalist symbol.`
        : '';

      const exclusiveListText = cleanedFeatures.length > 0
        ? cleanedFeatures.map((f, idx) => `    ${idx + 1}. ${f}`).join('\n')
        : '    (Render clean hardware close-up view only — no extra badge text invented)';

      const excludedSection = cleanExcluded.length > 0
        ? `\n- FORBIDDEN DUPLICATES (ALREADY ASSIGNED TO ANOTHER SLOT — DO NOT RENDER OR MENTION):\n  * The following specifications belong EXCLUSIVELY to the other specification slot and MUST NOT appear anywhere on THIS image (neither in icon rows, callouts, zoom circles, nor banners):\n    [ ${cleanExcluded.join(' | ')} ]`
        : '';

      const modelLine = modelNumber
        ? `  * Do NOT write "${modelNumber}" or any model code/number anywhere on the picture.`
        : `  * Do NOT write any model code or number anywhere on the picture.`;

      specificStyle = `${slotNumLabel} (STRICT CATALOG COMPLIANCE & ZERO DUPLICATION)
- UPPER-LEFT EXCLUSIVE KEY FEATURES STACK (EXACT BRAND ICON & EXCLUSIVE SHARP SANS FONT STYLE):
  * Render a clean vertical specification overlay stack on the left side containing EXCLUSIVELY these ${cleanedFeatures.length} assigned specification(s):
${exclusiveListText}
  * EXACT COUNT RULE: Render ONLY ${cleanedFeatures.length} red circular icon badge row(s) matching the numbered items above. DO NOT add any extra unrequested badge rows, unlisted specs, or duplicate points.
  * Each assigned feature row follows this visual pattern:
    1. A solid, vibrant RED circular icon badge (#E53935 / #C8281E) containing a clean WHITE minimalist icon matching ONLY that specific item (any embedded icon numbers/text must strictly use "Sharp Sans Bold").
    2. Feature list text beside the red badge preserving the exact wording and measurements from the list above: bold spec title/numbers in "Sharp Sans Bold" and supporting unit/detail text in "Sharp Sans Medium" — STRICTLY "Sharp Sans" ONLY.
    3. A delicate horizontal hairline divider separating each row.
${headlineSection ? '\n' + headlineSection + '\n' : ''}${excludedSection ? excludedSection + '\n' : ''}
- CENTER COMPOSITION & HARDWARE INTEGRITY:
  * Product is centered and sharply rendered matching the uploaded source reference photograph 100% faithfully.
  * STRICT ZERO HALLUCINATION: Do NOT add a fake digital LED display/screen (like "100"), do NOT add extra USB-A/Type-C ports, do NOT show folding angles unless listed above, and do NOT place small color-variant thumbnails in the scene (color models belong exclusively to Slot 5).
  * If showing zoomed-in detail circles/pointer lines for any listed port or hardware detail (such as Type-C port or LED pinhole indicator), render ONLY components that genuinely exist in the uploaded photograph, map pointer lines 1-to-1 strictly to that single part, and render EVERY callout label and annotation text exclusively in "Sharp Sans Semibold" / "Sharp Sans Medium" (never Arial, Helvetica, or Roboto).
${bannerSection ? '\n' + bannerSection + '\n' : ''}
- STRICT ANTI-DUPLICATION & MUTUAL EXCLUSIVITY RULE (CRITICAL):
  * EVERY SPECIFICATION MUST APPEAR ONCE AND ONLY ONCE ACROSS THE ENTIRE SERIES.
  * Specifications in this list (${cleanedFeatures.join(', ')}) belong EXCLUSIVELY in the upper-left red circular badge stack.
  * NEVER repeat any feature twice on the same image or duplicate features from the forbidden list above.

- STRICT NEGATIVE CONSTRAINT (CRITICAL - DO NOT VIOLATE):
  * ABSOLUTELY NO BRAND NAME AND NO MODEL NUMBER TEXT ON THE IMAGE.
  * Do NOT write "Sanford" or any brand name anywhere on the picture.
${modelLine}
  * Do NOT draw any model tag, logo box, brand header, or "[SF...]" badge.
- STRICT SHOPIFY FONT ENFORCEMENT: ALL headings, subheadings, feature list items, callout labels, specification overlays, badge text, annotations, and bottom marketing banners MUST render exclusively in "Sharp Sans" with ZERO fallback to Arial, Helvetica, Roboto, or generic sans-serif fonts.`;
      break;
    }

    case 'colors': {
      const bannerSection = cleanPromoBanner
        ? `- MANDATORY FULL-WIDTH SOLID RED BOTTOM MARKETING BANNER:
  * Across the very bottom of the image, include a full-width solid RED strip (#E53935 / #D32F2F) spanning 100% edge-to-edge.
  * Inside this red banner: large, bold, clean WHITE heading typography strictly in "Sharp Sans Bold" font ONLY delivering the brand message: "${cleanPromoBanner}". Zero substitution to Arial, Helvetica, or Roboto.`
        : '';

      const colorList = colors ? colors : 'all available color variants';

      specificStyle = `SLOT 5: AVAILABLE COLOUR MODELS (EXACT BUYSANFORD BRAND STYLE)
- SHOW AVAILABLE COLOR VARIANTS:
  * Display the product in its available color finishes / models: ${colorList}.
  * Products arranged cleanly side-by-side or fanned out showing each available color option.
  * Clean, bright studio background with soft natural floor contact shadow.
${bannerSection ? bannerSection + '\n' : ''}- STRICT SHOPIFY FONT REQUIREMENT: Any color labels, swatch annotations, badges, headings, or marketing banner typography MUST render exclusively in "Sharp Sans" ("Sharp Sans Bold" / "Sharp Sans Medium"). Do NOT substitute Arial, Helvetica, Roboto, or generic sans-serif fonts.
- STRICT CONSTRAINT: STRICTLY NO technical product specifications, NO wattage, NO battery numbers, NO feature descriptions.
- STRICT CONSTRAINT: ABSOLUTELY NO brand name and NO model number written on the image.`;
      break;
    }

    case 'size_warranty':
    case 'infographic': {
      const { height, width, depth } = parseDimensionMeasurements(dimensions);
      specificStyle = `SLOT 6: UNIT DIMENSION & WARRANTY ONLY (EXACT BUYSANFORD STYLE)
- BACKGROUND & COMPOSITION:
  * Soft, pale warm pastel background with a delicate peach/pink tint (#FDEFEF to #FADBD8, matching BuySanford specification artwork).
  * Flat studio surface horizon line where the product stands upright in the center with a realistic soft floor contact shadow.
  * Flawless centered product facing forward.

- TOP-LEFT HEADING (EXCLUSIVE SHARP SANS FONT):
  * In the top-left corner, display clean, modest-sized header text strictly in "Sharp Sans Bold" font ONLY (dark charcoal/black): "Unit Dimension".
  * Clean, elegant geometric typography with generous margins from the edges (never Arial, Helvetica, or Roboto).

- TOP-RIGHT WARRANTY BADGE (EXACT SANFORD DUAL-RIBBON BANNER WITH EXCLUSIVE SHARP SANS FONT):
  * In the top-right corner, place the official Sanford folded ribbon banner badge:
    - Top folded angled ribbon: Bright VIBRANT RED banner with bold white text "1 YEAR" strictly in "Sharp Sans Bold" font.
    - Lower folded angled ribbon: Rich NAVY BLUE banner with bold white text "SERVICE WARRANTY" strictly in "Sharp Sans Bold" font.
    - Clean folded ribbon 3D geometry with notched/folded banner ends.
    - STRICT: DO NOT use a golden shield. MUST use the RED and NAVY BLUE folded ribbon banner.

- DIMENSION ARROWS & CALLOUT LABELS (EXACT CRIMSON RED ARROWS & EXCLUSIVE SHARP SANS FONT):
  * Dimension arrows MUST be crisp, thin double-ended arrows in bright CRIMSON RED (<───────>) with solid red triangular arrowheads on both ends.
  * Height callout annotation: A vertical double-ended crimson red arrow along the right side of the product with dark legible text strictly in "Sharp Sans Bold" / "Sharp Sans Medium" font: "${height}".
  * Width callout annotation: A horizontal double-ended crimson red arrow beneath the product base with dark legible text strictly in "Sharp Sans Bold" / "Sharp Sans Medium" font: "${width}".
  * Depth callout annotation: An angled perspective double-ended crimson red arrow showing product depth/thickness with dark legible text strictly in "Sharp Sans Bold" / "Sharp Sans Medium" font: "${depth}".
  * Every measurement number and unit MUST render exclusively in clean, dark "Sharp Sans" — never Arial, Helvetica, Roboto, or monospace fallback.

- STRICT NEGATIVE RULES (CRITICAL):
  * STRICTLY NO PRODUCT WEIGHT. Absolutely NO "Unit Weight", NO "Package Weight", NO "225g", NO "305g", NO weight icons, NO scales.
  * STRICTLY NO "WHAT'S IN THE BOX". Absolutely NO box contents, NO USB cables, NO user manual drawings, NO accessories, NO inset boxes.
  * STRICTLY NO BRAND NAME AND NO MODEL NUMBER TEXT ON THE IMAGE.
  * The image must contain ONLY: the centered product, "Unit Dimension" in top left (in Sharp Sans font), the red/blue ribbon "1 YEAR SERVICE WARRANTY" badge in top right (in Sharp Sans font), and the crimson red dimension arrows (<--->) with measurements (in Sharp Sans font).`;
      break;
    }

    default:
      specificStyle = `SLOT FEATURE ARTWORK
- Feature artwork for: ${featureListStr}.
- Clean ${bgDesc} background with high-contrast headings, subheadings, annotations, feature lists, and callout labels exclusively in "Sharp Sans" font (NO Arial, Helvetica, or Roboto fallback). ${accentLine}
- STRICTLY NO brand name and NO model number written on the image.`;
      break;
  }

  const isHero = theme === 'hero';
  const shopifyFontSection = isHero
    ? ''
    : `\n${SHOPIFY_TYPOGRAPHY_COMPLIANCE_BLOCK}\n`;
  const shopifyFontFooter = isHero
    ? ''
    : `\nCRITICAL SHOPIFY FONT MANDATE (EXCLUSIVE SHARP SANS — ZERO FALLBACKS):\nEvery single rendered text element—headings, subheadings, Key Features graphics, callout labels, specification overlays, badges, annotations, feature lists, dimension numbers/units, and marketing banners—MUST strictly use "Sharp Sans" ONLY. Absolutely NO substitution or fallback to Arial, Helvetica, Roboto, or any other font family is permitted.\n`;

  return `Create ONE premium 1:1 square e-commerce product image for BuySanford Shopify online store (patterned after BuySanford product page rules: https://www.buysanford.com).

PRODUCT INFORMATION
Product: ${cleanProductTitle}
Highlight Theme: ${slotTitle}
Key Specs: ${featureListStr}
Language: English

${PRODUCT_ACCURACY_BLOCK}

${PRECISE_POINTER_MAPPING_BLOCK}

${NO_BRAND_OR_MODEL_RULE}
${shopifyFontSection}
${specificStyle}
${shopifyFontFooter}
OUTPUT
Generate exactly ONE complete 1:1 square image.
No outer borders, no watermark, no production notes.`;
}

export function buildFeaturePrompt(params: {
  productName: string;
  fullFeatures: string[];
  selectedFeatureGroup: string[];
  slot: number;
  platform?: string;
  accentColor?: string;
  background?: string;
}): string {
  const { productName, fullFeatures, selectedFeatureGroup, slot, platform = 'shopify', accentColor, background } = params;

  const isShopify = platform === 'shopify';
  const fontBlock = isShopify ? SHOPIFY_TYPOGRAPHY_COMPLIANCE_BLOCK : SHARP_SANS_TYPOGRAPHY_BLOCK;
  const accentLine = accentColor && accentColor !== 'Auto' ? `Use ${accentColor} as the accent colour.` : '';
  const bgDesc = background === 'pale tint' ? 'pale tinted' : 'white';

  return `Create ONE premium square e-commerce feature image using the attached product photograph and the supplied product information.

PRODUCT INFORMATION
Product name: ${productName}
All verified key features: ${fullFeatures.join('; ')}
Features to highlight in THIS image: ${selectedFeatureGroup.join('; ')}
Image number: ${slot} of 5
Language: English

${PRODUCT_ACCURACY_BLOCK}

${PRECISE_POINTER_MAPPING_BLOCK}

${fontBlock}

VISUAL STYLE
Create polished e-commerce feature artwork with realistic product photography, soft studio lighting, subtle shadows, and a clean ${bgDesc} background.
Choose one restrained accent color that complements the actual product.
${accentLine}
Typography Mandate: Use dark, high-contrast text exclusively in the "Sharp Sans" font family ("Sharp Sans Bold" / "Sharp Sans Semibold" for headings and banner titles, "Sharp Sans Medium" / "Sharp Sans Regular" for subheadings, annotations, callout labels, and feature lists). NEVER substitute Arial, Helvetica, Roboto, or generic sans-serif fonts.
Keep the overall style consistent across the image series.

LAYOUT
Make the product prominent, with a balanced arrangement of product, headline, icons, and supporting text.
Keep the product's defining parts visible.
Use a short headline, one clear main benefit, and up to three concise supporting callouts, all strictly rendered in "Sharp Sans" font.
Leave generous spacing and safe margins. Ensure text is readable on a mobile screen.

COPY
Write clear, concise English based only on the selected feature group.
Preserve every supplied number, unit, and technical specification accurately.

CRITICAL FONT MANDATE (EXCLUSIVE SHARP SANS ONLY):
Every piece of text—headings, subheadings, Key Features graphics, callout labels, specification overlays, badges, annotations, feature lists, and marketing banners—MUST be rendered strictly in the "Sharp Sans" font family. Do NOT substitute or fall back to Arial, Helvetica, Roboto, or any other font.

OUTPUT
Generate exactly ONE complete 1:1 square image.
This is one individual feature image, not a collage, contact sheet, or three-panel design.
No outer frame or watermark.`;
}

export function buildPosterPrompt(params: {
  productName: string;
  fullFeatures: string[];
  colors?: string;
  platform?: string;
  accentColor?: string;
  background?: string;
}): string {
  const { productName, fullFeatures, colors, platform = 'shopify', accentColor, background } = params;

  const isShopify = platform === 'shopify';
  const fontBlock = isShopify ? SHOPIFY_TYPOGRAPHY_COMPLIANCE_BLOCK : SHARP_SANS_TYPOGRAPHY_BLOCK;
  const accentLine = accentColor && accentColor !== 'Auto' ? `Use ${accentColor} as the primary accent colour.` : '';
  const bgDesc = background === 'pale tint' ? 'pale tinted' : 'clean white';

  return `Create ONE premium portrait e-commerce poster using the attached product photograph and the supplied product information.

PRODUCT INFORMATION
Product name: ${productName}
All verified key features: ${fullFeatures.join('; ')}
Colour options: ${colors && colors.trim() !== '' ? colors : 'none supplied'}
Language: English

${PRODUCT_ACCURACY_BLOCK}

${PRECISE_POINTER_MAPPING_BLOCK}

${fontBlock}

POSTER STYLE
Make the product the hero: large, sharp, realistic, with soft studio lighting and a subtle shadow or reflection.
Use a clean ${bgDesc} background or a soft gradient of one restrained accent colour that complements the actual product. ${accentLine}
Place one bold headline of no more than six words near the top and a one-line subheading under it strictly in "Sharp Sans Bold" / "Sharp Sans Medium".
Add three or four short feature callouts with small, simple icons, taken only from the supplied features, strictly in "Sharp Sans" font.
Show colour options as labelled swatches only when colours are supplied (swatch labels strictly in "Sharp Sans").
Typography Mandate: Use dark, high-contrast text exclusively in the "Sharp Sans" font family ("Sharp Sans Bold" for headings, "Sharp Sans Medium" for subheadings, annotations, badges, and feature lists). NEVER substitute Arial, Helvetica, Roboto, or generic sans-serif fonts. Keep generous margins; all text must be readable on a phone.

COPY
Use only the supplied information. Preserve every number, unit and specification exactly.
Do not add prices, discounts, logos, certifications or claims that were not supplied.

CRITICAL FONT MANDATE (EXCLUSIVE SHARP SANS ONLY):
Every piece of text—headings, subheadings, feature callouts, badges, annotations, swatch labels, and marketing banners—on this poster MUST be rendered strictly in the "Sharp Sans" font family. Do NOT substitute or fall back to Arial, Helvetica, Roboto, or any other font.

OUTPUT
Generate exactly ONE complete portrait poster. Not a collage.
No outer frame, watermark, instructions, placeholders or production notes.`;
}

/**
 * Amazon Product Listing Image Prompt Builder
 * Generates 100% compliant Amazon product images following official Amazon Seller Central guidelines:
 * - 2000 × 2000 px production standard (1:1 square)
 * - Image 1: Main hero on pure white (#FFFFFF), 85-90% coverage, zero text/badges/props
 * - Image 2: Photorealistic lifestyle, zero text/badge overlays
 * - Image 3 & 4: Primary & secondary infographics, red circular badges, Sharp Sans typography, red bottom benefits banner
 * - Image 5: Multi-color variants only (auto-skipped if single color)
 * - Image 6: Technical dimension arrows (<--->) & verified warranty badge only (no weight/box contents)
 */
export function buildAmazonSlotPrompt(params: {
  productName: string;
  theme: 'hero' | 'lifestyle' | 'specs_part_1' | 'specs_part_2' | 'colors' | 'size_warranty' | string;
  slotNumber: number;
  slotTitle: string;
  headline?: string;
  promoBanner?: string;
  brand?: string;
  modelNumber?: string;
  features: string[];
  excludedFeatures?: string[];
  dimensions?: string;
  warranty?: string;
  colors?: string;
}): string {
  const {
    productName,
    theme,
    slotNumber,
    slotTitle,
    headline,
    promoBanner,
    brand = 'Sanford',
    modelNumber = '',
    features = [],
    excludedFeatures = [],
    dimensions,
    warranty,
    colors,
  } = params;

  // Clean brand name and model number regexes for text layers
  const brandRegex = new RegExp(`\\b${brand}\\b`, 'gi');
  const modelRegex = modelNumber ? new RegExp(`\\b${modelNumber}\\b`, 'gi') : /\b[A-Z]{2,4}\d{4,}[A-Z0-9]*\b/gi;

  const cleanText = (t?: string): string => {
    if (!t) return '';
    return t
      .replace(brandRegex, '')
      .replace(modelRegex, '')
      .replace(/\bSanford\b/gi, '')
      .replace(/\b[A-Z]{2,4}\d{4,}[A-Z0-9]*\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const cleanProductTitle = cleanText(productName) || productName;
  const cleanHeadline = cleanText(headline) || headline;
  const cleanPromoBanner = cleanText(promoBanner) || promoBanner;

  const seenFeat = new Set<string>();
  const cleanedFeatures: string[] = [];
  for (const f of features) {
    const cleaned = cleanText(f);
    if (cleaned.length > 2) {
      const key = cleaned.toLowerCase();
      if (!seenFeat.has(key)) {
        seenFeat.add(key);
        cleanedFeatures.push(cleaned);
      }
    }
  }

  const cleanExcluded: string[] = [];
  const seenExcl = new Set<string>();
  for (const ex of excludedFeatures) {
    const cleaned = cleanText(ex);
    if (cleaned.length > 2) {
      const key = cleaned.toLowerCase();
      if (!seenFeat.has(key) && !seenExcl.has(key)) {
        seenExcl.add(key);
        cleanExcluded.push(cleaned);
      }
    }
  }

  const featureListStr = cleanedFeatures.join('; ');
  const exclusiveListText = cleanedFeatures.length > 0
    ? cleanedFeatures.map((f, idx) => `    ${idx + 1}. ${f}`).join('\n')
    : '    (Render clean hardware close-up view only)';
  const excludedWarning = cleanExcluded.length > 0
    ? `\n- FORBIDDEN DUPLICATES (ALREADY SHOWN IN ANOTHER SLOT — STRICTLY DO NOT MENTION OR RENDER): [ ${cleanExcluded.join(' | ')} ]`
    : '';

  let slotDirective = '';

  switch (slotNumber) {
    case 1:
      // IMAGE 01 — MAIN PRODUCT HERO (STRICT AMAZON MAIN IMAGE RULES)
      slotDirective = `IMAGE 01 — AMAZON MAIN PRODUCT HERO (STRICT COMPLIANCE MANDATE):
- PRIMARY OBJECTIVE: Generate the compliant Amazon MAIN listing image.
- BACKGROUND: Seamless pure white (#FFFFFF / RGB 255, 255, 255) across the entire canvas with zero gradient or tint.
- COMPOSITION & SCALE: Product is centered and must occupy 85% to 90% of the image frame without touching or clipping any border.
- LIGHTING & SHADOW: Balanced commercial studio softbox illumination. Only a subtle, natural contact floor shadow directly under the base is permitted.
- PRODUCT FIDELITY: Depict the exact product from the reference photograph. Preserve its real proportions, buttons, knobs, ports, screen, finish, and factory molding.
- STRICT AMAZON MAIN IMAGE RESTRICTIONS (ZERO TOLERANCE):
  * ABSOLUTELY NO text, NO numbers, NO letters, NO words of any kind anywhere on the canvas.
  * ABSOLUTELY NO promotional badges, NO warranty ribbons, NO seals, NO discount tags, NO callouts.
  * ABSOLUTELY NO watermarks, NO added brand logos, NO graphic borders.
  * ABSOLUTELY NO lifestyle props, NO human hands/models, NO unrelated background objects.
  * Only show the actual product being sold. Flawless standalone studio photograph on pure white background (#FFFFFF).`;
      break;

    case 2:
      // IMAGE 02 — PREMIUM LIFESTYLE IMAGE (NO TEXT OVERLAYS)
      slotDirective = `IMAGE 02 — AMAZON PREMIUM LIFESTYLE IN-USE (STRICT ZERO-TEXT OVERLAY RULE):
- PRIMARY OBJECTIVE: Show the product naturally in an authentic, aspirational, photorealistic commercial setting.
- CONTEXT ENVIRONMENT:
  * Select an environment tailored to the product category:
    - Kitchen appliances: Modern premium kitchen countertop with natural morning window light.
    - Personal care/grooming: Clean contemporary bathroom counter or minimalist dressing vanity.
    - Fans, heaters, air coolers: Modern living room or bedroom with clean architecture and tasteful furnishings.
    - Lighting & outdoor: Realistic ambient home interior or evening terrace.
    - Electronics & office: Clean contemporary wooden work desk.
- PHOTOGRAPHY STYLE: Commercial editorial photography, realistic ambient illumination, true-to-life reflections, proper scale, soft depth-of-field background blur.
- PRODUCT VISIBILITY: The product is the clear primary subject and remains sharply in focus.
- STRICT AMAZON LIFESTYLE RULE:
  * ABSOLUTELY NO text, NO icons, NO badges, NO callouts, NO specifications, and NO promotional banners or overlays on this image.
  * Flawless commercial lifestyle photograph only.`;
      break;

    case 3:
      // IMAGE 03 — PRIMARY PRODUCT FEATURES INFOGRAPHIC
      slotDirective = `IMAGE 03 — AMAZON PRIMARY PRODUCT FEATURES INFOGRAPHIC:
- PRIMARY OBJECTIVE: Clearly communicate EXCLUSIVELY these ${cleanedFeatures.length} assigned specification(s):
${exclusiveListText}
- BACKGROUND: Clean white or light neutral grey studio environment (#F8F9FA).
- INFOGRAPHIC DESIGN SYSTEM:
  * Upper-left: Vertical stack of ONLY ${cleanedFeatures.length} red circular icon badge row(s) matching the numbered items above. DO NOT invent extra items.
  * Each feature item consists of:
    1. A solid vibrant RED circular icon badge (#E53935) with a clean white minimalist pictogram for that exact spec.
    2. Bold, short specification text matching the exact wording in clean "Sharp Sans Bold" / "Sharp Sans Medium" font.
    3. Fine horizontal hairline dividers between items.${excludedWarning}
- FULL-WIDTH RED BENEFIT BANNER:
  * Across the bottom 10% of the canvas, include a solid vibrant RED full-width rectangular banner.
  * Inside the red banner: Large, bold, clean WHITE typography in "Sharp Sans Bold" delivering the main benefit: "${cleanPromoBanner || cleanHeadline || 'Built for Everyday Performance'}".
- ANTI-DUPLICATION RULE: Each feature appears once and only once. Zero repetition with Image 04. No extra brand watermarks or model numbers.`;
      break;

    case 4:
      // IMAGE 04 — ADDITIONAL PRODUCT FEATURES INFOGRAPHIC
      slotDirective = `IMAGE 04 — AMAZON SECONDARY FEATURES INFOGRAPHIC:
- PRIMARY OBJECTIVE: Highlight EXCLUSIVELY these ${cleanedFeatures.length} secondary specification(s) not covered in Image 03:
${exclusiveListText}
- DESIGN SYSTEM: Matches Image 03 in typography, red circular icon badges (EXACTLY ${cleanedFeatures.length} badge row(s) only), alignment, and full-width red bottom benefits banner.${excludedWarning}
- PRODUCT ANGLE & HARDWARE FIDELITY: Features a detailed close-up, functional angle, or 1-to-1 pointer callouts of genuine ports/components visible on the uploaded product. DO NOT invent digital LED screens, extra ports, or color thumbnails.
- BENEFIT BANNER: Full-width solid red banner at the bottom with pure white typography in "Sharp Sans Bold".
- STRICT RULE: Each feature appears ONCE. Zero repetition with Image 03.`;
      break;

    case 5:
      // IMAGE 05 — AVAILABLE COLOUR OPTIONS (CONDITIONAL)
      slotDirective = `IMAGE 05 — AMAZON AVAILABLE COLOUR OPTIONS:
- PRIMARY OBJECTIVE: Display officially confirmed colour variants of the product side by side.
- CONFIRMED COLOURS: ${colors || 'Standard colour range'}.
- COMPOSITION: Clean white studio background. Product variants arranged in a balanced lineup or staggered front-to-back perspective.
- VISUAL STYLE: Exact structural identity across all units; clean circular colour indicator badges and labels in Sharp Sans font.
- BENEFIT BANNER: Full-width solid red banner at the bottom with white typography.
- STRICT RULE: Do not invent unconfirmed colours or fantasy editions.`;
      break;

    case 6:
      // IMAGE 06 — PRODUCT DIMENSIONS AND WARRANTY
      {
        const dims = parseDimensionMeasurements(dimensions);
        const hasWarranty = Boolean(warranty && warranty.trim());
        const warrantyBadgeText = hasWarranty ? (warranty!.trim()) : '';

        slotDirective = `IMAGE 06 — AMAZON PRODUCT DIMENSIONS & WARRANTY:
- PRIMARY OBJECTIVE: Clearly explain physical dimensions with clean technical callouts.
- BACKGROUND: Clean neutral white technical illustration studio canvas.
- COMPOSITION: Product centered upright in a clear front or three-quarter view.
- MEASUREMENT ARROWS & CALLOUTS:
  * Display accurate dimensions using crimson red double-ended technical dimension arrows (<----->):
    - Height: ${dims.height} (vertical arrow beside product)
    - Width: ${dims.width} (horizontal arrow at base)
    - Depth: ${dims.depth} (angled perspective arrow for depth/thickness)
  * Numbers and millimeter/centimeter units must be crisp and readable in "Sharp Sans Medium" font.
- WARRANTY BADGE:${hasWarranty ? `\n  * In the top-right corner, place a compact official red seal/ribbon badge: "${warrantyBadgeText}".` : '\n  * No warranty badge (omit warranty claim because not specified in source).'}
- STRICT PROHIBITED CONTENT:
  * ABSOLUTELY DO NOT DISPLAY product weight, package weight, box contents, or "What's in the box" listings.
  * Keep the focus strictly on unit dimensions and warranty.`;
      }
      break;

    default:
      slotDirective = `INFOGRAPHIC VIEW: Product featured prominently with red circular badges and Sharp Sans typography.`;
  }

  return `Create ONE high-definition Amazon-ready product listing image (2000 × 2000 px square standard) using the attached reference photograph and supplied product details.

PRODUCT SPECIFICATIONS:
- Product Name: ${cleanProductTitle}
- Model Number: ${modelNumber || 'None'}
- Category: Home & Kitchen Appliances / Electronics
- Key Features: ${featureListStr}
- Dimensions: ${dimensions || 'Not specified'}
- Warranty: ${warranty || 'Not specified'}
- Available Colours: ${colors || 'Single'}

${PRODUCT_ACCURACY_BLOCK}

${PRECISE_POINTER_MAPPING_BLOCK}

${SHARP_SANS_TYPOGRAPHY_BLOCK}

${NO_BRAND_OR_MODEL_RULE}

AMAZON TEMPLATE DIRECTIVE:
${slotDirective}

OUTPUT REQUIREMENT:
Generate exactly ONE 1:1 square image (rendered at 2000 × 2000 px production standard).
Clean commercial photography and graphic design. No outer canvas borders or watermarks.`;
}

/**
 * Amazon A+ Content Module Prompt Builder
 * Generates modular banners and rich comparison cards for Amazon Enhanced Brand Content (A+ Content):
 * - Standard Banner: 970 × 300 px
 * - Premium Full-Width Banner: 1464 × 600 px
 * - Triple Feature Card: 300 × 300 px
 * - Technical Deep-Dive / Comparison: 970 × 600 px
 */
export function buildAmazonAPlusPrompt(params: {
  productName: string;
  moduleType: 'standard_banner_970x300' | 'premium_banner_1464x600' | 'triple_card_300x300' | 'technical_deepdive_970x600' | string;
  brand?: string;
  modelNumber?: string;
  headline?: string;
  features: string[];
}): string {
  const { productName, moduleType, brand = 'Sanford', modelNumber = '', headline = '', features = [] } = params;

  let moduleSpec = '';
  switch (moduleType) {
    case 'standard_banner_970x300':
      moduleSpec = `MODULE: AMAZON STANDARD A+ HEADER BANNER (970 × 300 Aspect Ratio)
- Wide cinematic header composition featuring the product placed dynamically on the right side.
- Left side: Bold, inspiring brand headline in Sharp Sans Bold: "${headline || 'Engineered For Superior Performance'}" with 2 short benefit bullets.
- Background: Elegant dark or sleek studio environment with atmospheric lighting matching the product finish.
- Amazon A+ Rule: No pricing, no promotional terms, no external URLs, no claims not supported by product specs.`;
      break;

    case 'premium_banner_1464x600':
      moduleSpec = `MODULE: AMAZON PREMIUM A+ ULTRA-WIDE HERO BANNER (1464 × 600 Aspect Ratio)
- Ultra-wide high-impact premium brand banner showcasing the product in a breathtaking, photorealistic modern setting.
- Clean negative space on one side for rich typography in Sharp Sans font.
- Premium craftsmanship focus, cinematic depth of field, high-contrast crisp product details.`;
      break;

    case 'triple_card_300x300':
      moduleSpec = `MODULE: AMAZON A+ FEATURE SPOTLIGHT CARD (1:1 Square)
- Macro close-up focus on one key functional innovation or core technology of the product.
- Red circular icon badge with white pictogram at the top.
- Clear, bold title and 2-sentence explanatory paragraph in Sharp Sans font.`;
      break;

    case 'technical_deepdive_970x600':
    default:
      moduleSpec = `MODULE: AMAZON A+ TECHNICAL SPECIFICATIONS & COMPARISON (970 × 600 Aspect Ratio)
- Comprehensive technical breakdown highlighting components, motor/power mechanism, ergonomic controls, and engineering durability.
- Product centered with clean callout lines connecting to key components.
- Modern high-tech commercial visualization.`;
      break;
  }

  return `Create ONE Amazon A+ Content (Enhanced Brand Content) marketing module using the attached reference photograph.

PRODUCT DETAILS:
- Product: ${productName}
- Model: ${modelNumber}
- Verified Features: ${features.join('; ')}

${PRODUCT_ACCURACY_BLOCK}

${PRECISE_POINTER_MAPPING_BLOCK}

${SHARP_SANS_TYPOGRAPHY_BLOCK}

${moduleSpec}

OUTPUT:
Generate exactly ONE clean, high-resolution Amazon A+ graphic module adhering strictly to Amazon A+ Content content guidelines.`;
}

/**
 * Noon UAE Product Listing Image Prompt Builder
 * Generates 100% compliant Noon UAE listing images following official Noon Seller Help Center guidelines:
 * - 2000 × 2000 px production standard (1:1 square, JPEG export)
 * - Strict marketplace visual sequencing:
 *   1. Front Hero: Pure white (#FFFFFF), front-facing, balanced margins (70–80% fill), zero text/badges
 *   2. Back View: Rear view with authentic visible components, studio lighting, zero text
 *   3. Side View: Profile perspective showing true depth/thickness, zero text
 *   4. Three-Quarter View: Commercial 3/4 angle showcasing physical structure, zero text
 *   5. Product Detail: Close-up macro view of control panel, display, or key mechanism, zero text
 *   6. Lifestyle In-Use: Photorealistic aspirational environment, zero text, zero badges
 * - Strict Noon Rule: Standard gallery contains ZERO promotional overlays, banners, or warranty badges.
 */
export function buildNoonSlotPrompt(params: {
  productName: string;
  theme: string;
  slotNumber: number;
  slotTitle: string;
  brand?: string;
  modelNumber?: string;
  features?: string[];
  dimensions?: string;
  colors?: string;
}): string {
  const {
    productName,
    slotNumber,
    brand = 'Sanford',
    modelNumber = '',
    features = [],
    colors = '',
  } = params;

  // Clean brand and model numbers
  const brandRegex = new RegExp(`\\b${brand}\\b`, 'gi');
  const modelRegex = modelNumber ? new RegExp(`\\b${modelNumber}\\b`, 'gi') : /\b[A-Z]{2,4}\d{4,}[A-Z0-9]*\b/gi;

  const cleanText = (t?: string): string => {
    if (!t) return '';
    return t
      .replace(brandRegex, '')
      .replace(modelRegex, '')
      .replace(/\bSanford\b/gi, '')
      .replace(/\b[A-Z]{2,4}\d{4,}[A-Z0-9]*\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const cleanProductTitle = cleanText(productName) || productName;
  const cleanedFeatures = features.map((f) => cleanText(f)).filter((f) => f.length > 2);
  const featureListStr = cleanedFeatures.join('; ');

  let slotDirective = '';

  switch (slotNumber) {
    case 1:
      // IMAGE 01 — PRIMARY FRONT VIEW (Clean White Product Hero)
      slotDirective = `IMAGE 01 — NOON UAE PRIMARY FRONT VIEW (CLEAN WHITE PRODUCT HERO):
- PRIMARY OBJECTIVE: Official Noon UAE Primary Listing Image.
- ORIENTATION: Direct straight-on front view showing the primary controls and face of the product.
- BACKGROUND: Pure seamless white background (#FFFFFF / RGB 255, 255, 255) across the entire canvas with zero gradient or tint.
- FRAMING & MARGINS: Product occupies approximately 75% to 80% of the canvas with balanced breathing margins on all sides.
- LIGHTING & SHADOW: Clean commercial studio softbox lighting. Soft, minimal, natural contact grounding shadow only.
- STRICT NOON PRIMARY IMAGE NEGATIVE CONSTRAINTS (ZERO TOLERANCE):
  * ABSOLUTELY NO text, NO numbers, NO letters, NO words of any kind on the canvas.
  * ABSOLUTELY NO promotional badges, NO banners, NO warranty ribbons, NO price tags, NO watermarks, NO borders.
  * ABSOLUTELY NO lifestyle props, NO human hands, NO unrelated decorative objects.
  * ABSOLUTELY NO packaging box or retail carton. Standalone product only.
  * Preserve original factory molding, buttons, and physical logos from the reference photograph.`;
      break;

    case 2:
      // IMAGE 02 — REAR PRODUCT PHOTOGRAPHY (BACK VIEW)
      slotDirective = `IMAGE 02 — NOON UAE BACK VIEW (REAR PRODUCT PHOTOGRAPHY):
- PRIMARY OBJECTIVE: Show the actual product from the back with complete structural accuracy.
- ORIENTATION: Direct rear perspective of the product.
- BACKGROUND: Seamless pure white (#FFFFFF) studio background.
- PRODUCT FIDELITY: Accurately depict visible rear components, ventilation grilles, power cord entry/socket, rear switches, and authentic structural casing based on the reference product. Do not invent arbitrary fantasy parts.
- LIGHTING: Crisp professional studio illumination with subtle grounding shadow.
- STRICT NOON RULE: Zero text, zero icons, zero promotional badges, zero overlays. Commercial studio photograph only.`;
      break;

    case 3:
      // IMAGE 03 — PRODUCT PROFILE VIEW (SIDE VIEW)
      slotDirective = `IMAGE 03 — NOON UAE SIDE VIEW (PRODUCT PROFILE VIEW):
- PRIMARY OBJECTIVE: Clean profile view communicating exact physical depth and thickness.
- ORIENTATION: 90-degree side profile perspective.
- BACKGROUND: Seamless pure white (#FFFFFF) studio background.
- DETAILS: Accurate product depth, handle curvature, side buttons, dials, or cord attachments.
- LIGHTING: Soft studio rim and key lighting accentuating the clean silhouette of the appliance.
- STRICT NOON RULE: Zero text, zero icons, zero marketing graphics. Standalone studio photograph only.`;
      break;

    case 4:
      // IMAGE 04 — THREE-QUARTER PRODUCT VIEW (PREMIUM ANGLE)
      slotDirective = `IMAGE 04 — NOON UAE THREE-QUARTER PRODUCT VIEW (PREMIUM PRODUCT ANGLE):
- PRIMARY OBJECTIVE: Dynamic 3/4 perspective revealing the product's volumetric depth, front face, and side form simultaneously.
- ORIENTATION: Three-quarter commercial studio angle.
- BACKGROUND: Clean white studio background (#FFFFFF).
- LIGHTING: High-end commercial catalog photography with gentle softbox reflections and subtle natural grounding shadow.
- STRICT NOON RULE: Zero text, zero badges, zero graphic overlays. Premium studio photograph only.`;
      break;

    case 5:
      // IMAGE 05 — PRODUCT DETAIL PHOTOGRAPHY (CLOSE-UP DETAIL)
      slotDirective = `IMAGE 05 — NOON UAE PRODUCT DETAIL PHOTOGRAPHY (CLOSE-UP DETAIL):
- PRIMARY OBJECTIVE: High-resolution macro close-up of a key functional feature or control interface.
- SUBJECT: Focus closely on one prominent verified detail of this ${cleanProductTitle}:
  * E.g., digital LED touch panel, temperature control dial, precision blade assembly, stainless steel finish, or ergonomic grip.
- COMPOSITION: Elegant tight crop with shallow depth-of-field, highlighting engineering precision, premium texture, and tactile craftsmanship.
- STRICT NOON RULE: Standard Noon gallery prohibits textual feature labels or decorative icons. Clean, realistic photographic detail view only.`;
      break;

    case 6:
      // IMAGE 06 — REALISTIC LIFESTYLE IMAGE (PRODUCT IN USE)
      slotDirective = `IMAGE 06 — NOON UAE REALISTIC LIFESTYLE IMAGE (PRODUCT IN USE):
- PRIMARY OBJECTIVE: Photorealistic aspirational commercial photography showing the product in its authentic usage environment.
- CONTEXT ENVIRONMENT:
  * Kitchen appliances: Modern luxury kitchen countertop with natural ambient morning sunlight.
  * Personal care / grooming: Elegant minimalist bathroom vanity or contemporary dressing area.
  * Fans / climate control: Tastefully decorated modern living room or bedroom.
  * Lighting & electronics: Clean contemporary home or office workspace.
- PHOTOGRAPHY STYLE: Hyper-realistic commercial editorial photography, accurate scale relative to countertops and furnishings, soft background blur.
- PRODUCT FOCUS: Product is the sharp, prominent hero subject.
- STRICT NOON RULE: ABSOLUTELY NO text, NO icons, NO badges, NO promotional banners or overlays on this image. Flawless commercial lifestyle photograph only.`;
      break;

    default:
      slotDirective = `COMMERCIAL STUDIO VIEW: Product photographed on seamless pure white background (#FFFFFF) with studio lighting and zero text overlays.`;
  }

  return `Create ONE high-definition Noon UAE product listing image (2000 × 2000 px square standard, sRGB) using the attached reference photograph and supplied specifications.

PRODUCT DETAILS:
- Product Name: ${cleanProductTitle}
- Model Number: ${modelNumber || 'None'}
- Category: Home & Kitchen Appliances / Electronics
- Key Specifications: ${featureListStr}
- Colors: ${colors || 'Standard'}

${PRODUCT_ACCURACY_BLOCK}

NOON UAE MARKETPLACE DIRECTIVE:
${slotDirective}

OUTPUT:
Generate exactly ONE complete, standalone 1:1 square image.
Strictly adhere to Noon UAE Seller Help Center image standards (photographic realism, pure white studio backgrounds where specified, and ZERO added text or promotional elements).`;
}

/**
 * Noon UAE A+ Content Module Prompt Builder
 * Generates premium branded A+ graphics for Noon UAE Enhanced Brand Content:
 * - Supports English and Arabic sets
 * - 2400 px width standard
 * - Templates: 01 Hero Intro, 02 Primary Features, 03 Additional Features, 04 Lifestyle, 05 Dimensions, 06 Colors
 */
export function buildNoonAPlusPrompt(params: {
  productName: string;
  moduleType: string;
  slotNumber?: number;
  modelNumber?: string;
  features?: string[];
  dimensions?: string;
  colors?: string;
  lang?: 'en' | 'ar';
}): string {
  const {
    productName,
    moduleType,
    slotNumber = 1,
    modelNumber = '',
    features = [],
    dimensions,
    colors,
    lang = 'en',
  } = params;

  const isArabic = lang === 'ar';
  const cleanFeatures = (features || []).filter((f) => f && f.trim().length > 2);
  const dims = parseDimensionMeasurements(dimensions);

  let moduleSpec = '';

  switch (moduleType) {
    case 'intro_banner_2400x1000':
      moduleSpec = `A+ TEMPLATE 01 — PRODUCT INTRODUCTION (2400 × 1000 px WIDE HERO BANNER):
- COMPOSITION: Full-width panoramic branded hero banner.
- PRODUCT: Prominently centered or positioned with dramatic architectural presence.
- BACKGROUND: Sophisticated modern interior tailored to appliance category.
- TYPOGRAPHY: ${
        isArabic
          ? 'Arabic typography (Cairo / Neo Sans Arabic aesthetic, Right-to-Left alignment). Clean Arabic headline introducing the appliance with understated subtitle.'
          : 'Sharp Sans Bold typography. Clean English headline celebrating product innovation with minimal supporting subtitle.'
      }
- STYLE: Luxurious commercial advertisement aesthetic with crisp studio lighting.`;
      break;

    case 'primary_features_2400x1200':
      moduleSpec = `A+ TEMPLATE 02 — PRIMARY FEATURES INFOGRAPHIC (2400 × 1200 px):
- COMPOSITION: Product hero flanked by 3 to 4 key verified specifications: ${cleanFeatures.slice(0, 4).join('; ')}.
- FEATURE CALLOUTS:
  * Vibrant red circular badges (#E53935) with minimalist white pictograms.
  * ${
    isArabic
      ? 'Arabic headline and benefit text positioned on the RIGHT with RTL alignment.'
      : 'Sharp Sans Bold / Medium feature headlines and benefit descriptions.'
  }
- FULL-WIDTH RED BENEFIT BANNER:
  * Solid vibrant red banner spanning the bottom 12% of the canvas.
  * Pure white typography stating key selling proposition in ${isArabic ? 'Arabic' : 'Sharp Sans Bold'}.
- NOON RULE: Feature claims must strictly reflect verified catalogue specifications.`;
      break;

    case 'additional_features_2400x1200':
      moduleSpec = `A+ TEMPLATE 03 — ADDITIONAL FEATURES DEEP-DIVE (2400 × 1200 px):
- COMPOSITION: Close-up macro engineering perspective displaying secondary features: ${cleanFeatures.slice(4, 8).join('; ') || cleanFeatures.join('; ')}.
- DESIGN LANGUAGE: Identical visual hierarchy to Template 02 with red circular icon badges and full-width red benefits banner.
- LANGUAGE: ${isArabic ? 'Arabic RTL typography and translation.' : 'Sharp Sans typography.'}
- ANTI-DUPLICATION: Non-overlapping features from Template 02.`;
      break;

    case 'lifestyle_banner_2400x1000':
      moduleSpec = `A+ TEMPLATE 04 — PRODUCT LIFESTYLE STORY (2400 × 1000 px):
- COMPOSITION: Expansive premium lifestyle photography placing the product in an upscale contemporary residence.
- OVERLAY: Minimalist translucent benefit pill with a single verified claim in ${isArabic ? 'Arabic' : 'Sharp Sans'}.
- MOOD: Warm, inviting, commercial editorial quality.`;
      break;

    case 'dimensions_2400x1200':
      moduleSpec = `A+ TEMPLATE 05 — PRODUCT DIMENSIONS SPECIFICATION (2400 × 1200 px):
- COMPOSITION: Upright front or 3/4 angle on neutral light studio canvas.
- DIMENSION ARROWS:
  * Crisp crimson red double-ended arrows (<----->) marking Height (${dims.height}), Width (${dims.width}), and Depth (${dims.depth}).
  * Crisp measurement numbers in mm/cm.
- STRICT NOON A+ RULE: DO NOT display warranty graphics or price badges. Exclude packaging weight and box contents.`;
      break;

    case 'colors_2400x1000':
      moduleSpec = `A+ TEMPLATE 06 — AVAILABLE COLOUR FINISHES (2400 × 1000 px):
- COMPOSITION: Multi-unit lineup exhibiting verified colour options: ${colors || 'Standard finishes'}.
- STYLE: Clean white studio background with circular colour indicator swatches and matching red bottom banner.`;
      break;

    default:
      moduleSpec = `A+ BANNER: Branded product showcase adhering to Noon UAE A+ Content design guidelines.`;
  }

  return `Create ONE high-impact Noon UAE A+ Content banner (${isArabic ? 'Arabic Edition (RTL)' : 'English Edition'}) using the attached reference photograph.

PRODUCT DETAILS:
- Product: ${productName}
- Model: ${modelNumber}
- Target Language: ${isArabic ? 'Arabic (RTL)' : 'English'}
- Verified Specifications: ${cleanFeatures.join('; ')}

${PRODUCT_ACCURACY_BLOCK}

${PRECISE_POINTER_MAPPING_BLOCK}

${SHARP_SANS_TYPOGRAPHY_BLOCK}

${
  isArabic
    ? `ARABIC TYPOGRAPHY & RTL MANDATE:
- All text overlays, headlines, and feature descriptions MUST be rendered in professional, grammatically correct Arabic.
- Text must follow standard Right-to-Left (RTL) reading flow and alignment.
- Use a modern, elegant Arabic sans-serif typeface (Cairo / Neo Sans Arabic style) that matches the precision of Sharp Sans.
- Keep model numbers (e.g. "${modelNumber}") in their original alphanumeric form.`
    : ''
}

NOON A+ MODULE SPECIFICATION:
${moduleSpec}

OUTPUT:
Generate exactly ONE clean, high-resolution Noon UAE A+ Content banner.`;
}

