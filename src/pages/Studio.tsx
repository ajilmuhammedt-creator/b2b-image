import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProductInput } from '../components/ProductInput';
import { ResultsGrid } from '../components/ResultsGrid';
import { SettingsPanel } from '../components/SettingsPanel';
import { PlatformSelectModal } from '../components/PlatformSelectModal';
import { evaluateAmazonCompliance } from '../lib/amazonCompliance';
import { evaluateNoonCompliance } from '../lib/noonCompliance';
import { projectStorage } from '../lib/projectStorage';
import { fetchApi } from '../lib/apiClient';
import type {
  GenerationItem,
  ProjectData,
  StudioSettings,
  SanfordSlotSpec,
  CatalogueParsedData,
  EcommercePlatform,
} from '../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const DEFAULT_SHOPIFY_SLOTS: SanfordSlotSpec[] = [
  {
    slot: 1,
    theme: 'hero',
    title: 'Hero Studio View (White Background)',
    headline: '',
    description: 'Pure seamless white background (#FFFFFF) with studio lighting and soft floor shadow. Strictly NO text or specs.',
    features: [],
  },
  {
    slot: 2,
    theme: 'lifestyle',
    title: 'Lifestyle In-Use (No Specs)',
    headline: '',
    description: 'Exact BuySanford lifestyle template: Person at desk with fan, top-right solid red corner badge with rounded corner containing white Sharp Sans text. Strictly NO floating text and NO specs.',
    features: [],
  },
  {
    slot: 3,
    theme: 'specs_part_1',
    title: 'Specifications — Part 1',
    headline: '',
    promoBanner: '',
    description: 'Upper-left red circular icon badges with white symbols & divider lines; upper-right usage slogan; full-width solid red bottom promotional banner in Sharp Sans font. Zero feature duplicates.',
    features: [],
  },
  {
    slot: 4,
    theme: 'specs_part_2',
    title: 'Specifications — Part 2 (Non-Overlapping)',
    headline: '',
    promoBanner: '',
    description: 'Upper-left red circular icon badges with white symbols & divider lines; upper-right usage slogan; full-width solid red bottom promotional banner in Sharp Sans font. Zero feature duplicates.',
    features: [],
  },
  {
    slot: 5,
    theme: 'colors',
    title: 'Available Colour Models Only',
    headline: '',
    promoBanner: '',
    description: 'Product lineup in available color finishes; full-width solid red bottom promotional banner with white typography.',
    features: [],
  },
  {
    slot: 6,
    theme: 'size_warranty',
    title: 'Unit Dimension & Warranty Only',
    headline: '',
    description: 'Exact BuySanford style: Pale warm pastel background, "Unit Dimension" header in top left, red/navy 1-Year Warranty ribbon badge in top right, crimson red double-ended arrows (<--->) for height/width/depth. Strictly NO weight, NO box contents.',
    features: [],
  },
];

export const DEFAULT_AMAZON_SLOTS: SanfordSlotSpec[] = [
  {
    slot: 1,
    theme: 'hero',
    title: 'IMAGE 01 · MAIN Product Hero',
    headline: '',
    description: 'Amazon MAIN Listing Standard: Pure white (#FFFFFF), product occupies 85–90% of frame, balanced studio softbox lighting. Strictly ZERO text, ZERO badges, ZERO props.',
    features: [],
  },
  {
    slot: 2,
    theme: 'lifestyle',
    title: 'IMAGE 02 · Premium Lifestyle In-Use',
    headline: '',
    description: 'Photorealistic commercial setting (kitchen, vanity, bedroom, or living space). Product as primary hero with soft blur. Strict Amazon rule: ZERO text or badge overlays.',
    features: [],
  },
  {
    slot: 3,
    theme: 'specs_part_1',
    title: 'IMAGE 03 · Primary Features Infographic',
    headline: '',
    promoBanner: '',
    description: 'Top 3–4 verified features, vibrant red circular badges, Sharp Sans typography, full-width red benefits banner at bottom. Zero duplication.',
    features: [],
  },
  {
    slot: 4,
    theme: 'specs_part_2',
    title: 'IMAGE 04 · Secondary Features Infographic',
    headline: '',
    promoBanner: '',
    description: 'Secondary verified features, matching red circular badge design system, alternative product perspective, full-width red benefits banner.',
    features: [],
  },
  {
    slot: 5,
    theme: 'colors',
    title: 'IMAGE 05 · Available Colour Options',
    headline: '',
    promoBanner: '',
    description: 'Multi-color product lineup on clean white background. Shows only verified catalog colors with matching bottom banner. Auto-skipped if single color.',
    features: [],
  },
  {
    slot: 6,
    theme: 'size_warranty',
    title: 'IMAGE 06 · Dimensions & Warranty',
    headline: '',
    description: 'Accurate technical dimension arrows (<----->) for Height, Width, Depth in mm/cm plus official warranty seal. Strictly NO weight, NO box contents.',
    features: [],
  },
];

