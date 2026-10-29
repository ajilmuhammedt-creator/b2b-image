export const PRODUCT_ACCURACY_BLOCK = `PRODUCT ACCURACY
Treat the uploaded product photograph as the source of truth for the product's appearance.
Faithfully preserve its shape, proportions, colors, materials, texture, buttons, ports, branding, labels, and visible components.
Keep the product clearly recognizable and accurately represented.
Do not redesign it, add invented components, change its color, or alter its defining geometry.
Use only the supplied specifications and claims. Do not invent certifications or performance figures not provided.`;

export function buildSanfordSlotPrompt(params: {
  productName: string;
  theme: 'hero' | 'lifestyle' | 'technical' | 'battery_display' | 'flexibility' | 'infographic';
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
    accentColor,
    background,
  } = params;

  const bgDesc = background === 'pale tint' ? 'pale tinted, clean' : 'pure seamless white';
  const accentLine = accentColor && accentColor !== 'Auto' ? `Use ${accentColor} as the subtle accent color.` : '';
  const featureListStr = features.join('; ');

  let specificStyle = '';

  switch (theme) {
    case 'hero':
      specificStyle = `SLOT 1: HERO STUDIO VIEW (SANFORD PATTERN)
- Make the product the undisputed hero, centered at a clean front or three-quarter angle.
- Clean ${bgDesc} studio background with soft, natural contact floor shadow.
- Studio softbox lighting creating crisp highlights on the product's metallic and matte surfaces.
- NO text, NO watermarks, NO badges. Just a flawless commercial product photograph.`;
      break;

    case 'lifestyle':
      specificStyle = `SLOT 2: LIFESTYLE & IN-USE SCENE (SANFORD PATTERN)
- Depict the product in an active, realistic everyday environment (e.g. outdoors in soft daylight, park, travel, or modern indoor desk).
- A person is naturally using or holding the product (or wearing it with the lanyard if applicable).
- The product itself remains sharp, clearly in focus, and matching the reference photograph.
- Prominently feature a bold, clean headline at the top: "${headline || 'The Smartest Breeze!'}".
- Dark, high-contrast, modern bold sans-serif typography with generous margins.`;
      break;

    case 'technical':
      specificStyle = `SLOT 3: CORE TECHNOLOGY & AIRFLOW (SANFORD PATTERN)
- Feature artwork highlighting the core innovation: ${featureListStr}.
- Show the product with subtle, elegant visual flow effects (e.g. refreshing cool airwaves, cold-plate indicator, or turbine vortex).
- Place 2 or 3 concise feature callouts with small minimal tech icons.
- Clean modern layout, professional e-commerce presentation with dark legible text. ${accentLine}`;
      break;

    case 'battery_display':
      specificStyle = `SLOT 4: BATTERY, POWER & SMART DISPLAY (SANFORD PATTERN)
- Focus on internal endurance and smart interface: ${featureListStr}.
- Feature a crisp view of the product's digital LED display glowing with gear/battery readout.
- Highlight the 3600mAh battery life and Type-C fast charging port with a clean graphic badge.
- High-contrast e-commerce commercial typography with icon badges.`;
      break;

    case 'flexibility':
      specificStyle = `SLOT 5: 90° ROTATION, FOLD & PORTABILITY (SANFORD PATTERN)
- Demonstrate product versatility and articulation: ${featureListStr}.
- Show the 90° rotation folding head (articulated up/down) and the wearable lanyard / loop holder stand.
- Headline: "${headline || '90° Foldable Rotation & Hands-Free Wear'}".
- Multi-angle clarity with balanced layout and clean background.`;
      break;

    case 'infographic':
      specificStyle = `SLOT 6: SPECIFICATIONS, WHAT'S IN THE BOX & WARRANTY (SANFORD PATTERN)
- Professional technical specification sheet infographic.
- Display the product with clear dimensional measurement callouts: ${dimensions || '197mm height, 78mm width, 57mm base'} and weight (${weight || 'Unit 225g'}).
- Show "What's in the box" icons: ${whatsInTheBox?.join(', ') || 'Hand Fan, Type-C Cable, User Manual'}.
- Include an official "${warranty || '1 Year Service Warranty'}" shield trust badge in the top corner.
- Crisp, legible diagrammatic layout designed for mobile and desktop product pages.`;
      break;
  }

  return `Create ONE premium 1:1 square e-commerce product image for Sanford online store (patterned after Sanford product page).

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
