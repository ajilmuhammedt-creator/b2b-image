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

export const PRODUCT_ACCURACY_BLOCK = `PRODUCT ACCURACY
Treat the uploaded product photograph as the source of truth for the product's appearance.
Faithfully preserve its shape, proportions, colors, materials, texture, buttons, ports, branding, labels, and visible components.
Keep the product clearly recognizable and accurately represented.
Do not redesign it, add invented components, change its color, or alter its defining geometry.
Use only the supplied specifications and claims. Do not invent certifications or performance figures not provided.`;

export function buildSanfordSlotPrompt(params: {
  productName: string;
  theme: 'hero' | 'lifestyle' | 'specs_part_1' | 'specs_part_2' | 'colors' | 'size_warranty' | 'poster' | string;
  slotTitle: string;
  headline?: string;
  features: string[];
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
    features,
    dimensions,
    weight,
    whatsInTheBox,
    warranty,
    colors,
    accentColor,
    background,
  } = params;

  const bgDesc = background === 'pale tint' ? 'pale tinted, clean' : 'pure seamless white';
  const accentLine = accentColor && accentColor !== 'Auto' ? `Use ${accentColor} as the subtle accent color.` : '';
  const featureListStr = features.join('; ');

  let specificStyle = '';

  switch (theme) {
    case 'hero':
      specificStyle = `SLOT 1: HERO STUDIO VIEW (PURE WHITE BACKGROUND)
- Make the product the undisputed hero, centered at a clean front or three-quarter angle.
- Clean pure seamless white (#FFFFFF) studio background with soft, natural contact floor shadow.
- Studio softbox lighting creating crisp highlights on the product's metallic and matte surfaces.
- STRICT CONSTRAINT: ABSOLUTELY NO text, NO numbers, NO specifications, NO badges, NO watermarks, NO icons. Flawless commercial product photograph on pure white only.`;
      break;

    case 'lifestyle':
      specificStyle = `SLOT 2: LIFESTYLE & IN-USE SCENE (NO SPECIFICATIONS)
- Depict the product in an active, realistic everyday environment (e.g. outdoors in soft daylight, park, commute, or modern indoor desk).
- A person is naturally using or holding the product (or wearing it with the lanyard if applicable).
- The product itself remains sharp, clearly in focus, and matching the reference photograph.
- Prominently feature a bold, clean headline at the top: "${headline || 'The Smartest Breeze!'}".
- Dark, high-contrast, modern bold sans-serif typography with generous margins.
- STRICT CONSTRAINT: STRICTLY NO technical product specifications, NO feature lists, NO numbers/specs text, NO battery/power specs. Slogan or lifestyle headline only.`;
      break;

    case 'specs_part_1':
      specificStyle = `SLOT 3: PRODUCT SPECIFICATIONS — PART 1
- Feature artwork highlighting the core functional specifications: ${featureListStr}.
- Show the product with subtle, elegant visual flow effects (e.g. refreshing cool airwaves, cold-plate indicator, or turbine vortex).
- Place 2 or 3 concise feature callouts with small minimal tech icons.
- Clean modern layout, professional BuySanford e-commerce presentation with dark legible text. ${accentLine}`;
      break;

    case 'specs_part_2':
      specificStyle = `SLOT 4: PRODUCT SPECIFICATIONS — PART 2 (NON-OVERLAPPING)
- Highlight the remaining distinct specifications: ${featureListStr}.
- Feature a crisp view of internal power and smart interface (e.g. digital LED display glowing with gear/battery readout, rechargeable battery, Type-C charging port).
- High-contrast e-commerce commercial typography with icon badges.
- STRICT CONSTRAINT: Do NOT repeat any feature or specification from Slot 3. Only showcase the distinct features assigned to this slot.`;
      break;

    case 'colors':
      specificStyle = `SLOT 5: AVAILABLE COLOUR MODELS ONLY (NO SPECIFICATIONS)
- Show the product in its available color models / options: ${colors || 'Graphite Black, Arctic White, Slate Grey, Pastel Blue'}.
- Present the color options cleanly: either multiple product units arranged side-by-side showing each color variant, or a hero unit with elegant circular color swatches below.
- Headline: "Available Colors" or "${productName} Colors".
- STRICT CONSTRAINT: STRICTLY NO technical product specifications, NO wattage, NO battery numbers, NO feature descriptions. Focus exclusively on showing the available color models and variants.`;
      break;

    case 'size_warranty':
    case 'infographic': {
      const { height, width, depth } = parseDimensionMeasurements(dimensions);
      specificStyle = `SLOT 6: UNIT DIMENSION & WARRANTY ONLY (EXACT BUYSANFORD STYLE)
- BACKGROUND & COMPOSITION:
  * Soft, pale warm pastel background with a delicate peach/pink tint (#FDEFEF to #FADBD8, matching BuySanford specification artwork).
  * Flat studio surface horizon line where the product stands upright in the center with a realistic soft floor contact shadow.
  * Flawless centered product facing forward.

- TOP-LEFT HEADER:
  * In the top-left corner, display clean, modest-sized header text in dark charcoal/black sans-serif: "Unit Dimension".
  * Clean, elegant typography with generous margins from the edges.

- TOP-RIGHT WARRANTY BADGE (EXACT SANFORD DUAL-RIBBON BANNER):
  * In the top-right corner, place the official Sanford folded ribbon banner badge:
    - Top folded angled ribbon: Bright VIBRANT RED banner with bold white text "1 YEAR".
    - Lower folded angled ribbon: Rich NAVY BLUE banner with bold white text "SERVICE WARRANTY".
    - Clean folded ribbon 3D geometry with notched/folded banner ends.
    - STRICT: DO NOT use a golden shield. MUST use the RED and NAVY BLUE folded ribbon banner.

- DIMENSION ARROWS & CALLOUTS (EXACT CRIMSON RED ARROWS):
  * Dimension arrows MUST be crisp, thin double-ended arrows in bright CRIMSON RED (<───────>) with solid red triangular arrowheads on both ends.
  * Height callout: A vertical double-ended crimson red arrow along the right side of the product with dark legible text: "${height}".
  * Width callout: A horizontal double-ended crimson red arrow beneath the product base with dark legible text: "${width}".
  * Depth callout: An angled perspective double-ended crimson red arrow showing product depth/thickness with dark legible text: "${depth}".
  * Measurement numbers must be clearly readable in clean, dark sans-serif.

- STRICT NEGATIVE RULES (CRITICAL):
  * STRICTLY NO PRODUCT WEIGHT. Absolutely NO "Unit Weight", NO "Package Weight", NO "225g", NO "305g", NO weight icons, NO scales.
  * STRICTLY NO "WHAT'S IN THE BOX". Absolutely NO box contents, NO USB cables, NO user manual drawings, NO accessories, NO inset boxes.
  * STRICTLY NO other product specifications, performance claims, battery/wattage text, or descriptions.
  * The image must contain ONLY: the centered product, "Unit Dimension" in top left, the red/blue ribbon "1 YEAR SERVICE WARRANTY" badge in top right, and the crimson red dimension arrows (<--->) with measurements.`;
      break;
    }

    default:
      specificStyle = `SLOT FEATURE ARTWORK
- Feature artwork for: ${featureListStr}.
- Clean ${bgDesc} background with high-contrast text. ${accentLine}`;
      break;
  }

  return `Create ONE premium 1:1 square e-commerce product image for BuySanford online store (patterned after BuySanford product page rules: https://www.buysanford.com).

PRODUCT INFORMATION
Product Name: ${productName}
Highlight Theme: ${slotTitle}
Key Specs: ${featureListStr}
Language: English

${PRODUCT_ACCURACY_BLOCK}

${specificStyle}

OUTPUT
Generate exactly ONE complete 1:1 square image.
No outer borders, no watermark, no production notes.`;
}