export const DEFAULT_AMAZON_APLUS_SLOTS: SanfordSlotSpec[] = [
  {
    slot: 1,
    theme: 'aplus_standard_banner',
    title: 'A+ 01 · Standard Brand Banner',
    headline: '',
    description: '970 × 300 px panoramic header banner establishing brand prestige and flagship product category.',
    features: [],
    aplusType: 'standard_banner_970x300',
  },
  {
    slot: 2,
    theme: 'aplus_premium_banner',
    title: 'A+ 02 · Premium Brand Story Hero',
    headline: '',
    description: '1464 × 600 px high-impact ultra-wide lifestyle composition highlighting engineering and craftsmanship.',
    features: [],
    aplusType: 'premium_banner_1464x600',
  },
  {
    slot: 3,
    theme: 'aplus_comparison',
    title: 'A+ 03 · Technical Comparison Matrix',
    headline: '',
    description: '970 × 600 px structured specification and model comparison chart with clean technical metrics.',
    features: [],
    aplusType: 'technical_deepdive_970x600',
  },
  {
    slot: 4,
    theme: 'aplus_triple_card',
    title: 'A+ 04 · Feature Deep-Dive Cards',
    headline: '',
    description: '300 × 300 px modular square cards breaking down 3 critical product technologies with icon callouts.',
    features: [],
    aplusType: 'triple_card_300x300',
  },
];

export const DEFAULT_NOON_SLOTS: SanfordSlotSpec[] = [
  {
    slot: 1,
    theme: 'noon_front',
    title: 'IMAGE 01 · Primary Front View (Pure White)',
    headline: '',
    description: 'Noon Primary Listing Standard: Direct front view, pure white (#FFFFFF), balanced margins (75–80% fill). Zero text, zero badges, zero packaging.',
    features: [],
  },
  {
    slot: 2,
    theme: 'noon_back',
    title: 'IMAGE 02 · Back View (Rear Photography)',
    headline: '',
    description: 'Actual rear product view on pure white. Visible ventilation grilles, power cord socket, and authentic rear switches. Strictly zero text.',
    features: [],
  },
  {
    slot: 3,
    theme: 'noon_side',
    title: 'IMAGE 03 · Side View (Product Profile)',
    headline: '',
    description: 'Clean 90° profile view communicating true thickness, depth, buttons, and handles with crisp product silhouette. Zero text.',
    features: [],
  },
  {
    slot: 4,
    theme: 'noon_angle',
    title: 'IMAGE 04 · Three-Quarter Perspective',
    headline: '',
    description: 'Commercial 3/4 perspective displaying volumetric depth, front face, and side form simultaneously with softbox lighting. Zero text.',
    features: [],
  },
  {
    slot: 5,
    theme: 'noon_detail',
    title: 'IMAGE 05 · Product Detail (Close-Up)',
    headline: '',
    description: 'Macro close-up highlighting key functional controls (LED panel, temperature dial, heating element, or stainless finish). Zero text.',
    features: [],
  },
  {
    slot: 6,
    theme: 'noon_lifestyle',
    title: 'IMAGE 06 · Realistic Lifestyle In-Use',
    headline: '',
    description: 'Photorealistic commercial photography in authentic home setting (kitchen, vanity, living room). Accurate scale. Strictly zero text.',
    features: [],
  },
];

