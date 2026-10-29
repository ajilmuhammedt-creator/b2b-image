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

    const systemPrompt = `You are an elite e-commerce creative director specializing in high-converting product listings for electronics and appliances, patterned exactly after Sanford e-commerce product pages (e.g., https://www.buysanford.com/products/sanford-camping-emergency-lantern-sf2722el).

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
10. "colors": Color options or finishes (e.g. "Black, Slate Grey")
11. "cropBox": Normalized bounding box [ymin, xmin, ymax, xmax] (values 0.0 to 1.0) of the primary hero product image on this catalogue sheet.
12. "slots": Exactly 6 slots matching the Sanford 6-image e-commerce pattern:
    - Slot 1: theme "hero", title "Hero Studio View" (pure isolated product on white background, subtle contact floor shadow)
    - Slot 2: theme "lifestyle", title "Lifestyle & In-Use" (realistic setting with user wearing/holding it, bold marketing headline)
    - Slot 3: theme "technical", title "Core Tech & Airflow" (refrigerated cooling cold-plate, 100-level stepless wind speed)
    - Slot 4: theme "battery_display", title "Battery & Smart Digital Display" (3600mAh battery life, smart digital readout showing speed & battery %, Type-C charging)
    - Slot 5: theme "flexibility", title "90° Rotation & Hands-Free Wear" (90° folding head, lanyard wearable, loop desktop stand)
    - Slot 6: theme "infographic", title "Dimensions, In-The-Box & Warranty" (unit dimension lines, box contents icons, 1-year warranty seal)

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
      "theme": "hero" | "lifestyle" | "technical" | "battery_display" | "flexibility" | "infographic",
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

    return res.status(200).json(resultJson);
  } catch (err: any) {
    console.error('Error in parse-catalogue:', err);
    return res.status(500).json({
      error: err.message || 'Failed to parse catalogue.',
    });
  }
}
