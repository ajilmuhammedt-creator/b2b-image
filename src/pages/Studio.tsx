import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlatformSelectModal } from '../components/PlatformSelectModal';
import { AmazonComplianceModal } from '../components/AmazonComplianceModal';
import { NoonComplianceModal } from '../components/NoonComplianceModal';
import {
  StudioLayout,
  CatalogueUploadModal,
  ProductSpecsModal,
} from '../components/studio';
import { evaluateAmazonCompliance } from '../lib/amazonCompliance';
import { evaluateNoonCompliance } from '../lib/noonCompliance';
import { projectStorage } from '../lib/projectStorage';
import { fetchApi } from '../lib/apiClient';
import { convertToWebpBlob, convertToAmazonFormatBlob } from '../lib/imageConversion';
import {
  getSeoImageFilename,
  getSeoZipFilename,
  getAmazonImageFilename,
  getAmazonZipFilename,
  getAmazonAPlusFilename,
  getNoonImageFilename,
  getNoonAPlusFilename,
  getNoonZipFilename,
} from '../lib/seoNaming';
import JSZip from 'jszip';
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
    headline: 'Built to Be Your Ultimate Companion.',
    description: 'Exact BuySanford store template: Top-left solid red corner card with rounded bottom-right corner and bold white Sharp Sans slogan, top-right clean floating white product category title, real person in authentic in-use setting. Strictly zero specs or floating text.',
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
    description: 'Product lineup in available color finishes; full-width solid red bottom promotional banner with white Sharp Sans typography (zero font fallback).',
    features: [],
  },
  {
    slot: 6,
    theme: 'size_warranty',
    title: 'Unit Dimension & Warranty Only',
    headline: '',
    description: 'Exact BuySanford style: Pale warm pastel background, "Unit Dimension" header in top left, red/navy 1-Year Warranty ribbon badge in top right, crimson red double-ended arrows (<--->) for height/width/depth—all exclusively in Sharp Sans font. Strictly NO weight, NO box contents.',
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
    title: 'Noon A+ 04 · Lifestyle Context Banner',
    headline: '',
    description: '2400 × 1000 px contextual in-room demonstration illustrating authentic product scale and premium daily application.',
    features: [],
    noonAplusType: 'lifestyle_banner_2400x1000',
  },
  {
    slot: 5,
    theme: 'noon_aplus_dimensions',
    title: 'Noon A+ 05 · Dimensions & Technical Specs',
    headline: '',
    description: '2400 × 1000 px technical schematic diagram with precision dimension arrows and key power ratings.',
    features: [],
    noonAplusType: 'dimensions_2400x1200',
  },
  {
    slot: 6,
    theme: 'noon_aplus_colors',
    title: 'Noon A+ 06 · Available Color Range',
    headline: '',
    description: '2400 × 1000 px multi-variant showcase showing all verified catalogue color models side-by-side.',
    features: [],
    noonAplusType: 'colors_2400x1000',
  },
];

