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
      * Description: Realistic everyday in-use scene (person holding/wearing product).
      * STRICT: Slogan/tagline headline only. STRICTLY NO product specifications or technical data.
      * features: []
    - Slot 3: theme "specs_part_1", title "Specifications — Part 1"
      * Description: Core specifications (e.g. cooling function, speed levels, power/motor) drawn directly from catalogue.
      * features: [First half of verified specifications from catalogue]
    - Slot 4: theme "specs_part_2", title "Specifications — Part 2 (Non-Overlapping)"
      * Description: Remaining specifications (e.g. battery capacity, digital LED display, charging port).
      * STRICT: MUST NOT repeat or duplicate any specification from Slot 3. Mutually exclusive.
      * features: [Second half of verified specifications from catalogue]
    - Slot 5: theme "colors", title "Available Colour Models Only"
      * Description: Product lineup / swatches showing all available color models.
      * STRICT: Show ONLY available color models. STRICTLY NO technical specifications.
      * features: [List of available color options]
    - Slot 6: theme "size_warranty", title "Product Size & Warranty Only"
      * Description: Dimensional measurements (height, width, depth, weight) and official Warranty badge (e.g. "1 Year Service Warranty").
      * STRICT: Show ONLY product size, dimensions, weight, and warranty badge. STRICTLY NO other product specifications.
      * features: [Dimension string, Weight string, Warranty string]

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

    // Strictly partition specifications 50/50 between Slot 3 and Slot 4 (Zero overlap!)
    const half = Math.ceil(fullFeatures.length / 2);
    const specsPart1 = fullFeatures.slice(0, half);
    const specsPart2 = fullFeatures.slice(half);

    const colorsStr = resultJson.colors || 'Graphite Black, Arctic White, Slate Grey';
    const colorItems = colorsStr.split(/[,;/]+/).map((s: string) => s.trim()).filter(Boolean);

    const sizeWarrantyFeatures: string[] = [];
    if (resultJson.dimensions) sizeWarrantyFeatures.push(`Dimensions: ${resultJson.dimensions}`);
    if (resultJson.weight) sizeWarrantyFeatures.push(`Weight: ${resultJson.weight}`);
    if (resultJson.warranty) sizeWarrantyFeatures.push(resultJson.warranty);
    if (sizeWarrantyFeatures.length === 0) sizeWarrantyFeatures.push('1 Year Service Warranty');

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
        headline: resultJson.tagline || 'The Smartest Breeze!',
        description: 'Realistic everyday scene of person holding/using product. Strictly NO product specifications or technical data.',
        features: [],
      },
      {
        slot: 3,
        theme: 'specs_part_1',
        title: 'Specifications — Part 1',
        headline: specsPart1[0] || 'Core Specifications',
        description: 'First distinct group of verified product specifications from the catalogue.',
        features: specsPart1,
      },
      {
        slot: 4,
        theme: 'specs_part_2',
        title: 'Specifications — Part 2 (Non-Overlapping)',
        headline: specsPart2[0] || 'Power & Display Specifications',
        description: 'Second distinct group of verified specifications. Strictly non-overlapping with Slot 3.',
        features: specsPart2,
      },
      {
        slot: 5,
        theme: 'colors',
        title: 'Available Colour Models Only',
        headline: 'Available Colors',
        description: 'Product lineup showing available color finishes. Strictly NO technical specifications.',
        features: colorItems.length > 0 ? colorItems : ['Standard Color Variants'],
      },
      {
        slot: 6,
        theme: 'size_warranty',
        title: 'Product Size & Warranty Only',
        headline: 'Dimensions & Warranty',
        description: 'Dimensional measurement diagram (height, width, depth, weight) and official 1-Year Warranty badge. Strictly NO other specs.',
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