export const DEFAULT_NOON_APLUS_SLOTS: SanfordSlotSpec[] = [
  {
    slot: 1,
    theme: 'noon_aplus_intro',
    title: 'Noon A+ 01 · Product Introduction Banner',
    headline: '',
    description: '2400 × 1000 px panoramic branded hero banner presenting the product in an architectural lifestyle environment.',
    features: [],
    noonAplusType: 'intro_banner_2400x1000',
  },
  {
    slot: 2,
    theme: 'noon_aplus_features',
    title: 'Noon A+ 02 · Primary Features Infographic',
    headline: '',
    description: '2400 × 1200 px layout displaying 3–4 key verified specifications with red circular badges and full-width red bottom benefits banner.',
    features: [],
    noonAplusType: 'primary_features_2400x1200',
  },
  {
    slot: 3,
    theme: 'noon_aplus_details',
    title: 'Noon A+ 03 · Additional Features Deep-Dive',
    headline: '',
    description: '2400 × 1200 px engineering detail breakdown with secondary verified specifications, red icon badges, and red bottom banner.',
    features: [],
    noonAplusType: 'additional_features_2400x1200',
  },
  {
    slot: 4,
    theme: 'noon_aplus_lifestyle',
    title: 'Noon A+ 04 · Product Lifestyle Story',
    headline: '',
    description: '2400 × 1000 px expansive lifestyle photography showcasing the appliance in an upscale modern residence with minimal benefit statement.',
    features: [],
    noonAplusType: 'lifestyle_banner_2400x1000',
  },
  {
    slot: 5,
    theme: 'noon_aplus_dimensions',
    title: 'Noon A+ 05 · Product Dimensions Spec',
    headline: '',
    description: '2400 × 1200 px clean dimensional diagram with crimson measurement arrows (<----->) in mm/cm. Strictly NO warranty graphics per Noon.',
    features: [],
    noonAplusType: 'dimensions_2400x1200',
  },
  {
    slot: 6,
    theme: 'noon_aplus_colors',
    title: 'Noon A+ 06 · Available Colour Finishes',
    headline: '',
    description: '2400 × 1000 px multi-unit lineup exhibiting verified catalog colour finishes. (Auto-skipped if single colour).',
    features: [],
    noonAplusType: 'colors_2400x1000',
  },
];

