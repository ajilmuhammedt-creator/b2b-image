import type { IncomingMessage, ServerResponse } from 'http';
import { supabaseAdmin } from './_lib/supabase-server.js';
import { requireUser } from './_lib/requireUser.js';

interface RequestBody {
  productName?: string;
  features?: string[];
}

export default async function handler(req: any, res: any) {
  // Enable CORS
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
    // Read body if string
    let body: RequestBody = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { productName = 'Product', features = [] } = body || {};

    if (!Array.isArray(features) || features.length === 0) {
      return res.status(400).json({ error: 'features must be a non-empty array' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return res.status(200).json({ groups: fallbackSplit(features, 5) });
    }

    const prompt = `You are an expert e-commerce product marketer.
Given this product and list of verified features, divide them into exactly 5 logical, balanced groups for 5 sequential product feature images.
Product: "${productName}"
Features:
${features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Rules:
1. Return exactly 5 groups of features.
2. Every original feature must be represented without hallucinating new technical specs.
3. Each group should focus on a distinct selling point (e.g. Performance/Motor, Battery/Charging, Convenience/Design, Build/Materials, Accessories/Options).
4. Output MUST be valid JSON matching this schema:
{
  "groups": [
    ["feature 1", "feature 2"],
    ["feature 3"],
    ...
  ]
}`;

    const completionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!completionRes.ok) {
      console.warn('OpenAI split-features request failed, falling back to round-robin');
      return res.status(200).json({ groups: fallbackSplit(features, 5) });
    }

    const completionData = await completionRes.json();
    const content = completionData.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');

    if (Array.isArray(parsed.groups) && parsed.groups.length === 5) {
      return res.status(200).json({ groups: parsed.groups });
    }

    return res.status(200).json({ groups: fallbackSplit(features, 5) });
  } catch (err: any) {
    console.error('Error in split-features:', err);
    const body: RequestBody = req.body || {};
    return res.status(200).json({ groups: fallbackSplit(body.features || [], 5) });
  }
}

function fallbackSplit(items: string[], groupCount: number = 5): string[][] {
  const cleanItems = items.filter((item) => item && item.trim().length > 0);
  if (cleanItems.length === 0) {
    return Array.from({ length: groupCount }, () => []);
  }

  const groups: string[][] = Array.from({ length: groupCount }, () => []);
  cleanItems.forEach((item, index) => {
    groups[index % groupCount].push(item);
  });

  return groups;
}