export function buildFeaturePrompt(params: {
  productName: string;
  fullFeatures: string[];
  selectedFeatureGroup: string[];
  slot: number;
  accentColor?: string;
  background?: string;
}): string {
  const { productName, fullFeatures, selectedFeatureGroup, slot, accentColor, background } = params;

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

VISUAL STYLE
Create polished e-commerce feature artwork with realistic product photography, soft studio lighting, subtle shadows, and a clean ${bgDesc} background.
Choose one restrained accent color that complements the actual product.
${accentLine}
Use dark, high-contrast text and modern, bold sans-serif typography.
Keep the overall style consistent across the image series.

LAYOUT
Make the product prominent, with a balanced arrangement of product, headline, icons, and supporting text.
Keep the product's defining parts visible.
Use a short headline, one clear main benefit, and up to three concise supporting callouts.
Leave generous spacing and safe margins. Ensure text is readable on a mobile screen.

COPY
Write clear, concise English based only on the selected feature group.
Preserve every supplied number, unit, and technical specification accurately.

OUTPUT
Generate exactly ONE complete 1:1 square image.
No outer frame or watermark.`;
}

export function buildPosterPrompt(params: {
  productName: string;
  fullFeatures: string[];
  colors?: string;
  accentColor?: string;
  background?: string;
}): string {
  const { productName, fullFeatures, colors, accentColor, background } = params;

  const accentLine = accentColor && accentColor !== 'Auto' ? `Use ${accentColor} as the primary accent colour.` : '';
  const bgDesc = background === 'pale tint' ? 'pale tinted' : 'clean white';

  return `Create ONE premium portrait e-commerce poster using the attached product photograph and the supplied product information.

PRODUCT INFORMATION
Product name: ${productName}
All verified key features: ${fullFeatures.join('; ')}
Colour options: ${colors && colors.trim() !== '' ? colors : 'none supplied'}
Language: English

${PRODUCT_ACCURACY_BLOCK}

POSTER STYLE
Make the product the hero: large, sharp, realistic, with soft studio lighting and a subtle shadow or reflection.
Use a clean ${bgDesc} background or a soft gradient of one restrained accent colour that complements the actual product. ${accentLine}
Place one bold headline of no more than six words near the top and a one-line subheading under it.
Add three or four short feature callouts with small, simple icons, taken only from the supplied features.
Show colour options as labelled swatches only when colours are supplied.
Use dark, high-contrast, modern bold sans-serif type. Keep generous margins; all text must be readable on a phone.

COPY
Use only the supplied information. Preserve every number, unit and specification exactly.
Do not add prices, discounts, logos, certifications or claims that were not supplied.

OUTPUT
Generate exactly ONE complete portrait poster. Not a collage.
No outer frame, watermark, instructions, placeholders or production notes.`;
}
