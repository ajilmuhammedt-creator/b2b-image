import crypto from 'crypto';
import { supabaseAdmin } from './_lib/supabase-server';
import { requireUser } from './_lib/requireUser';
import { buildFeaturePrompt, buildPosterPrompt, buildSanfordSlotPrompt } from './_lib/prompts';

export const config = {
  maxDuration: 300,
};

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Authenticate user
  const user = await requireUser(req, res);
  if (!user) return;
  const userId = user.id;

  const generationId = crypto.randomUUID();

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const {
      projectId = crypto.randomUUID(),
      kind = 'feature',
      slot = 1,
      productName = 'Product',
      modelNumber = '',
      brand = 'Sanford',
      fullFeatures = [],
      featureGroup = [],
      colors = '',
      sourceImagePath,
      sourceImageDataUrl,
      styleRefPath,
      sanfordSlot,
      settings = {},
    } = body || {};

    // 2. Project ownership verification: project's user_id must match verified user id
    if (projectId) {
      try {
        const { data: project } = await supabaseAdmin
          .from('projects')
          .select('user_id')
          .eq('id', projectId)
          .maybeSingle();

        if (project && project.user_id && project.user_id !== userId) {
          return res.status(403).json({ error: 'Forbidden: You do not have permission for this project.' });
        }
      } catch (projErr) {
        // Table might not exist or be queried yet
      }
    }

    // 3. Daily generation limit: max 100 generations per 24 hours
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: dailyCount, error: countErr } = await supabaseAdmin
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', twentyFourHoursAgo);

      if (!countErr && dailyCount !== null && dailyCount >= 100) {
        return res.status(429).json({
          error: 'Daily generation limit reached: Maximum 100 image generations allowed per 24 hours.',
        });
      }
    } catch (limitErr) {
      // Allow generation if limit count fails
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
    }

    // 1. Prepare Reference Image Buffer
    let imageBuffer: Buffer | null = null;

    if (sourceImageDataUrl && sourceImageDataUrl.includes('base64,')) {
      const base64Data = sourceImageDataUrl.split('base64,')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else if (sourceImagePath) {
      // Try downloading from Supabase storage
      try {
        const { data, error } = await supabaseAdmin.storage
          .from('source-images')
          .download(sourceImagePath);

        if (!error && data) {
          const arrayBuffer = await data.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
        }
      } catch (dlErr) {
        console.warn('Could not download image from Supabase storage:', dlErr);
      }

      // If that failed and sourceImagePath is a full URL, fetch it
      if (!imageBuffer && (sourceImagePath.startsWith('http://') || sourceImagePath.startsWith('https://'))) {
        const imgFetch = await fetch(sourceImagePath);
        if (imgFetch.ok) {
          const ab = await imgFetch.arrayBuffer();
          imageBuffer = Buffer.from(ab);
        }
      }
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({
        error: 'Product photograph is required. Please provide a valid sourceImagePath or sourceImageDataUrl.',
      });
    }

    // 2. Build the exact prompt based on kind
    const selectedModel = settings.model || 'gpt-image-2.5-sunburst';
    const selectedQuality = settings.quality || 'medium';
    const selectedSize = kind === 'poster'
      ? (settings.posterSize || '1024x1536')
      : (settings.featureSize || '1024x1024');

    let prompt = '';
    if (kind === 'poster') {
      prompt = buildPosterPrompt({
        productName,
        fullFeatures,
        colors,
        accentColor: settings.accentColor,
        background: settings.background,
      });
    } else if (sanfordSlot && sanfordSlot.theme) {
      const isSizeWarranty = sanfordSlot.theme === 'size_warranty' || sanfordSlot.slot === 6;
      prompt = buildSanfordSlotPrompt({
        productName,
        brand,
        modelNumber,
        theme: sanfordSlot.theme,
        slotTitle: sanfordSlot.title || `Image ${slot}`,
        headline: sanfordSlot.headline,
        promoBanner: sanfordSlot.promoBanner,
        features: sanfordSlot.features && sanfordSlot.features.length > 0 ? sanfordSlot.features : featureGroup,
        dimensions: sanfordSlot.dimensions,
        weight: isSizeWarranty ? undefined : sanfordSlot.weight,
        whatsInTheBox: isSizeWarranty ? undefined : sanfordSlot.whatsInTheBox,
        warranty: sanfordSlot.warranty,
        colors,
        accentColor: settings.accentColor,
        background: settings.background,
      });
    } else {
      prompt = buildFeaturePrompt({
        productName,
        fullFeatures,
        selectedFeatureGroup: featureGroup,
        slot: slot || 1,
        accentColor: settings.accentColor,
        background: settings.background,
      });
    }

    // 3. Optional Style Reference for Style Lock
    let styleRefBuffer: Buffer | null = null;
    if (settings.styleLock && slot > 1 && styleRefPath) {
      try {
        const { data: styleData } = await supabaseAdmin.storage
          .from('generated-images')
          .download(styleRefPath);
        if (styleData) {
          styleRefBuffer = Buffer.from(await styleData.arrayBuffer());
        }
      } catch (styleErr) {
        console.warn('Style ref download failed:', styleErr);
      }
    }

    // 4. Call OpenAI Images Edit API with retry
    const hashedUserId = crypto.createHash('sha256').update(userId).digest('hex');

    const callOpenAi = async (): Promise<any> => {
      const form = new FormData();
      const imageBlob = new Blob([imageBuffer!], { type: 'image/png' });
      form.append('image', imageBlob, 'product.png');

      if (styleRefBuffer) {
        const styleBlob = new Blob([styleRefBuffer], { type: 'image/png' });
        form.append('image', styleBlob, 'style_reference.png');
      }

      form.append('model', selectedModel);
      form.append('prompt', prompt);
      form.append('size', selectedSize);
      form.append('quality', selectedQuality);
      form.append('output_format', 'png');
      form.append('n', '1');
      form.append('safety_identifier', hashedUserId);

      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: form,
      });

      if (!response.ok) {
        const errText = await response.text();
        let parsedErr: any;
        try {
          parsedErr = JSON.parse(errText);
        } catch {
          parsedErr = { message: errText };
        }
        const error: any = new Error(parsedErr.error?.message || parsedErr.message || `OpenAI error ${response.status}`);
        error.status = response.status;
        error.data = parsedErr;
        throw error;
      }

      return await response.json();
    };

    let result: any;
    try {
      result = await callOpenAi();
    } catch (firstErr: any) {
      // Step 8 in plan: Retry once after 3s on 429 or 5xx
      if (firstErr.status === 429 || (firstErr.status && firstErr.status >= 500)) {
        console.log(`Received status ${firstErr.status}, retrying OpenAI request in 3s...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        result = await callOpenAi();
      } else {
        throw firstErr;
      }
    }

    const b64Json = result.data?.[0]?.b64_json;
    if (!b64Json) {
      throw new Error('OpenAI did not return image data.');
    }

    const pngBuffer = Buffer.from(b64Json, 'base64');
    const imagePath = `${userId}/${projectId}/${generationId}.png`;

    // 5. Upload to Supabase Storage: generated-images
    let publicUrl = '';
    try {
      const { error: uploadError } = await supabaseAdmin.storage
        .from('generated-images')
        .upload(imagePath, pngBuffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) {
        console.warn('Storage upload error:', uploadError.message);
      }

      // Get public URL or signed URL
      const { data: urlData } = supabaseAdmin.storage
        .from('generated-images')
        .getPublicUrl(imagePath);

      publicUrl = urlData?.publicUrl || '';
    } catch (storageErr) {
      console.warn('Supabase storage upload error:', storageErr);
    }

    // Fallback URL if public URL not accessible
    const dataUrl = `data:image/png;base64,${b64Json}`;
    const effectiveUrl = publicUrl || dataUrl;

    // 6. Record row in generations table if available
    try {
      await supabaseAdmin.from('generations').insert({
        id: generationId,
        project_id: projectId,
        user_id: userId,
        kind,
        slot: kind === 'poster' ? null : slot,
        model: selectedModel,
        quality: selectedQuality,
        size: selectedSize,
        settings,
        prompt,
        status: 'done',
        image_path: imagePath,
        usage: result.usage || null,
      });
    } catch (dbErr) {
      console.warn('Could not save to generations table (table might not exist yet):', dbErr);
    }

    return res.status(200).json({
      id: generationId,
      projectId,
      kind,
      slot: kind === 'poster' ? null : slot,
      imagePath,
      imageUrl: effectiveUrl,
      b64_json: b64Json,
      prompt,
      usage: result.usage || null,
      model: selectedModel,
      size: selectedSize,
    });
  } catch (err: any) {
    console.error('Error generating image:', err);
    return res.status(err.status || 500).json({
      id: generationId,
      error: err.message || 'An error occurred while generating the image.',
      details: err.data || null,
    });
  }
}
