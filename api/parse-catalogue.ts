import crypto from 'crypto';

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

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { catalogueImage, extractedText = '', fileName = 'catalogue.pdf' } = body || {};

    if (!catalogueImage && !extractedText) {
      return res.status(400).json({ error: 'Catalogue image or text is required.' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
    }

    const systemPrompt = `You are an elite e-commerce creative director specializing in high-converting product listings for electronics and appliances, patterned exactly after BuySanford e-commerce product pages (e.g., https://www.buysanford.com/products/sanford-camping-emergency-lantern-sf2722el).

TYPOGRAPHY MANDATE (CRITICAL):
All text, headlines, labels, badges, dimension callouts, and promotional banner messages rendered on the generated images MUST strictly use the "Sharp Sans" font family (geometric, clean contemporary sans-serif with circular letterforms and sharp modern apexes). No other fonts are permitted.

You are given a supplier product catalogue sheet (as an image and/or extracted text).
Analyze all visual and textual elements carefully.

Extract the following in strictly structured JSON:
1. "productName": Complete product commercial title (e.g. "Sanford SF6671HFN Rechargeable Cooling Hand Fan")
2. "modelNumber": Model code (e.g. "SF6671HFN")
3. "brand": Brand name (e.g. "Sanford")
4. "tagline": The main marketing headline or slogan from the sheet (e.g. "The Smartest Breeze!")
5. "fullFeatures": An array of all verified bullet-point specifications and technical claims on the sheet (wattage, battery capacity, speeds, folding angles, display details, charging port, etc.).
6. "dimensions": Unit and package dimensions if present (e.g. "78mm x 197mm x 57mm")
7. "weight": Unit weight and package weight (e.g. "Unit 225g, Package 305g")
8. "whatsInTheBox": Array of items included (e.g. ["Hand Fan", "Type-C USB Cable", "User Manual"])
9. "warranty": Warranty statement if shown (e.g. "1 Year Service Warranty")
10. "colors": Color options or finishes (e.g. "Graphite Black, Arctic White, Slate Grey")
11. "cropBox": Normalized bounding box [ymin, xmin, ymax, xmax] (values 0.0 to 1.0) of the primary hero product image on this catalogue sheet.
12. "slots": Exactly 6 slots matching the STRICT BuySanford 6-image e-commerce rules:
    - Slot 1: theme "hero", title "Hero Studio View (White Background)"
      * Description: Pure white background (#FFFFFF), studio softbox lighting, soft floor shadow.
      * STRICT: NO text, NO numbers, NO specifications, NO badges.
      * features: []
    - Slot 2: theme "lifestyle", title "Lifestyle In-Use (No Specs)"
      * Description: Exact BuySanford lifestyle template. In top-right corner, a solid RED badge (#E53935) with rounded bottom-left corner containing white Sharp Sans text (e.g. 'Refreshing Airflow In Every Spin!'). ZERO floating text across the image. A person naturally sitting at a desk with laptop and the product fan.
      * headline: Short 2-4 word lifestyle tagline (e.g. "Refreshing Airflow In Every Spin!")
      * STRICT: Slogan/tagline headline only. STRICTLY NO product specifications or technical data.
      * features: []
    - Slot 3: theme "specs_part_1", title "Specifications — Part 1"
      * Description: Core specifications (e.g. cooling function, speed levels, power/motor) drawn directly from catalogue.
      * Icon Style (Upper Left): Red circular icon badges (#E53935), white minimalist symbols, bold short feature descriptions, and fine horizontal divider lines.
      * Upper-Right Slogan: An uppercase lifestyle/usage context slogan (e.g. "SUITABLE FOR OUTDOOR CAMPING" or "SUITABLE FOR OUTDOOR & INDOOR USE"). NEVER repeat any technical spec here.
      * Bottom Banner: Full-width solid red promotional strip with large white typography (e.g. "4\" Table Fan with LED" or product title).
      * promoBanner: Primary product benefit headline (e.g. "Rechargeable Cooling Hand Fan with Cold Plate")
      * STRICT DEDUPLICATION: Do NOT repeat any feature from the left badges as the headline or in the banner.
      * features: [First half of verified specifications from catalogue]
    - Slot 4: theme "specs_part_2", title "Specifications — Part 2 (Non-Overlapping)"
      * Description: Remaining specifications (e.g. battery capacity, digital LED display, charging port).
      * Icon Style (Upper Left): Red circular icon badges (#E53935), white minimalist symbols, bold short feature descriptions, and fine horizontal divider lines.
      * Upper-Right Slogan: An uppercase lifestyle/usage context slogan (e.g. "PORTABLE, POWERFUL, PEACEFUL, STAY COOL EVERYWHERE"). NEVER repeat any technical spec here.
      * Bottom Banner: Full-width solid red promotional strip with large white typography (e.g. "Light Weight and Easy to Carry").
      * promoBanner: Power and convenience benefit headline (e.g. "Light Weight and Easy to Carry")
      * STRICT DEDUPLICATION: MUST NOT repeat or duplicate any specification from Slot 3. Mutually exclusive. Do NOT repeat any feature from the left badges as the headline or banner.
      * features: [Second half of verified specifications from catalogue]
    - Slot 5: theme "colors", title "Available Colour Models Only"
      * Description: Product lineup / swatches showing all available color models.
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
        text: `Analyze this catalogue document (${fileName}):\n${extractedText ? `\nExtracted Text:\n${extractedText}\n` : ''}`,
      },
    ];

    if (catalogueImage && catalogueImage.startsWith('data:image/')) {
      contentPayload.push({
        type: 'image_url',
        image_url: { url: catalogueImage },
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
    const resultJson = JSON.parse(completion.choices?.[0]?.message?.content || '{}');

    // Post-process to strictly enforce BuySanford 6-image rule compliance
    const fullFeatures: string[] = Array.isArray(resultJson.fullFeatures) ? resultJson.fullFeatures : [];

    const cleanBrandModel = (t?: string): string => {
      if (!t) return '';
      return t
        .replace(/\bSanford\b/gi, '')
        .replace(/\b[A-Z]{2,4}\d{4,}[A-Z0-9]*\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Filter out brand names or model codes from bullet points so they never appear on images
    const sanitizedFeatures = fullFeatures
      .map((f) => cleanBrandModel(f))
      .filter((f) => f.length > 2);

    // Strictly partition specifications 50/50 between Slot 3 and Slot 4 (Zero overlap!)
    const half = Math.ceil(sanitizedFeatures.length / 2);
    const specsPart1 = sanitizedFeatures.slice(0, half);
    const specsPart2 = sanitizedFeatures.slice(half);

    const colorsStr = resultJson.colors || 'Graphite Black, Arctic White, Slate Grey';
    const colorItems = colorsStr.split(/[,;/]+/).map((s: string) => cleanBrandModel(s)).filter(Boolean);

    const sizeWarrantyFeatures: string[] = [];
    if (resultJson.dimensions) sizeWarrantyFeatures.push(`Dimensions: ${resultJson.dimensions}`);
    if (resultJson.warranty) sizeWarrantyFeatures.push(resultJson.warranty);
    if (sizeWarrantyFeatures.length === 0) sizeWarrantyFeatures.push('1 Year Service Warranty');

    const slot3Promo = cleanBrandModel(resultJson.productName) || 'Rechargeable Cooling Hand Fan with Cold Plate';

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
        headline: cleanBrandModel(resultJson.tagline) || 'Refreshing Airflow In Every Spin!',
        description: 'Exact BuySanford lifestyle template: Person at desk with fan, top-right solid red corner badge with rounded corner containing white Sharp Sans text. Strictly NO floating text and NO specs.',
        features: [],
      },
      {
        slot: 3,
        theme: 'specs_part_1',
        title: 'Specifications — Part 1',
        headline: 'SUITABLE FOR OUTDOOR & INDOOR USE',
        promoBanner: slot3Promo,
        description: 'Upper-left red circular icon badges with white symbols & divider lines; upper-right usage slogan; full-width solid red bottom promotional banner. Zero duplication of features.',
        features: specsPart1,
      },
      {
        slot: 4,
        theme: 'specs_part_2',
        title: 'Specifications — Part 2 (Non-Overlapping)',
        headline: 'PORTABLE, POWERFUL, PEACEFUL, STAY COOL EVERYWHERE',
        promoBanner: 'Light Weight and Easy to Carry',
        description: 'Upper-left red circular icon badges with white symbols & divider lines; upper-right usage slogan; full-width solid red bottom promotional banner. Zero duplication of features.',
        features: specsPart2,
      },
      {
        slot: 5,
        theme: 'colors',
        title: 'Available Colour Models Only',
        headline: 'Available Colors',
        promoBanner: 'Available in Multiple Attractive Colors',
        description: 'Product lineup in available color finishes; full-width solid red bottom promotional banner with white typography. Strictly NO brand name and NO model number.',
        features: colorItems.length > 0 ? colorItems : ['Standard Color Variants'],
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

    resultJson.slots = strictSlots;

    return res.status(200).json(resultJson);
  } catch (err: any) {
    console.error('Error in parse-catalogue:', err);
    return res.status(500).json({
      error: err.message || 'Failed to parse catalogue.',
    });
  }
}

