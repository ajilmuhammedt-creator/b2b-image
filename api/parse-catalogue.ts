import crypto from 'crypto';
import { requireUser } from './_lib/requireUser.js';

export const config = {
  maxDuration: 300,
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const catalogueImage = body?.catalogueImage || body?.imageDataUrl || body?.image || '';
    const extractedText = body?.extractedText || '';
    const fileName = body?.fileName || 'catalogue.pdf';

    if (!catalogueImage && !extractedText) {
      return res.status(400).json({ error: 'Catalogue image or text is required.' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({
        error: 'OPENAI_API_KEY is not configured. Please add OPENAI_API_KEY in your environment variables.',
      });
    }

    const systemPrompt = `You are an elite e-commerce creative director specializing in high-converting product listings for electronics and appliances, patterned exactly after BuySanford e-commerce product pages (e.g., https://www.buysanford.com/products/sanford-camping-emergency-lantern-sf2722el).

TYPOGRAPHY MANDATE FOR SHOPIFY ASSETS (CRITICAL):
All rendered text—including headings, subheadings, Key Features graphics, callout labels, specification overlays, feature lists, annotations, badges, dimension callouts, and marketing banners—MUST strictly use the "Sharp Sans" font family exclusively (geometric, clean contemporary sans-serif with circular counters and sharp modern apexes). Never substitute or fall back to Arial, Helvetica, Roboto, or any other font.

You are given a supplier product catalogue sheet (as an image and/or extracted text).
Analyze all visual and textual elements carefully.

Extract the following in strictly structured JSON:
1. "productName": Complete product commercial title (e.g. "Sanford SF6671HFN Rechargeable Cooling Hand Fan")
2. "modelNumber": Model code (e.g. "SF6671HFN")
3. "brand": Brand name (e.g. "Sanford")
4. "tagline": The main marketing headline or slogan literally printed on the sheet (or "" if none is written).
5. "seriesName": Optional series or product line printed on the sheet (e.g. "PLATINUM ZOOM", or "" if none).
6. "fullFeatures": An array of ONLY the verified bullet-point specifications and technical claims explicitly printed on the catalogue sheet (e.g. wattage, battery capacity, speed levels, charging port, runtime, blade/motor specs). STRICT COMPLIANCE: NEVER invent, assume, or add unlisted features such as digital LED displays, screens, extra ports, folding hinges, or cooling plates unless explicitly written on the sheet. Deduplicate repeated bullets so each spec appears ONCE only.
7. "dimensions": Unit and package dimensions if present (e.g. "78mm x 197mm x 57mm")
8. "weight": Unit weight and package weight (e.g. "Unit 225g, Package 305g")
9. "whatsInTheBox": Array of items included (e.g. ["Hand Fan", "Type-C USB Cable", "User Manual"])
10. "warranty": Warranty statement if shown (e.g. "1 Year Service Warranty")
11. "colors": Color options or finishes (e.g. "Graphite Black, Arctic White, Slate Grey")
12. "cropBox": Normalized bounding box [ymin, xmin, ymax, xmax] (values 0.0 to 1.0) of the primary hero product image on this catalogue sheet.
13. "slots": Exactly 6 slots matching the STRICT BuySanford 6-image e-commerce rules:
    - Slot 1: theme "hero", title "Hero Studio View (White Background)"
      * Description: Pure white background (#FFFFFF), studio softbox lighting, soft floor shadow.
      * STRICT: NO text, NO numbers, NO specifications, NO badges.
      * features: []
    - Slot 2: theme "lifestyle", title "Lifestyle In-Use (No Specs)"
      * Description: Exact BuySanford lifestyle template. In the top-LEFT corner, a solid RED rectangle (#E53935) with rounded corners containing crisp white bold sans-serif tagline text. In the bottom-RIGHT corner, small discreet white product type caption. If seriesName is present, top-right shows series name in bold italic silver metallic style. ZERO floating specs across the image. Realistic person naturally using the product in its authentic setting.
      * headline: Short 2-5 word lifestyle tagline from the catalogue (or concise product tagline based strictly on the sheet)
      * STRICT: Slogan/tagline headline only. STRICTLY NO product specifications or technical data.
      * features: []
    - Slot 3: theme "specs_part_1", title "Feature Highlight 1"
      * Description: Exact buysanford.com single-feature focus. Dark atmospheric scene showcasing Banner Feature in action. Full-width red bottom banner showing ONLY Banner Feature (max 30 chars). Overlapping white circle with red ring on left containing one black line icon. At most 2 supporting callouts (solid red circle icon + large white text). Optional white uppercase top headline (max 40 chars).
      * bannerFeature: Strongest verified feature from catalogue (max 30 chars, e.g. "4L Capacity")
      * callout1: Supporting verified spec (optional, max 25 chars)
      * callout2: Supporting verified spec (optional, max 25 chars)
      * topHeadline: Optional uppercase headline (max 40 chars)
      * promoBanner: Same as bannerFeature
      * STRICT DEDUPLICATION: Do NOT repeat the product name or category in the banner. Zero overlap with Slot 4.
      * features: [Assigned specs for Feature Highlight 1]
    - Slot 4: theme "specs_part_2", title "Feature Highlight 2"
      * Description: Exact buysanford.com single-feature focus. Dark atmospheric scene showcasing second key feature. Full-width red bottom banner showing ONLY Banner Feature (max 30 chars). Overlapping white circle with red ring on left containing one black line icon. At most 2 supporting callouts. Optional white uppercase top headline (max 40 chars).
      * bannerFeature: Second strongest verified feature from catalogue (max 30 chars, e.g. "Adjustable Zoom Function")
      * callout1: Supporting verified spec (optional, max 25 chars)
      * callout2: Supporting verified spec (optional, max 25 chars)
      * topHeadline: Optional uppercase headline (max 40 chars)
      * promoBanner: Same as bannerFeature
      * STRICT DEDUPLICATION: MUST NOT repeat or duplicate any feature from Slot 3.
      * features: [Assigned specs for Feature Highlight 2]
    - Slot 5: theme "colors", title "Available Colour Models Only"
      * Description: Product lineup / swatches showing all available color models.
      * Note: If the catalogue does NOT specify multiple color options (i.e. product has only 1 color or no color options mentioned), leave "colors" empty or single color. Do NOT hallucinate fake colors.
      * Bottom Banner: Full-width solid red promotional strip with large white typography (e.g. "Light Weight and Easy to Carry").
      * promoBanner: Brand convenience message (e.g. "Light Weight and Easy to Carry")
      * STRICT: Show ONLY available color models. STRICTLY NO technical specifications.
      * features: [List of available color options]
    - Slot 6: theme "size_warranty", title "Unit Dimension & Warranty Only"
      * Description: Exact BuySanford style ("Unit Dimension" header in top left, dual-ribbon red/navy blue "1 YEAR SERVICE WARRANTY" badge in top right, crimson red dimension arrows for height, width, and depth, pale warm peach/pink pastel background).
      * STRICT: Show ONLY unit dimensions and official warranty ribbon. STRICTLY NO product weight, NO "what's in the box", NO cables/accessories, NO other specs.
      * features: [Dimension string, Warranty string]

Output MUST be valid JSON matching this schema:
{
  "productName": string,
  "modelNumber": string,
  "brand": string,
  "tagline": string,
  "fullFeatures": string[],
  "dimensions": string,
  "weight": string,
  "whatsInTheBox": string[],
  "warranty": string,
  "colors": string,
  "cropBox": { "ymin": number, "xmin": number, "ymax": number, "xmax": number },
  "slots": [
    {
      "slot": number,
      "theme": "hero" | "lifestyle" | "specs_part_1" | "specs_part_2" | "colors" | "size_warranty",
      "title": string,
      "headline": string,
      "description": string,
      "features": string[]
    }
  ]
}`;

    const contentPayload: any[] = [
      {
        type: 'text',
        text: `Analyze this catalogue document (${fileName}) and return structured product information in JSON format:\n${extractedText ? `\nExtracted Text:\n${extractedText}\n` : ''}`,
      },
    ];

    if (catalogueImage) {
      const url =
        catalogueImage.startsWith('http://') ||
        catalogueImage.startsWith('https://') ||
        catalogueImage.startsWith('data:image/')
          ? catalogueImage
          : `data:image/jpeg;base64,${catalogueImage}`;
      contentPayload.push({
        type: 'image_url',
        image_url: { url },
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contentPayload },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI catalogue parsing error: ${errorText}`);
    }

    const completion = await response.json();
    let rawContent = completion.choices?.[0]?.message?.content || '{}';
    rawContent = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const resultJson = JSON.parse(rawContent);

    // Normalize keys in case model returned snake_case
    const rawProductName = resultJson.productName || resultJson.product_name || resultJson.title || '';
    const rawModelNumber = resultJson.modelNumber || resultJson.model_number || resultJson.sku || resultJson.model || '';
    const rawBrand = resultJson.brand || 'Sanford';
    const rawTagline = resultJson.tagline || resultJson.slogan || '';
    const rawDimensions = resultJson.dimensions || resultJson.dimension || '';
    const rawWeight = resultJson.weight || '';
    const rawWarranty = resultJson.warranty || '';
    const rawColors = resultJson.colors || resultJson.color || '';
    const rawWhatsInTheBox = Array.isArray(resultJson.whatsInTheBox)
      ? resultJson.whatsInTheBox
      : Array.isArray(resultJson.whats_in_the_box)
      ? resultJson.whats_in_the_box
      : [];
    const fullFeatures: string[] = Array.isArray(resultJson.fullFeatures)
      ? resultJson.fullFeatures
      : Array.isArray(resultJson.features)
      ? resultJson.features
      : [];

    resultJson.productName = rawProductName;
    resultJson.modelNumber = rawModelNumber;
    resultJson.brand = rawBrand;
    resultJson.tagline = rawTagline;
    resultJson.dimensions = rawDimensions;
    resultJson.weight = rawWeight;
    resultJson.warranty = rawWarranty;
    resultJson.colors = rawColors;
    resultJson.whatsInTheBox = rawWhatsInTheBox;
    resultJson.fullFeatures = fullFeatures;

    // Post-process to strictly enforce BuySanford 6-image rule compliance

    const cleanBrandModel = (t?: string): string => {
      if (!t) return '';
      return t
        .replace(/\bSanford\b/gi, '')
        .replace(/\b[A-Z]{2,4}\d{4,}[A-Z0-9]*\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Filter out brand names/model codes and deduplicate bullet points case-insensitively
    const seenFeatures = new Set<string>();
    const sanitizedFeatures = fullFeatures
      .map((f) => cleanBrandModel(f))
      .filter((f) => {
        if (f.length <= 2) return false;
        const key = f.toLowerCase();
        if (seenFeatures.has(key)) return false;
        seenFeatures.add(key);
        return true;
      });

    // Strictly partition specifications 50/50 between Slot 3 and Slot 4 (Zero overlap!)
    const half = Math.ceil(sanitizedFeatures.length / 2);
    const specsPart1 = sanitizedFeatures.slice(0, half);
    const specsPart2 = sanitizedFeatures.slice(half);

    const colorsStr = resultJson.colors ? String(resultJson.colors).trim() : '';
    const colorItems = colorsStr ? colorsStr.split(/[,;/]+/).map((s: string) => cleanBrandModel(s)).filter(Boolean) : [];
    const hasMultipleColors = colorItems.length > 1;

    const sizeWarrantyFeatures: string[] = [];
    if (resultJson.dimensions) sizeWarrantyFeatures.push(`Dimensions: ${resultJson.dimensions}`);
    if (resultJson.warranty) sizeWarrantyFeatures.push(resultJson.warranty);

    const cleanProductTitle = cleanBrandModel(resultJson.productName) || 'Product Overview';
    const cleanSeriesName = cleanBrandModel(resultJson.seriesName || '');
    const aiSlot3 = Array.isArray(resultJson.slots) ? resultJson.slots.find((s: any) => s?.slot === 3) : undefined;
    const aiSlot4 = Array.isArray(resultJson.slots) ? resultJson.slots.find((s: any) => s?.slot === 4) : undefined;
    const slot3Headline = cleanBrandModel(aiSlot3?.headline || '') || 'DESIGNED FOR EVERYDAY USE';
    const slot4Headline = cleanBrandModel(aiSlot4?.headline || '') || 'BUILT FOR PERFORMANCE & RELIABILITY';

    // Auto-suggest for Feature Highlight 1 & 2:
    // Slot 3 banner = strongest feature (sanitizedFeatures[0]), max 30 chars
    // Slot 4 banner = second strongest feature (sanitizedFeatures[1]), max 30 chars
    // Up to 2 supporting callouts each, taken only from verified specs, strictly no duplicates!
    const clampText = (str: string, maxLen: number) => {
      if (!str) return '';
      const clean = str.trim();
      if (clean.length <= maxLen) return clean;
      const sub = clean.slice(0, maxLen);
      const lastSpace = sub.lastIndexOf(' ');
      return (lastSpace > maxLen * 0.6 ? sub.slice(0, lastSpace) : sub).trim();
    };

    const s3Banner = clampText(cleanBrandModel(aiSlot3?.bannerFeature || '') || sanitizedFeatures[0] || '', 30);
    const s4Banner = clampText(cleanBrandModel(aiSlot4?.bannerFeature || '') || sanitizedFeatures[1] || '', 30);
    const s3Callout1 = clampText(cleanBrandModel(aiSlot3?.callout1 || '') || sanitizedFeatures[2] || '', 25);
    const s3Callout2 = clampText(cleanBrandModel(aiSlot3?.callout2 || '') || sanitizedFeatures[3] || '', 25);
    const s4Callout1 = clampText(cleanBrandModel(aiSlot4?.callout1 || '') || sanitizedFeatures[4] || '', 25);
    const s4Callout2 = clampText(cleanBrandModel(aiSlot4?.callout2 || '') || sanitizedFeatures[5] || '', 25);
    const s3TopHeadline = clampText(cleanBrandModel(aiSlot3?.topHeadline || ''), 40);
    const s4TopHeadline = clampText(cleanBrandModel(aiSlot4?.topHeadline || ''), 40);

    const strictSlots = [
      {
        slot: 1,
        theme: 'hero',
        title: 'Hero Studio View (White Background)',
        headline: '',
        description: 'Pure seamless white background (#FFFFFF) with studio softbox lighting and soft floor shadow. Strictly NO text, badges, or specs.',
        features: [],
      },
      {
        slot: 2,
        theme: 'lifestyle',
        title: 'Lifestyle In-Use (No Specs)',
        headline: cleanBrandModel(resultJson.tagline) || 'Built to Be Your Everyday Companion.',
        seriesName: cleanSeriesName,
        description: 'Exact BuySanford store template: Real person in-use scene, top-left solid red corner card with rounded corners, top-right series name (if filled), bottom-right discreet product caption.',
        features: [],
      },
      {
        slot: 3,
        theme: 'specs_part_1',
        title: 'Feature Highlight 1',
        headline: slot3Headline,
        bannerFeature: s3Banner,
        callout1: s3Callout1,
        callout2: s3Callout2,
        topHeadline: s3TopHeadline,
        promoBanner: s3Banner,
        seriesName: cleanSeriesName,
        description: 'buysanford.com single-feature focus: Dark atmospheric scene, full-width red bottom banner showing Feature 1 only, overlapping white circle with red ring and black icon, at most 2 supporting callouts.',
        features: specsPart1,
        excludedFeatures: specsPart2,
      },
      {
        slot: 4,
        theme: 'specs_part_2',
        title: 'Feature Highlight 2',
        headline: slot4Headline,
        bannerFeature: s4Banner,
        callout1: s4Callout1,
        callout2: s4Callout2,
        topHeadline: s4TopHeadline,
        promoBanner: s4Banner,
        seriesName: cleanSeriesName,
        description: 'buysanford.com single-feature focus: Dark atmospheric scene, full-width red bottom banner showing Feature 2 only, overlapping white circle with red ring and black icon, at most 2 supporting callouts.',
        features: specsPart2,
        excludedFeatures: specsPart1,
      },
      {
        slot: 5,
        theme: 'colors',
        title: 'Available Colour Models Only',
        headline: hasMultipleColors ? 'Available Colors' : '',
        promoBanner: hasMultipleColors ? 'Available in Multiple Attractive Colors' : '',
        description: hasMultipleColors
          ? 'Product lineup in available color finishes; full-width solid red bottom promotional banner with white typography. Strictly NO brand name and NO model number.'
          : 'Single color product — Slot 5 is skipped because there are no multiple colour options.',
        features: colorItems,
      },
      {
        slot: 6,
        theme: 'size_warranty',
        title: 'Unit Dimension & Warranty Only',
        headline: 'Unit Dimension',
        description: 'Exact BuySanford style: Pale warm pastel background, "Unit Dimension" header in top left, red/navy 1-Year Warranty ribbon badge in top right, crimson red double-ended arrows (<--->) for height/width/depth. Strictly NO weight, NO box contents, NO brand name, and NO model number.',
        features: sizeWarrantyFeatures,
      },
    ];

    resultJson.seriesName = cleanSeriesName;
    resultJson.fullFeatures = sanitizedFeatures;
    resultJson.colors = colorsStr;
    resultJson.hasMultipleColors = hasMultipleColors;
    resultJson.slots = strictSlots;

    return res.status(200).json(resultJson);
  } catch (err: any) {
    console.error('Error in parse-catalogue:', err);
    return res.status(500).json({
      error: err.message || 'Failed to parse catalogue.',
    });
  }
}