export function Studio() {
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('project');
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';

  // Project core state
  const [projectId, setProjectId] = useState<string>(() => urlProjectId || crypto.randomUUID());
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

  // Target Platform state (default null until user selects or catalogue triggers)
  const [platform, setPlatform] = useState<EcommercePlatform | null>(null);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [pendingSpecsVerification, setPendingSpecsVerification] = useState(false);
  const [briefCollapsed, setBriefCollapsed] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>('card-1');

  // Source & Catalogue Images
  const [sourceImage, setSourceImage] = useState<{
    file: File | null;
    previewUrl: string;
    storagePath?: string;
  }>({ file: null, previewUrl: '' });

  const [catalogueImage, setCatalogueImage] = useState<{
    previewUrl: string;
    fileName?: string;
  }>({ previewUrl: '' });

  // 6 Sanford Slots state
  const [sanfordSlots, setSanfordSlots] = useState<SanfordSlotSpec[]>(DEFAULT_SHOPIFY_SLOTS);

  // Generation Cards state
  const [generations, setGenerations] = useState<GenerationItem[]>(() =>
    DEFAULT_SHOPIFY_SLOTS.map((slot) => ({
      id: `card-${slot.slot}`,
      projectId,
      kind: 'feature',
      slot: slot.slot,
      theme: slot.theme,
      slotTitle: slot.title,
      status: 'idle',
      selected: true,
      sanfordSlot: slot,
      platform: 'shopify',
    }))
  );

  const [makePoster, setMakePoster] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [, setValidationAttempted] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Compliance modal state
  const [complianceItem, setComplianceItem] = useState<GenerationItem | null>(null);
  const [isAmazonComplianceOpen, setIsAmazonComplianceOpen] = useState(false);
  const [noonComplianceItem, setNoonComplianceItem] = useState<GenerationItem | null>(null);
  const [isNoonComplianceOpen, setIsNoonComplianceOpen] = useState(false);

  // Studio Settings state
  const [settings, setSettings] = useState<StudioSettings>({
    model: 'gpt-image-2.5-sunburst',
    quality: 'medium',
    featureSize: '1024x1024',
    posterSize: '1024x1536',
    accentColor: '#C8281E',
    styleLock: true,
    background: 'white',
    amazonResolution: '2000x2000',
    amazonFormat: 'jpeg',
    amazonValidateCategory: 'home_appliances',
    noonResolution: '2000x2000',
    noonFormat: 'jpeg',
    noonLanguage: 'en',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, 4000);
  };

  // Determine whether this product has multiple colors
  const parsedColors = colors
    .split(/[,/|]/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  const hasMultipleColors = parsedColors.length > 1;

  // Deduplicate and partition specifications strictly 50/50 between Slot 3 and Slot 4
  const partitionFeatures = (rawText: string) => {
    const seen = new Set<string>();
    const all: string[] = [];
    for (const line of rawText.split('\n')) {
      const clean = line.trim();
      if (!clean) continue;
      const key = clean.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        all.push(clean);
      }
    }
    const half = Math.ceil(all.length / 2);
    return {
      all,
      part1: all.slice(0, half),
      part2: all.slice(half),
    };
  };

  const applyPartitionToSlot = (
    slotSpec: SanfordSlotSpec,
    part1: string[],
    part2: string[],
    activePlatform: EcommercePlatform | null = platform,
  ): SanfordSlotSpec => {
    const isStandardSpecPlatform =
      activePlatform === 'shopify' || activePlatform === 'amazon' || !activePlatform;
    const isPart1 = slotSpec.theme === 'specs_part_1' || (isStandardSpecPlatform && slotSpec.slot === 3);
    const isPart2 = slotSpec.theme === 'specs_part_2' || (isStandardSpecPlatform && slotSpec.slot === 4);
    if (isPart1) {
      return { ...slotSpec, features: part1, excludedFeatures: part2 };
    }
    if (isPart2) {
      return { ...slotSpec, features: part2, excludedFeatures: part1 };
    }
    return slotSpec;
  };

  // Validation
  const missingFields: string[] = [];
  if (!sourceImage.previewUrl && !sourceImage.file) missingFields.push('product photo');
  if (!productName.trim()) missingFields.push('product name');
  if (!featuresText.trim()) missingFields.push('at least one specification');
  const isReadyToGenerate = missingFields.length === 0;

  // Platform selection handler
  const handleSelectPlatform = (newPlatform: EcommercePlatform) => {
    setPlatform(newPlatform);
    setIsPlatformModalOpen(false);

    let templateSlots: SanfordSlotSpec[];
    if (newPlatform === 'amazon') {
      templateSlots = DEFAULT_AMAZON_SLOTS;
    } else if (newPlatform === 'amazon_aplus') {
      templateSlots = DEFAULT_AMAZON_APLUS_SLOTS;
    } else if (newPlatform === 'noon') {
      templateSlots = DEFAULT_NOON_SLOTS;
    } else if (newPlatform === 'noon_aplus') {
      templateSlots = DEFAULT_NOON_APLUS_SLOTS;
    } else {
      templateSlots = DEFAULT_SHOPIFY_SLOTS;
    }

    const { part1, part2 } = partitionFeatures(featuresText);

    const nextSlots: SanfordSlotSpec[] = templateSlots.map((tmpl) => {
      const existing = sanfordSlots.find((s) => s.slot === tmpl.slot);
      const merged: SanfordSlotSpec = {
        ...tmpl,
        features: existing?.features && existing.features.length > 0 ? existing.features : tmpl.features,
        excludedFeatures: existing?.excludedFeatures || tmpl.excludedFeatures,
        headline: existing?.headline || tmpl.headline,
        promoBanner: existing?.promoBanner || tmpl.promoBanner,
        dimensions: dimensions || tmpl.dimensions,
        warranty: warranty || tmpl.warranty,
        colors: colors || tmpl.colors,
      };
      return applyPartitionToSlot(merged, part1, part2, newPlatform);
    });

    setSanfordSlots(nextSlots);

    setGenerations((prev) => {
      const posterCard = prev.find((g) => g.kind === 'poster');
      const updatedCards: GenerationItem[] = nextSlots.map((slotSpec) => {
        const existing = prev.find((g) => g.slot === slotSpec.slot);
        return {
          id: `card-${slotSpec.slot}`,
          projectId,
          kind: 'feature',
          slot: slotSpec.slot,
          theme: slotSpec.theme,
          slotTitle: slotSpec.title,
          status: existing?.status || 'idle',
          imageUrl: existing?.imageUrl,
          imagePath: existing?.imagePath,
          b64_json: existing?.b64_json,
          prompt: existing?.prompt,
          usage: existing?.usage,
          error: existing?.error,
          selected: existing?.selected ?? true,
          featureGroup: slotSpec.features.length > 0 ? slotSpec.features : existing?.featureGroup || slotSpec.features,
          sanfordSlot: slotSpec,
          platform: newPlatform,
          compliance: existing?.compliance,
          noonCompliance: existing?.noonCompliance,
          isApproved: (existing as any)?.isApproved ?? true,
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
        ? 'Amazon A+ Content mode selected'
        : newPlatform === 'noon'
        ? 'Noon UAE Listing Standard selected (6 dedicated photo angles, JPEG, zero overlays)'
        : newPlatform === 'noon_aplus'
        ? 'Noon UAE A+ Content selected (2400px banners, English & Arabic support)'
        : 'Shopify BuySanford mode selected (6-slot pattern with WebP SEO export)'
    );

    // If specs verification is pending after catalogue parse, open the Product Specifications review modal
    if (pendingSpecsVerification) {
      setIsSpecsModalOpen(true);
      setPendingSpecsVerification(false);
    }
  };

  // Sync Slot 5 status when color options change
  useEffect(() => {
    setGenerations((prev) =>
      prev.map((g) => {
        const isColorSlot =
          (platform === 'noon_aplus' && g.slot === 6) ||
          (platform !== 'noon' && platform !== 'noon_aplus' && g.slot === 5);
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

  // Keep Slot 3 & Slot 4 strictly partitioned 50/50 whenever featuresText or platform changes
  useEffect(() => {
    const { part1, part2 } = partitionFeatures(featuresText);
    setSanfordSlots((prev) =>
      prev.map((slotSpec) => applyPartitionToSlot(slotSpec, part1, part2, platform)),
    );
    setGenerations((prev) =>
      prev.map((g) => {
        if (g.kind === 'poster') return g;
        const isStandardSpecPlatform =
          platform === 'shopify' || platform === 'amazon' || !platform;
        const isPart1 =
          g.theme === 'specs_part_1' ||
          g.sanfordSlot?.theme === 'specs_part_1' ||
          (isStandardSpecPlatform && g.slot === 3);
        const isPart2 =
          g.theme === 'specs_part_2' ||
          g.sanfordSlot?.theme === 'specs_part_2' ||
          (isStandardSpecPlatform && g.slot === 4);
        const nextSlot = g.sanfordSlot
          ? applyPartitionToSlot(g.sanfordSlot, part1, part2, platform)
          : undefined;
        const nextGroup = isPart1 ? part1 : isPart2 ? part2 : g.featureGroup;
        return {
          ...g,
          featureGroup: nextGroup,
          sanfordSlot: nextSlot,
        };
      }),
    );
  }, [featuresText, platform]);

  // When Catalogue is parsed
  const handleCatalogueParsed = (data: CatalogueParsedData) => {
    if (data.brand) setBrand(data.brand);
    if (data.productName) setProductName(data.productName);
    if (data.modelNumber) setModelNumber(data.modelNumber);
    if (data.tagline) setTagline(data.tagline);
    const parsedRawFeatures =
      data.fullFeatures && data.fullFeatures.length > 0 ? data.fullFeatures.join('\n') : featuresText;
    const { all: dedupedAll, part1, part2 } = partitionFeatures(parsedRawFeatures);
    if (dedupedAll.length > 0) {
      setFeaturesText(dedupedAll.join('\n'));
    }
    if (data.colors) setColors(data.colors);
    if (data.dimensions) setDimensions(data.dimensions);
    if (data.weight) setWeight(data.weight);
    if (data.warranty) setWarranty(data.warranty);
    if (data.whatsInTheBox && data.whatsInTheBox.length > 0) {
      setWhatsInTheBox(data.whatsInTheBox);
    }

    if (data.slots && data.slots.length > 0) {
      const enrichedSlots: SanfordSlotSpec[] = data.slots.map((slot) =>
        applyPartitionToSlot(
          {
            ...slot,
            dimensions: data.dimensions,
            weight: slot.theme === 'size_warranty' ? undefined : data.weight,
            whatsInTheBox: slot.theme === 'size_warranty' ? undefined : data.whatsInTheBox,
            warranty: data.warranty,
          },
          part1,
          part2,
          platform,
        ),
      );
      setSanfordSlots(enrichedSlots);
      setGenerations((prev) => {
        const posterCard = prev.find((g) => g.kind === 'poster');
        const newSlots: GenerationItem[] = enrichedSlots.map((slot) => {
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
            sanfordSlot: slot,
            isApproved: true,
          };
        });

        if (posterCard && (platform === 'shopify' || !platform)) {
          newSlots.push(posterCard);
        }
        return newSlots;
      });
      showToast(`Specifications extracted for ${data.productName || data.modelNumber || 'product'}`);
    }

    setPendingSpecsVerification(true);

    // If platform is not chosen yet, ask which platform first; otherwise open specifications verification modal immediately
    if (!platform) {
      setIsPlatformModalOpen(true);
    } else {
      setIsSpecsModalOpen(true);
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
    styleRefPath?: string,
    customInstructions?: string
  ): Promise<GenerationItem> => {
    const isPoster = slotOrKind === 'poster';
    const currentSlot = isPoster ? null : slotOrKind;
    const cardId = isPoster ? 'card-poster' : `card-${currentSlot}`;

    const existingCard = generations.find((g) => g.id === cardId);
    const prevVersion = existingCard?.version || 1;
    const nextVersion = existingCard?.imageUrl ? prevVersion + 1 : 1;

    setGenerations((prev) =>
      prev.map((g) => (g.id === cardId ? { ...g, status: 'pending', error: undefined } : g))
    );

    const { all: fullFeatures, part1, part2 } = partitionFeatures(featuresText);
    const targetPlatform = platform || 'shopify';
    const rawSlotSpec = !isPoster && currentSlot ? sanfordSlots.find((s) => s.slot === currentSlot) : undefined;
    const targetSlotSpec = rawSlotSpec
      ? applyPartitionToSlot(rawSlotSpec, part1, part2, targetPlatform)
      : undefined;

    const targetTheme = targetSlotSpec?.theme || existingCard?.theme;
    const isSpecPart1 =
      !isPoster &&
      (targetTheme === 'specs_part_1' ||
        (currentSlot === 3 && (targetPlatform === 'shopify' || targetPlatform === 'amazon')));
    const isSpecPart2 =
      !isPoster &&
      (targetTheme === 'specs_part_2' ||
        (currentSlot === 4 && (targetPlatform === 'shopify' || targetPlatform === 'amazon')));

    const slotGroup = isSpecPart1
      ? part1
      : isSpecPart2
        ? part2
        : targetSlotSpec?.features && targetSlotSpec.features.length > 0
          ? targetSlotSpec.features
          : fullFeatures;
    const excludedGroup = isSpecPart1
      ? part2
      : isSpecPart2
        ? part1
        : targetSlotSpec?.excludedFeatures || [];

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
          excludedFeatures: excludedGroup,
          colors: colors.trim(),
          sourceImagePath: sourceImage.storagePath,
          sourceImageDataUrl,
          styleRefPath,
          platform: targetPlatform,
          customInstructions: customInstructions?.trim() || undefined,
          aplusType: targetSlotSpec?.aplusType,
          noonAplusType: targetSlotSpec?.noonAplusType,
          lang: targetSlotSpec?.noonLanguage || settings.noonLanguage || 'en',
          sanfordSlot: targetSlotSpec
            ? {
                ...targetSlotSpec,
                features: slotGroup,
                excludedFeatures: excludedGroup,
                headline:
                  targetSlotSpec.headline ||
                  (targetSlotSpec.theme === 'lifestyle' && tagline.trim() ? tagline.trim() : undefined) ||
                  targetSlotSpec.headline,
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

      const existingHistory = existingCard?.iterationHistory || [];
      const updatedHistory = customInstructions?.trim()
        ? [
            ...existingHistory,
            {
              note: customInstructions.trim(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              version: nextVersion,
            },
          ]
        : existingHistory;

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
        selected: existingCard?.selected ?? true,
        platform: targetPlatform,
        isApproved: true,
        version: nextVersion,
        customInstructions: customInstructions?.trim() || undefined,
        iterationHistory: updatedHistory,
      };

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
        selected: existingCard?.selected ?? true,
        version: prevVersion,
        iterationHistory: existingCard?.iterationHistory,
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
      setIsSpecsModalOpen(true);
      showToast(`Please complete: ${missingFields.join(', ')}`, 'error');
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
      slotsToRun = [1, 2, 3, 4, 5, 6];
    } else {
      slotsToRun = [1, 2, 3, 4, 6];
      if (hasMultipleColors) {
        slotsToRun.push(5);
        slotsToRun.sort((a, b) => a - b);
      }
    }

    const includePoster = makePoster && platform === 'shopify';

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
          `Generating all ${slotsToRun.length} ${platformName} images in parallel${
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

      showToast(`Generation batch completed! (${slotsToRun.length} images)`);

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
      source_image_data_url: previewDataUrl,
      source_image_path: sourceImage.storagePath,
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
  const handleRegenerateSlot = async (slotOrKind: number | 'poster', customInstructions?: string) => {
    if (!platform) {
      setIsPlatformModalOpen(true);
      showToast('Please select your target platform first.', 'error');
      return;
    }

    if (!isReadyToGenerate) {
      setValidationAttempted(true);
      setIsSpecsModalOpen(true);
      showToast(`Please fill in: ${missingFields.join(', ')}`, 'error');
      return;
    }

    if (slotOrKind === 5 && !hasMultipleColors && platform !== 'noon') {
      showToast('Slot 5 cannot be generated because this product has only one colour.', 'error');
      return;
    }

    const slotLabel = slotOrKind === 'poster' ? 'Poster' : `Slot ${slotOrKind}`;
    if (customInstructions && customInstructions.trim()) {
      showToast(`Refining ${slotLabel} with: "${customInstructions.trim().slice(0, 45)}..."`);
    } else {
      showToast(`Regenerating ${slotLabel}...`);
    }

    let styleRef: string | undefined = undefined;
    if (settings.styleLock && slotOrKind !== 1) {
      const slot1 = generations.find((g) => g.kind === 'feature' && g.slot === 1);
      styleRef = slot1?.imagePath;
    }

    const res = await callGenerateApi(slotOrKind, styleRef, customInstructions);
    if (res) {
      setTimeout(() => {
        saveCurrentProject();
      }, 500);
    }
  };

  // Selective Multi-Slot / Batch Regeneration
  const handleRegenerateSelectedSlots = async (customInstructions?: string) => {
    if (!platform) {
      setIsPlatformModalOpen(true);
      showToast('Please select your target platform first.', 'error');
      return;
    }

    if (!isReadyToGenerate) {
      setValidationAttempted(true);
      setIsSpecsModalOpen(true);
      showToast(`Please complete required specifications: ${missingFields.join(', ')}`, 'error');
      return;
    }

    const selectedCards = generations.filter((g) => g.selected && g.status !== 'skipped');
    if (selectedCards.length === 0) {
      showToast('No slots currently selected. Please check at least one slot to regenerate.', 'error');
      return;
    }

    const slotNames = selectedCards
      .map((g) => (g.kind === 'poster' ? 'Poster' : `Slot ${g.slot}`))
      .join(', ');

    if (customInstructions && customInstructions.trim()) {
      showToast(`Regenerating ${selectedCards.length} selected slot(s) (${slotNames}) with custom instructions... Keeping all other slots intact.`);
    } else {
      showToast(`Regenerating ${selectedCards.length} selected slot(s) (${slotNames})... Keeping all other slots intact.`);
    }

    // Get style reference from Slot 1 if available
    let styleRef: string | undefined = undefined;
    if (settings.styleLock) {
      const slot1 = generations.find((g) => g.kind === 'feature' && g.slot === 1);
      styleRef = slot1?.imagePath;
    }

    // Execute generation in parallel ONLY for the selected slots
    const promises = selectedCards.map((item) => {
      const slotVal = item.kind === 'poster' ? 'poster' : (item.slot || 1);
      const refToUse = slotVal === 1 ? undefined : styleRef;
      return callGenerateApi(slotVal, refToUse, customInstructions);
    });

    try {
      await Promise.allSettled(promises);
      showToast(`Iterative refinement completed! (${selectedCards.length} slots updated)`);
      setTimeout(() => {
        saveCurrentProject();
      }, 500);
    } catch (err: any) {
      showToast(err.message || 'Error occurred during selective regeneration', 'error');
    }
  };

  const handleSelectAllCards = () => {
    setGenerations((prev) => prev.map((g) => ({ ...g, selected: true })));
  };

  const handleDeselectAllCards = () => {
    setGenerations((prev) => prev.map((g) => ({ ...g, selected: false })));
  };

  const handleSelectOnlyCard = (id: string) => {
    setGenerations((prev) => prev.map((g) => ({ ...g, selected: g.id === id })));
    setSelectedSlotId(id);
  };

  // Image Export Blob Helper
  const isAmazon = platform === 'amazon' || platform === 'amazon_aplus';
  const isNoon = platform === 'noon' || platform === 'noon_aplus';

  const fetchImageBlob = async (item: GenerationItem): Promise<Blob | null> => {
    try {
      let rawBlob: Blob;
      if (item.b64_json) {
        const byteCharacters = atob(item.b64_json);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        rawBlob = new Blob([byteArray], { type: 'image/png' });
      } else if (item.imageUrl) {
        const res = await fetch(item.imageUrl);
        rawBlob = await res.blob();
      } else {
        return null;
      }

      if (isAmazon || isNoon) {
        const format = isNoon ? 'jpeg' : (settings.amazonFormat || 'jpeg');
        return await convertToAmazonFormatBlob(rawBlob, format, 2000, 0.95);
      } else {
        return await convertToWebpBlob(rawBlob);
      }
    } catch (e) {
      console.warn('Could not fetch and convert blob for download:', e);
    }
    return null;
  };

  // Download ZIP
  const handleDownloadZip = async (onlySelected: boolean = false) => {
    const targets = generations.filter((g) => {
      if (g.status !== 'done') return false;
      if (onlySelected) return g.selected;
      return true;
    });

    if (targets.length === 0) {
      showToast('No generated images available to download', 'error');
      return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const zipFileName = isNoon
        ? getNoonZipFilename({ brand, productName, modelNumber, isAPlus: platform === 'noon_aplus' })
        : isAmazon
        ? getAmazonZipFilename({ brand, productName, modelNumber })
        : getSeoZipFilename({ brand, productName, modelNumber });

      let amazonPtCounter = 1;

      for (let i = 0; i < targets.length; i++) {
        const item = targets[i];
        const blob = await fetchImageBlob(item);
        if (blob) {
          let fileName: string;
          if (platform === 'noon') {
            fileName = getNoonImageFilename({
              modelNumber,
              productName,
              slotNumber: item.slot ?? i + 1,
              theme: item.theme,
            });
          } else if (platform === 'noon_aplus') {
            fileName = getNoonAPlusFilename({
              modelNumber,
              productName,
              slotNumber: item.slot ?? i + 1,
              language: item.noonLanguage || 'en',
            });
          } else if (platform === 'amazon') {
            const isMain = item.slot === 1 || item.theme === 'hero';
            fileName = getAmazonImageFilename({
              modelNumber,
              productName,
              slotNumber: item.slot ?? 1,
              secondaryIndex: isMain ? undefined : amazonPtCounter++,
              format: settings.amazonFormat || 'jpeg',
            });
          } else if (platform === 'amazon_aplus') {
            fileName = getAmazonAPlusFilename({
              modelNumber,
              productName,
              aplusType: item.sanfordSlot?.aplusType,
              index: i + 1,
              format: settings.amazonFormat || 'jpeg',
            });
          } else {
            fileName = getSeoImageFilename({
              brand,
              productName,
              modelNumber,
              item,
              index: i + 1,
            });
          }
          zip.file(fileName, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
      showToast(`ZIP package downloaded successfully!`);
    } catch (err: any) {
      console.error('Error generating zip:', err);
      showToast('Error generating ZIP download', 'error');
    } finally {
      setIsZipping(false);
    }
  };

  // Single image download with SEO filename
  const handleDownloadSingleItem = async (item: GenerationItem) => {
    const blob = await fetchImageBlob(item);
    if (!blob) {
      showToast('Could not load image data for export', 'error');
      return;
    }

    let fileName: string;
    if (platform === 'noon') {
      fileName = getNoonImageFilename({
        modelNumber,
        productName,
        slotNumber: item.slot ?? 1,
        theme: item.theme,
      });
    } else if (platform === 'noon_aplus') {
      fileName = getNoonAPlusFilename({
        modelNumber,
        productName,
        slotNumber: item.slot ?? 1,
        language: item.noonLanguage || 'en',
      });
    } else if (isAmazon) {
      const isMain = item.slot === 1 || item.theme === 'hero';
      fileName = getAmazonImageFilename({
        modelNumber,
        productName,
        slotNumber: item.slot ?? 1,
        secondaryIndex: isMain ? undefined : 1,
        format: settings.amazonFormat || 'jpeg',
      });
    } else {
      fileName = getSeoImageFilename({
        brand,
        productName,
        modelNumber,
        item,
      });
    }

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    showToast(`Exported ${fileName}`);
  };

  // Share to phone
  const canShare = typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare;
  const handleShareToPhone = async () => {
    const targets = generations.filter((g) => g.status === 'done');
    if (targets.length === 0) return;

    const files: File[] = [];
    let ptCount = 1;

    for (let i = 0; i < targets.length; i++) {
      const item = targets[i];
      const blob = await fetchImageBlob(item);
      if (blob) {
        let fileName: string;
        let mime = 'image/webp';
        if (platform === 'noon') {
          fileName = getNoonImageFilename({
            modelNumber,
            productName,
            slotNumber: item.slot ?? 1,
            theme: item.theme,
          });
          mime = 'image/jpeg';
        } else if (platform === 'noon_aplus') {
          fileName = getNoonAPlusFilename({
            modelNumber,
            productName,
            slotNumber: item.slot ?? 1,
            language: item.noonLanguage || 'en',
          });
          mime = 'image/jpeg';
        } else if (isAmazon) {
          const isMain = item.slot === 1 || item.theme === 'hero';
          fileName = getAmazonImageFilename({
            modelNumber,
            productName,
            slotNumber: item.slot ?? 1,
            secondaryIndex: isMain ? undefined : ptCount++,
            format: settings.amazonFormat || 'jpeg',
          });
          mime = settings.amazonFormat === 'png' ? 'image/png' : 'image/jpeg';
        } else {
          fileName = getSeoImageFilename({
            brand,
            productName,
            modelNumber,
            item,
            index: i + 1,
          });
        }
        files.push(new File([blob], fileName, { type: mime }));
      }
    }

    if (files.length > 0 && navigator.canShare({ files })) {
      try {
        await navigator.share({
          files,
          title: `${productName} Listing Images`,
        });
      } catch (err) {
        console.warn('Share sheet cancelled or failed:', err);
      }
    }
  };

  // Save to folder
  const canPickDirectory = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  const handleSaveToFolder = async () => {
    const targets = generations.filter((g) => g.status === 'done');
    if (targets.length === 0) return;

    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker();
      let ptCounter = 1;

      for (let i = 0; i < targets.length; i++) {
        const item = targets[i];
        const blob = await fetchImageBlob(item);
        if (blob) {
          let fileName: string;
          if (platform === 'noon') {
            fileName = getNoonImageFilename({
              modelNumber,
              productName,
              slotNumber: item.slot ?? 1,
              theme: item.theme,
            });
          } else if (platform === 'noon_aplus') {
            fileName = getNoonAPlusFilename({
              modelNumber,
              productName,
              slotNumber: item.slot ?? 1,
              language: item.noonLanguage || 'en',
            });
          } else if (isAmazon) {
            const isMain = item.slot === 1 || item.theme === 'hero';
            fileName = getAmazonImageFilename({
              modelNumber,
              productName,
              slotNumber: item.slot ?? 1,
              secondaryIndex: isMain ? undefined : ptCounter++,
              format: settings.amazonFormat || 'jpeg',
            });
          } else {
            fileName = getSeoImageFilename({
              brand,
              productName,
              modelNumber,
              item,
              index: i + 1,
            });
          }
          const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        }
      }
      showToast('All listing images saved to chosen local folder!');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Save to folder error:', err);
        showToast('Error saving to local folder', 'error');
      }
    }
  };

  // Toggle selection checkbox
  const toggleSelectCard = (id: string) => {
    setGenerations((prev) =>
      prev.map((g) => (g.id === id ? { ...g, selected: !g.selected } : g))
    );
  };

  // Approve / Send back handlers
  const handleApproveItem = (id: string) => {
    setGenerations((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isApproved: true } : g))
    );
    showToast('Asset marked as approved');
  };

  const handleSendBackItem = (id: string, note: string) => {
    setGenerations((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isApproved: false } : g))
    );
    showToast(`Note recorded: "${note}". Click Regenerate to apply updates.`);
  };

  // Open compliance modal
  const handleOpenCompliance = (item: GenerationItem) => {
    if (platform === 'amazon' || platform === 'amazon_aplus') {
      setComplianceItem(item);
      setIsAmazonComplianceOpen(true);
    } else if (platform === 'noon' || platform === 'noon_aplus') {
      setNoonComplianceItem(item);
      setIsNoonComplianceOpen(true);
    }
  };

  // Calculate status counts & stage index
  const activeSlots = sanfordSlots.filter(
    (s) => !(s.slot === 5 && !hasMultipleColors && platform !== 'noon')
  );
  const totalCount = activeSlots.length;
  const approvedCount = generations.filter(
    (g) => g.status === 'done' && (g as any).isApproved !== false
  ).length;

  const stageIndex = isGeneratingAll
    ? 1 // Generating
    : approvedCount === totalCount && totalCount > 0
    ? 3 // Deliver
    : generations.some((g) => g.status === 'done')
    ? 2 // Review
    : 0; // Brief

  const formatLabel =
    platform === 'amazon'
      ? `${settings.amazonResolution || '2000 × 2000'} ${settings.amazonFormat?.toUpperCase() || 'JPEG'}`
      : platform === 'noon' || platform === 'noon_aplus'
      ? '2000 × 2000 JPEG'
      : '100% WebP';

  const marketplaceName =
    platform === 'amazon' || platform === 'amazon_aplus'
      ? 'Amazon'
      : platform === 'noon' || platform === 'noon_aplus'
      ? 'Noon'
      : 'Shopify';

  // Slot status dictionary for brief panel dots
  const slotStatuses: Record<number, 'draft' | 'pending' | 'review' | 'approved' | 'failed'> = {};
  sanfordSlots.forEach((slot) => {
    const gen = generations.find((g) => g.kind === 'feature' && g.slot === slot.slot);
    if (!gen || gen.status === 'idle') {
      slotStatuses[slot.slot] = 'draft';
    } else if (gen.status === 'pending') {
      slotStatuses[slot.slot] = 'pending';
    } else if (gen.status === 'failed') {
      slotStatuses[slot.slot] = 'failed';
    } else if ((gen as any).isApproved === false) {
      slotStatuses[slot.slot] = 'review';
    } else {
      slotStatuses[slot.slot] = 'approved';
    }
  });

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-18 right-6 z-50 py-2.5 px-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-2 transition-all ${
            toastMessage.type === 'error'
              ? 'bg-err-bg border-err-fg/20 text-err-fg'
              : 'bg-ok-bg border-ok-fg/20 text-ok-fg'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-err-fg shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-ok-fg shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Sanford Studio v3 Layout */}
      <StudioLayout
        productName={productName}
        modelNumber={modelNumber}
        sourceImageUrl={sourceImage.previewUrl}
        platform={platform}
        stageIndex={stageIndex}
        isGeneratingAll={isGeneratingAll}
        onGenerateAll={handleGenerateAll}
        briefCollapsed={briefCollapsed}
        onToggleBriefCollapse={() => setBriefCollapsed(!briefCollapsed)}
        onSelectPlatform={handleSelectPlatform}
        sanfordSlots={sanfordSlots}
        slotStatuses={slotStatuses}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenSpecsModal={() => setIsSpecsModalOpen(true)}
        items={generations}
        selectedSlotId={selectedSlotId}
        onSelectSlot={(id) => setSelectedSlotId(id)}
        onToggleSelectCheckbox={toggleSelectCard}
        onRegenerateSelected={handleRegenerateSelectedSlots}
        onSelectAll={handleSelectAllCards}
        onDeselectAll={handleDeselectAllCards}
        onSelectOnlySlot={handleSelectOnlyCard}
        onApproveItem={handleApproveItem}
        onSendBackItem={handleSendBackItem}
        onRetrySlot={handleRegenerateSlot}
        onOpenComplianceModal={handleOpenCompliance}
        onDownloadItem={handleDownloadSingleItem}
        approvedCount={approvedCount}
        totalCount={totalCount}
        formatLabel={formatLabel}
        isZipping={isZipping}
        onDownloadZip={() => handleDownloadZip(false)}
        onPhoneShare={canShare ? handleShareToPhone : undefined}
        onFolderSave={canPickDirectory ? handleSaveToFolder : undefined}
        onOpenPlatformModal={() => setIsPlatformModalOpen(true)}
        onDeliver={() => {
          handleDownloadZip(false);
          showToast(`Delivered all ${approvedCount} assets for ${marketplaceName}!`);
        }}
      >
        {/* Dialogue 1: Catalogue Upload Modal */}
        <CatalogueUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onCatalogueParsed={handleCatalogueParsed}
          setCatalogueImage={setCatalogueImage}
          setSourceImage={setSourceImage}
        />

        {/* Dialogue 2: Product Specifications Edit Modal */}
        <ProductSpecsModal
          isOpen={isSpecsModalOpen}
          onClose={() => setIsSpecsModalOpen(false)}
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
          warranty={warranty}
          setWarranty={setWarranty}
          sourceImage={sourceImage}
          setSourceImage={setSourceImage}
        />

        {/* Dialogue 3: Platform Selection Modal */}
        <PlatformSelectModal
          isOpen={isPlatformModalOpen}
          currentPlatform={platform}
          onSelectPlatform={handleSelectPlatform}
          onClose={() => setIsPlatformModalOpen(false)}
          productName={productName}
        />

        {/* Dialogue 4: Amazon Compliance Audit Modal */}
        {complianceItem && (
          <AmazonComplianceModal
            isOpen={isAmazonComplianceOpen}
            item={complianceItem}
            compliance={complianceItem.compliance || null}
            productName={productName}
            modelNumber={modelNumber}
            onClose={() => {
              setIsAmazonComplianceOpen(false);
              setComplianceItem(null);
            }}
          />
        )}

        {/* Dialogue 5: Noon Compliance Audit Modal */}
        {noonComplianceItem && (
          <NoonComplianceModal
            isOpen={isNoonComplianceOpen}
            item={noonComplianceItem}
            compliance={noonComplianceItem.noonCompliance || null}
            productName={productName}
            modelNumber={modelNumber}
            onClose={() => {
              setIsNoonComplianceOpen(false);
              setNoonComplianceItem(null);
            }}
          />
        )}
      </StudioLayout>
    </>
  );
}