export function Studio() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('project');

  const userId = user?.id || '';

  // Project state - starts completely blank until a catalogue is uploaded
  const [projectId, setProjectId] = useState<string>(() => crypto.randomUUID());
  const [platform, setPlatform] = useState<EcommercePlatform | null>(null);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [brand, setBrand] = useState('Sanford');
  const [tagline, setTagline] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [colors, setColors] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');
  const [whatsInTheBox, setWhatsInTheBox] = useState<string[]>([]);
  const [warranty, setWarranty] = useState('');
  const [sanfordSlots, setSanfordSlots] = useState<SanfordSlotSpec[]>(DEFAULT_SHOPIFY_SLOTS);
  const [validationAttempted, setValidationAttempted] = useState(false);

  // Colour options detection: Slot 5 (Shopify/Amazon) or Slot 6 (Noon A+) is only applicable if product has multiple colour options
  const colorList = colors.split(/[,;/]+/).map((c) => c.trim()).filter(Boolean);
  const hasMultipleColors = colorList.length > 1;

  const [sourceImage, setSourceImage] = useState<{
    file: File | null;
    previewUrl: string;
    storagePath?: string;
  }>({ file: null, previewUrl: '' });

  const [catalogueImage, setCatalogueImage] = useState<{
    previewUrl: string;
    fileName?: string;
  }>({ previewUrl: '' });

  // Validation readiness
  const hasPhoto = Boolean(sourceImage?.previewUrl || sourceImage?.file);
  const hasName = Boolean(productName.trim());
  const hasSpecs = Boolean(featuresText.trim());
  const isReadyToGenerate = hasPhoto && hasName && hasSpecs;

  const missingFields: string[] = [];
  if (!hasPhoto) missingFields.push('product photo');
  if (!hasName) missingFields.push('product name');
  if (!hasSpecs) missingFields.push('at least one specification');

  // Settings state
  const [settings, setSettings] = useState<StudioSettings>({
    model: 'gpt-image-2.5-sunburst',
    quality: 'medium',
    featureSize: '1024x1024',
    posterSize: '1024x1536',
    accentColor: 'Auto',
    styleLock: false,
    imagesPerRun: 6,
    background: 'white',
    noonLanguage: 'en',
  });

  const [makePoster, setMakePoster] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize Cards + Poster card
  const [generations, setGenerations] = useState<GenerationItem[]>(() => {
    const initial: GenerationItem[] = DEFAULT_SHOPIFY_SLOTS.map((slot) => ({
      id: `card-${slot.slot}`,
      projectId: '',
      kind: 'feature',
      slot: slot.slot,
      theme: slot.theme,
      slotTitle: slot.title,
      status: 'idle',
      selected: false,
      featureGroup: slot.features,
      sanfordSlot: slot,
    }));

    initial.push({
      id: 'card-poster',
      projectId: '',
      kind: 'poster',
      slot: null,
      theme: 'poster',
      slotTitle: 'E-Commerce Poster',
      status: 'idle',
      selected: false,
    });

    return initial;
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Switch Platform Handler
  const handleSelectPlatform = (newPlatform: EcommercePlatform) => {
    setPlatform(newPlatform);
    setIsPlatformModalOpen(false);

    const templateSlots =
      newPlatform === 'amazon'
        ? DEFAULT_AMAZON_SLOTS
        : newPlatform === 'amazon_aplus'
        ? DEFAULT_AMAZON_APLUS_SLOTS
        : newPlatform === 'noon'
        ? DEFAULT_NOON_SLOTS
        : newPlatform === 'noon_aplus'
        ? DEFAULT_NOON_APLUS_SLOTS
        : DEFAULT_SHOPIFY_SLOTS;

    setSanfordSlots((prev) =>
      templateSlots.map((tmpl) => {
        const existing = prev.find((p) => p.slot === tmpl.slot);
        return {
          ...tmpl,
          features: existing?.features && existing.features.length > 0 ? existing.features : tmpl.features,
          headline: existing?.headline || tmpl.headline,
          promoBanner: existing?.promoBanner || tmpl.promoBanner,
          dimensions: dimensions || tmpl.dimensions,
          warranty: warranty || tmpl.warranty,
          colors: colors || tmpl.colors,
        };
      })
    );

    setGenerations((prev) => {
      const posterCard = prev.find((g) => g.kind === 'poster');
      const updatedCards: GenerationItem[] = templateSlots.map((tmpl) => {
        const existing = prev.find((g) => g.slot === tmpl.slot);
        return {
          id: `card-${tmpl.slot}`,
          projectId,
          kind: 'feature',
          slot: tmpl.slot,
          theme: tmpl.theme,
          slotTitle: tmpl.title,
          status: existing?.status || 'idle',
          imageUrl: existing?.imageUrl,
          imagePath: existing?.imagePath,
          b64_json: existing?.b64_json,
          prompt: existing?.prompt,
          usage: existing?.usage,
          error: existing?.error,
          selected: existing?.selected ?? true,
          featureGroup: existing?.featureGroup || tmpl.features,
          sanfordSlot: tmpl,
          platform: newPlatform,
          compliance: existing?.compliance,
          noonCompliance: existing?.noonCompliance,
        };
      });

      if (posterCard && newPlatform === 'shopify') {
        updatedCards.push(posterCard);
      }
      return updatedCards;
    });

    showToast(
      newPlatform === 'amazon'
        ? 'Amazon Listing Standard selected (2000×2000 px, pure white hero, strict compliance)'
        : newPlatform === 'amazon_aplus'
        ? 'Amazon A+ Content mode selected (EBC banners and comparison modules)'
        : newPlatform === 'noon'
        ? 'Noon UAE Listing Standard selected (6 dedicated photo angles, JPEG, zero overlays)'
        : newPlatform === 'noon_aplus'
        ? 'Noon UAE A+ Content selected (2400px banners, English & Arabic support)'
        : 'Shopify BuySanford mode selected (6-slot pattern with WebP SEO export)'
    );
  };

  // Sync Slot 5/6 status when color options change: automatically skip if <= 1 color
  useEffect(() => {
    setGenerations((prev) =>
      prev.map((g) => {
        const isColorSlot = (platform === 'noon_aplus' && g.slot === 6) || (platform !== 'noon' && platform !== 'noon_aplus' && g.slot === 5);
        if (isColorSlot) {
          if (!hasMultipleColors && (g.status === 'idle' || g.status === 'skipped')) {
            return { ...g, status: 'skipped', selected: false };
          } else if (hasMultipleColors && g.status === 'skipped') {
            return { ...g, status: 'idle', selected: true };
          }
        }
        return g;
      })
    );
  }, [hasMultipleColors, platform]);

  // When Catalogue is parsed from ProductInput
  const handleCatalogueParsed = (data: CatalogueParsedData) => {
    if (data.brand) setBrand(data.brand);
    if (data.productName && !productName) setProductName(data.productName);
    if (data.modelNumber && !modelNumber) setModelNumber(data.modelNumber);
    if (data.tagline && !tagline) setTagline(data.tagline);
    if (data.fullFeatures && data.fullFeatures.length > 0 && !featuresText) {
      setFeaturesText(data.fullFeatures.join('\n'));
    }
    if (data.colors && !colors) setColors(data.colors);
    if (data.dimensions && !dimensions) setDimensions(data.dimensions);
    if (data.weight && !weight) setWeight(data.weight);
    if (data.warranty && !warranty) setWarranty(data.warranty);
    if (data.whatsInTheBox && data.whatsInTheBox.length > 0 && whatsInTheBox.length === 0) {
      setWhatsInTheBox(data.whatsInTheBox);
    }

    if (data.slots && data.slots.length > 0) {
      setGenerations((prev) => {
        const posterCard = prev.find((g) => g.kind === 'poster');
        const newSlots: GenerationItem[] = data.slots.map((slot) => {
          const existing = prev.find((g) => g.slot === slot.slot);
          return {
            id: `card-${slot.slot}`,
            projectId,
            kind: 'feature',
            slot: slot.slot,
            theme: slot.theme,
            slotTitle: slot.title,
            status: existing?.status || 'idle',
            imageUrl: existing?.imageUrl,
            imagePath: existing?.imagePath,
            b64_json: existing?.b64_json,
            selected: true,
            featureGroup: slot.features,
            platform: platform || undefined,
            sanfordSlot: {
              ...slot,
              dimensions: data.dimensions,
              weight: slot.theme === 'size_warranty' ? undefined : data.weight,
              whatsInTheBox: slot.theme === 'size_warranty' ? undefined : data.whatsInTheBox,
              warranty: data.warranty,
            },
          };
        });

        if (posterCard && (platform === 'shopify' || !platform)) {
          newSlots.push(posterCard);
        }
        return newSlots;
      });
      showToast(`Catalogue parsed: specifications extracted for ${data.productName}`);
    }

    // Automatically prompt user to choose platform if not yet chosen
    if (!platform) {
      setIsPlatformModalOpen(true);
    }
  };

  // Load project if opened from History
  useEffect(() => {
    if (urlProjectId && user?.id) {
      projectStorage.getProjectById(urlProjectId, user.id).then((saved) => {
        if (saved) {
          setProjectId(saved.id);
          setProductName(saved.product_name);
          if (saved.model_number) setModelNumber(saved.model_number);
          if (saved.tagline) setTagline(saved.tagline);
          setFeaturesText(saved.features?.join('\n') || '');
          setColors(saved.colors || '');
          if (saved.dimensions) setDimensions(saved.dimensions);
          if (saved.weight) setWeight(saved.weight);
          if (saved.whats_in_the_box) setWhatsInTheBox(saved.whats_in_the_box);
          if (saved.warranty) setWarranty(saved.warranty);

          if (saved.platform) {
            setPlatform(saved.platform);
          }
          if (saved.sanford_slots && saved.sanford_slots.length > 0) {
            setSanfordSlots(saved.sanford_slots);
          }
          if (saved.source_image_data_url || saved.source_image_path) {
            setSourceImage({
              file: null,
              previewUrl: saved.source_image_data_url || '',
              storagePath: saved.source_image_path,
            });
          }
          if (saved.catalogue_preview_url) {
            setCatalogueImage({ previewUrl: saved.catalogue_preview_url });
          }
          if (saved.settings) {
            setSettings(saved.settings);
          }
          if (saved.makePoster !== undefined) {
            setMakePoster(saved.makePoster);
          }
          if (saved.generations && saved.generations.length > 0) {
            setGenerations(saved.generations);
          }
          showToast(`Reopened "${saved.product_name}" from history`);
        }
      });
    }
  }, [urlProjectId, user]);

  // Convert File to base64 Data URL helper
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Execute single slot generation call
  const callGenerateApi = async (
    slotOrKind: number | 'poster',
    styleRefPath?: string
  ): Promise<GenerationItem> => {
    const isPoster = slotOrKind === 'poster';
    const currentSlot = isPoster ? null : slotOrKind;
    const cardId = isPoster ? 'card-poster' : `card-${currentSlot}`;

    // Mark card as pending
    setGenerations((prev) =>
      prev.map((g) => (g.id === cardId ? { ...g, status: 'pending', error: undefined } : g))
    );

    const fullFeatures = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const targetSlotSpec = !isPoster && currentSlot ? sanfordSlots.find((s) => s.slot === currentSlot) : undefined;
    const slotGroup = targetSlotSpec?.features || fullFeatures;
    const targetPlatform = platform || 'shopify';

    // Get source image base64 if available
    let sourceImageDataUrl = '';
    if (sourceImage.file) {
      try {
        sourceImageDataUrl = await fileToDataUrl(sourceImage.file);
      } catch {
        // Ignore
      }
    } else if (sourceImage.previewUrl.startsWith('data:')) {
      sourceImageDataUrl = sourceImage.previewUrl;
    }

    try {
      const res = await fetchApi('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          kind: isPoster ? 'poster' : 'feature',
          slot: currentSlot,
          productName: productName.trim(),
          modelNumber: modelNumber.trim(),
          brand: 'Sanford',
          tagline: tagline.trim(),
          fullFeatures,
          featureGroup: slotGroup,
          colors: colors.trim(),
          sourceImagePath: sourceImage.storagePath,
          sourceImageDataUrl,
          styleRefPath,
          platform: targetPlatform,
          aplusType: targetSlotSpec?.aplusType,
          noonAplusType: targetSlotSpec?.noonAplusType,
          lang: targetSlotSpec?.noonLanguage || settings.noonLanguage || 'en',
          sanfordSlot: targetSlotSpec
            ? {
                ...targetSlotSpec,
                dimensions,
                weight: targetSlotSpec.theme === 'size_warranty' ? undefined : weight,
                whatsInTheBox: targetSlotSpec.theme === 'size_warranty' ? undefined : whatsInTheBox,
                warranty,
              }
            : undefined,
          settings,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP error ${res.status}`);
      }

      let updatedCard: GenerationItem = {
        id: cardId,
        projectId,
        kind: isPoster ? 'poster' : 'feature',
        slot: currentSlot,
        theme: targetSlotSpec?.theme || (isPoster ? 'poster' : 'hero'),
        slotTitle: targetSlotSpec?.title || (isPoster ? 'Poster' : `Image ${currentSlot}`),
        status: 'done',
        imageUrl: data.imageUrl,
        imagePath: data.imagePath,
        b64_json: data.b64_json,
        prompt: data.prompt,
        usage: data.usage,
        featureGroup: slotGroup,
        sanfordSlot: targetSlotSpec,
        selected: true,
        platform: targetPlatform,
      };

      // In Amazon mode, evaluate Amazon listing compliance
      if (targetPlatform === 'amazon') {
        try {
          const comp = await evaluateAmazonCompliance({
            item: updatedCard,
            productName,
            modelNumber,
            hasMultipleColors,
          });
          updatedCard.compliance = comp;
        } catch (compErr) {
          console.warn('Amazon compliance evaluation warning:', compErr);
        }
      }

      // In Noon mode, evaluate Noon listing compliance
      if (targetPlatform === 'noon') {
        try {
          const noonComp = await evaluateNoonCompliance({
            item: updatedCard,
            productName,
            modelNumber,
            hasMultipleColors,
          });
          updatedCard.noonCompliance = noonComp;
        } catch (compErr) {
          console.warn('Noon compliance evaluation warning:', compErr);
        }
      }

      setGenerations((prev) => prev.map((g) => (g.id === cardId ? updatedCard : g)));
      return updatedCard;
    } catch (err: any) {
      const failedCard: GenerationItem = {
        id: cardId,
        projectId,
        kind: isPoster ? 'poster' : 'feature',
        slot: currentSlot,
        theme: targetSlotSpec?.theme,
        slotTitle: targetSlotSpec?.title,
        status: 'failed',
        error: err.message || 'Generation failed',
        featureGroup: slotGroup,
        platform: targetPlatform,
      };

      setGenerations((prev) => prev.map((g) => (g.id === cardId ? failedCard : g)));
      return failedCard;
    }
  };

  // Generate All Handler
  const handleGenerateAll = async () => {
    if (!platform) {
      setIsPlatformModalOpen(true);
      showToast('Please select your target platform (Shopify, Amazon, or Noon) first.', 'error');
      return;
    }

    if (!isReadyToGenerate) {
      setValidationAttempted(true);
      showToast(`Please fill in: ${missingFields.join(', ')}`, 'error');
      return;
    }

    setIsGeneratingAll(true);
    let slotsToRun: number[] = [];
    if (platform === 'amazon_aplus') {
      slotsToRun = [1, 2, 3, 4];
    } else if (platform === 'noon_aplus') {
      slotsToRun = [1, 2, 3, 4, 5];
      if (hasMultipleColors) {
        slotsToRun.push(6);
        slotsToRun.sort((a, b) => a - b);
      }
    } else if (platform === 'noon') {
      // Noon UAE 6 dedicated listing views: Front, Back, Side, 3/4, Detail, Lifestyle
      slotsToRun = [1, 2, 3, 4, 5, 6];
    } else {
      slotsToRun = [1, 2, 3, 4, 6];
      if (hasMultipleColors) {
        slotsToRun.push(5);
        slotsToRun.sort((a, b) => a - b);
      }
    }

    const includePoster = makePoster && platform === 'shopify';
    const totalCalls = includePoster ? slotsToRun.length + 1 : slotsToRun.length;

    try {
      if (settings.styleLock) {
        showToast('Style lock enabled: Generating Slot 1 (Hero) as master reference...');
        const slot1Result = await callGenerateApi(1);

        const remainingPromises: Promise<GenerationItem>[] = [];
        for (const s of slotsToRun) {
          if (s === 1) continue;
          remainingPromises.push(callGenerateApi(s, slot1Result.imagePath));
        }
        if (includePoster) {
          remainingPromises.push(callGenerateApi('poster', slot1Result.imagePath));
        }

        await Promise.allSettled(remainingPromises);
      } else {
        const platformName =
          platform === 'amazon'
            ? 'Amazon'
            : platform === 'amazon_aplus'
            ? 'Amazon A+'
            : platform === 'noon'
            ? 'Noon UAE'
            : platform === 'noon_aplus'
            ? 'Noon A+'
            : 'Shopify';

        showToast(
          `Generating ${totalCalls} ${platformName} images in parallel${
            !hasMultipleColors && platform !== 'noon' && platform !== 'amazon_aplus' && platform !== 'noon_aplus'
              ? ' (Slot 5 skipped: single colour)'
              : ''
          }...`
        );
        const promises: Promise<GenerationItem>[] = [];
        for (const s of slotsToRun) {
          promises.push(callGenerateApi(s));
        }
        if (includePoster) {
          promises.push(callGenerateApi('poster'));
        }

        await Promise.allSettled(promises);
      }

      const platformLabel =
        platform === 'amazon'
          ? 'Amazon'
          : platform === 'amazon_aplus'
          ? 'Amazon A+'
          : platform === 'noon'
          ? 'Noon UAE'
          : platform === 'noon_aplus'
          ? 'Noon A+'
          : 'Shopify';

      showToast(`${platformLabel} generation batch completed! (${slotsToRun.length} images)`);

      // Save project state to projectStorage
      setTimeout(async () => {
        await saveCurrentProject();
      }, 500);
    } catch (err: any) {
      console.error('Batch generation error:', err);
      showToast(err.message || 'Error occurred during generation', 'error');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const saveCurrentProject = async (overrideGenerations?: GenerationItem[]) => {
    let previewDataUrl = sourceImage.previewUrl;
    if (sourceImage.file && !previewDataUrl.startsWith('data:')) {
      try {
        previewDataUrl = await fileToDataUrl(sourceImage.file);
      } catch {
        // Ignore
      }
    }

    const projectPayload: ProjectData = {
      id: projectId,
      user_id: userId,
      product_name: productName,
      model_number: modelNumber,
      tagline,
      features: featuresText.split('\n').filter((f) => f.trim().length > 0),
      colors,
      dimensions,
      weight,
      whats_in_the_box: whatsInTheBox,
      warranty,
      feature_groups: sanfordSlots.map((s) => s.features),
      source_image_path: sourceImage.storagePath,
      source_image_data_url: previewDataUrl,
      catalogue_preview_url: catalogueImage.previewUrl,
      created_at: new Date().toISOString(),
      settings,
      makePoster,
      sanford_slots: sanfordSlots,
      generations: overrideGenerations || generations,
      platform,
    };
    await projectStorage.saveProject(projectPayload);
  };

  // Regenerate single slot
  const handleRegenerateSlot = async (slotOrKind: number | 'poster') => {
    if (!platform) {
      setIsPlatformModalOpen(true);
      showToast('Please select your target platform (Shopify, Amazon, or Noon) first.', 'error');
      return;
    }

    if (!isReadyToGenerate) {
      setValidationAttempted(true);
      showToast(`Please fill in: ${missingFields.join(', ')}`, 'error');
      return;
    }

    if (slotOrKind === 5 && !hasMultipleColors && platform !== 'noon') {
      showToast(
        'Slot 5 (Available Colour Models) cannot be generated because this product has only one colour or no colour options.',
        'error'
      );
      return;
    }

    showToast(`Regenerating ${slotOrKind === 'poster' ? 'Poster' : `Slot ${slotOrKind}`}...`);

    let styleRef: string | undefined = undefined;
    if (settings.styleLock && slotOrKind !== 1) {
      const slot1 = generations.find((g) => g.kind === 'feature' && g.slot === 1);
      styleRef = slot1?.imagePath;
    }

    const res = await callGenerateApi(slotOrKind, styleRef);
    if (res) {
      setTimeout(() => {
        saveCurrentProject();
      }, 500);
    }
  };

  const toggleSelectCard = (id: string) => {
    setGenerations((prev) =>
      prev.map((g) => (g.id === id ? { ...g, selected: !g.selected } : g))
    );
  };

  return (
    <div className="min-h-screen bg-[#EEF1F6] dark:bg-[#090B10] text-[#0F172A] dark:text-slate-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-200 transition-colors">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-18 right-6 z-50 py-2.5 px-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-2 transition-all ${
            toastMessage.type === 'error'
              ? 'bg-[var(--error-bg)] border-red-200 text-[var(--error)] dark:bg-rose-950/90 dark:border-rose-800/80 dark:text-rose-200'
              : 'bg-[var(--success-bg)] border-emerald-200 text-[var(--success)] dark:bg-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-200'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-[var(--error)] dark:text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[var(--success)] dark:text-emerald-400 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Studio 3-Column Layout */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Column 1 (Left): Catalogue & Product Input (width: 4 / 12) */}
          <div className="lg:col-span-4 xl:col-span-4">
            <ProductInput
              userId={userId}
              projectId={projectId}
              productName={productName}
              setProductName={setProductName}
              modelNumber={modelNumber}
              setModelNumber={setModelNumber}
              tagline={tagline}
              setTagline={setTagline}
              featuresText={featuresText}
              setFeaturesText={setFeaturesText}
              colors={colors}
              setColors={setColors}
              dimensions={dimensions}
              setDimensions={setDimensions}
              weight={weight}
              setWeight={setWeight}
              whatsInTheBox={whatsInTheBox}
              setWhatsInTheBox={setWhatsInTheBox}
              warranty={warranty}
              setWarranty={setWarranty}
              sanfordSlots={sanfordSlots}
              setSanfordSlots={setSanfordSlots}
              sourceImage={sourceImage}
              setSourceImage={setSourceImage}
              catalogueImage={catalogueImage}
              setCatalogueImage={setCatalogueImage}
              onCatalogueParsed={handleCatalogueParsed}
              validationAttempted={validationAttempted}
              hasMultipleColors={hasMultipleColors}
            />
          </div>

          {/* Column 2 (Center): Sanford Results Grid (width: 5.5 / 12) */}
          <div className="lg:col-span-5 xl:col-span-5">
            <ResultsGrid
              productName={productName}
              modelNumber={modelNumber}
              brand={brand}
              generations={generations}
              makePoster={makePoster}
              setMakePoster={setMakePoster}
              isGeneratingAll={isGeneratingAll}
              onGenerateAll={handleGenerateAll}
              onRegenerateSlot={handleRegenerateSlot}
              toggleSelectCard={toggleSelectCard}
              settings={settings}
              isReadyToGenerate={isReadyToGenerate}
              missingFields={missingFields}
              hasMultipleColors={hasMultipleColors}
              platform={platform}
              onSelectPlatform={handleSelectPlatform}
              onOpenPlatformModal={() => setIsPlatformModalOpen(true)}
            />
          </div>

          {/* Column 3 (Right): Settings Panel (width: 2.5 / 12) */}
          <div className="lg:col-span-3 xl:col-span-3">
            <SettingsPanel settings={settings} setSettings={setSettings} />
          </div>
        </div>
      </main>

      {/* Platform Select Modal */}
      <PlatformSelectModal
        isOpen={isPlatformModalOpen}
        currentPlatform={platform}
        onSelectPlatform={handleSelectPlatform}
        onClose={() => setIsPlatformModalOpen(false)}
        productName={productName}
      />
    </div>
  );
}
