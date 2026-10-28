export const FEATURE_PROMPT_TEMPLATE = `Create ONE premium square e-commerce feature image using the attached product photograph and the supplied product information.

PRODUCT INFORMATION
Product name: [PRODUCT NAME]
All verified key features: [FULL FEATURE LIST]
Features to highlight in THIS image: [SELECTED FEATURE GROUP]
Image number: [IMAGE NUMBER] of 5
Language: English

PRODUCT ACCURACY
Treat the uploaded product photograph as the source of truth for the product's appearance.
Faithfully preserve its shape, proportions, colors, materials, texture, buttons, ports, branding, labels, and visible components.
Keep the product clearly recognizable and accurately represented.
Do not redesign it, add components, change its color, or invent accessories.
Use only the supplied specifications and claims. Do not invent certifications, performance figures, dimensions, benefits, or included items.
If a feature involves a component or mechanism not visible in the photograph, communicate it through text and a simple icon instead of inventing a detailed product view.
Show alternative colors as labeled swatches only when those colors are explicitly supplied.

VISUAL STYLE
Create polished e-commerce feature artwork with realistic product photography, soft studio lighting, subtle shadows, and a clean [BACKGROUND] background.
Choose one restrained accent color that complements the actual product.
[ACCENT LINE]
Use dark, high-contrast text and modern, bold sans-serif typography.
Keep the overall style consistent across the image series.
If an additional image is supplied as a style reference, use it only for layout, typography, and color treatment; use the original product photograph for product identity.

LAYOUT
Make the product prominent, with a balanced arrangement of product, headline, icons, and supporting text.
Keep the product's defining parts visible.
Use a short headline, one clear main benefit, and up to three concise supporting callouts.
Use small, relevant icons or subtle visual effects only when they help explain the selected features.
Choose a layout appropriate to the product category. Include a usage scene only when supported by the supplied information.
Leave generous spacing and safe margins. Ensure text is readable on a mobile screen.
Avoid clutter, excessive decorations, tiny paragraphs, and overlapping text.

COPY
Write clear, concise English based only on the selected feature group.
Preserve every supplied number, unit, and technical specification accurately.
Avoid exaggerated claims and unsupported superlatives.
Do not include the image number, instructions, placeholders, or production notes in the artwork.

OUTPUT
Generate exactly ONE complete 1:1 square image.
This is one individual feature image, not a collage, contact sheet, or three-panel design.
No outer frame or watermark.`;

export const POSTER_PROMPT_TEMPLATE = `Create ONE premium portrait e-commerce poster using the attached product photograph and the supplied product information.

PRODUCT INFORMATION
Product name: [PRODUCT NAME]
All verified key features: [FULL FEATURE LIST]
Colour options: [COLOURS]
Language: English

PRODUCT ACCURACY
Treat the uploaded product photograph as the source of truth for the product's appearance.
Faithfully preserve its shape, proportions, colors, materials, texture, buttons, ports, branding, labels, and visible components.
Keep the product clearly recognizable and accurately represented.
Do not redesign it, add components, change its color, or invent accessories.
Use only the supplied specifications and claims. Do not invent certifications, performance figures, dimensions, benefits, or included items.
If a feature involves a component or mechanism not visible in the photograph, communicate it through text and a simple icon instead of inventing a detailed product view.
Show alternative colors as labeled swatches only when those colors are explicitly supplied.

POSTER STYLE
Make the product the hero: large, sharp, realistic, with soft studio lighting and a subtle shadow or reflection.
Use a clean [BACKGROUND] background or a soft gradient of one restrained accent colour that complements the actual product. [ACCENT LINE]
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

export function buildFeaturePrompt(params: {
  productName: string;
  fullFeatures: string[];
  selectedFeatureGroup: string[];
  slot: number;
  accentColor?: string;
  background?: string;
}): string {
  const { productName, fullFeatures, selectedFeatureGroup, slot, accentColor, background } = params;

  let prompt = FEATURE_PROMPT_TEMPLATE;
  prompt = prompt.replace('[PRODUCT NAME]', productName);
  prompt = prompt.replace('[FULL FEATURE LIST]', fullFeatures.join('; '));
  prompt = prompt.replace(
    '[SELECTED FEATURE GROUP]',
    selectedFeatureGroup && selectedFeatureGroup.length > 0
      ? selectedFeatureGroup.join('; ')
      : fullFeatures.join('; ')
  );
  prompt = prompt.replace('[IMAGE NUMBER]', String(slot));
  prompt = prompt.replace('[BACKGROUND]', background === 'pale tint' ? 'pale tinted' : 'white');

  const accentLine = accentColor && accentColor !== 'Auto' && accentColor.trim() !== ''
    ? `Use ${accentColor} as the accent colour.`
    : '';
  prompt = prompt.replace('[ACCENT LINE]', accentLine);

  return prompt;
}

export function buildPosterPrompt(params: {
  productName: string;
  fullFeatures: string[];
  colors?: string;
  accentColor?: string;
  background?: string;
}): string {
  const { productName, fullFeatures, colors, accentColor, background } = params;

  let prompt = POSTER_PROMPT_TEMPLATE;
  prompt = prompt.replace('[PRODUCT NAME]', productName);
  prompt = prompt.replace('[FULL FEATURE LIST]', fullFeatures.join('; '));
  prompt = prompt.replace('[COLOURS]', colors && colors.trim() !== '' ? colors : 'none supplied');
  prompt = prompt.replace('[BACKGROUND]', background === 'pale tint' ? 'pale tinted' : 'clean white');

  const accentLine = accentColor && accentColor !== 'Auto' && accentColor.trim() !== ''
    ? `Use ${accentColor} as the primary accent colour.`
    : '';
  prompt = prompt.replace('[ACCENT LINE]', accentLine);

  return prompt;
}

