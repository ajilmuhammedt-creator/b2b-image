import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { ProductInput } from '../components/ProductInput';
import { ResultsGrid } from '../components/ResultsGrid';
import { SettingsPanel } from '../components/SettingsPanel';
import { projectStorage } from '../lib/projectStorage';
import { fetchApi } from '../lib/apiClient';
import type {
  GenerationItem,
  ProjectData,
  StudioSettings,
  SanfordSlotSpec,
  CatalogueParsedData,
} from '../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const DEFAULT_SANFORD_SLOTS: SanfordSlotSpec[] = [
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

export function Studio() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('project');

  const userId = user?.id || '';

  // Project state - starts completely blank until a catalogue is uploaded
  const [projectId, setProjectId] = useState<string>(() => crypto.randomUUID());
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
  const [sanfordSlots, setSanfordSlots] = useState<SanfordSlotSpec[]>(DEFAULT_SANFORD_SLOTS);
  const [validationAttempted, setValidationAttempted] = useState(false);

  // Colour options detection: Slot 5 is only applicable if product has multiple colour options
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
  });

  const [makePoster, setMakePoster] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize 6 Sanford Cards + 1 Poster card
  const [generations, setGenerations] = useState<GenerationItem[]>(() => {
    const initial: GenerationItem[] = DEFAULT_SANFORD_SLOTS.map((slot) => ({
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

  // Sync Slot 5 status when color options change: automatically skip Slot 5 if <= 1 color
  useEffect(() => {
    setGenerations((prev) =>
      prev.map((g) => {
        if (g.slot === 5) {
          if (!hasMultipleColors && (g.status === 'idle' || g.status === 'skipped')) {
            return { ...g, status: 'skipped', selected: false };
          } else if (hasMultipleColors && g.status === 'skipped') {
            return { ...g, status: 'idle', selected: true };
          }
        }
        return g;
      })
    );
  }, [hasMultipleColors]);

  // When Catalogue is parsed from ProductInput
  const handleCatalogueParsed = (data: CatalogueParsedData) => {
    if (data.brand) setBrand(data.brand);
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
            selected: true,
            featureGroup: slot.features,
            sanfordSlot: {
              ...slot,
              dimensions: data.dimensions,
              weight: slot.theme === 'size_warranty' ? undefined : data.weight,
              whatsInTheBox: slot.theme === 'size_warranty' ? undefined : data.whatsInTheBox,
              warranty: data.warranty,
            },
          };
        });

        if (posterCard) {
          newSlots.push(posterCard);
        }
        return newSlots;
      });
      showToast(`Catalogue parsed: 6 Sanford pattern slots generated for ${data.productName}`);
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
          fullFeatures,
          featureGroup: slotGroup,
          colors: colors.trim(),
          sourceImagePath: sourceImage.storagePath,
          sourceImageDataUrl,
          styleRefPath,
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

      const updatedCard: GenerationItem = {
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
      };

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
      };

      setGenerations((prev) => prev.map((g) => (g.id === cardId ? failedCard : g)));
      return failedCard;
    }
  };

  // Generate All Handler
  const handleGenerateAll = async () => {
    if (!isReadyToGenerate) {
      setValidationAttempted(true);
      showToast(`Please fill in: ${missingFields.join(', ')}`, 'error');
      return;
    }

    setIsGeneratingAll(true);
    // Determine which slots to run: Slot 5 is strictly skipped if product has only 1 color or no color options
    const slotsToRun = [1, 2, 3, 4, 6];
    if (hasMultipleColors) {
      slotsToRun.push(5);
      slotsToRun.sort((a, b) => a - b);
    }
    const totalCalls = makePoster ? slotsToRun.length + 1 : slotsToRun.length;

    try {
      if (settings.styleLock) {
        showToast('Style lock enabled: Generating Slot 1 (Hero) as master reference...');
        const slot1Result = await callGenerateApi(1);

        const remainingPromises: Promise<GenerationItem>[] = [];
        for (const s of slotsToRun) {
          if (s === 1) continue;
          remainingPromises.push(callGenerateApi(s, slot1Result.imagePath));
        }
        if (makePoster) {
          remainingPromises.push(callGenerateApi('poster', slot1Result.imagePath));
        }

        await Promise.allSettled(remainingPromises);
      } else {
        showToast(
          `Generating ${totalCalls} Sanford e-commerce images in parallel${
            !hasMultipleColors ? ' (Slot 5 skipped: single colour product)' : ''
          }...`
        );
        const promises: Promise<GenerationItem>[] = [];
        for (const s of slotsToRun) {
          promises.push(callGenerateApi(s));
        }
        if (makePoster) {
          promises.push(callGenerateApi('poster'));
        }

        await Promise.allSettled(promises);
      }

      showToast(
        `Sanford pattern generation batch completed! (${slotsToRun.length} images${
          !hasMultipleColors ? ', Slot 5 skipped' : ''
        })`
      );

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
    };
    await projectStorage.saveProject(projectPayload);
  };

  // Regenerate single slot
  const handleRegenerateSlot = async (slotOrKind: number | 'poster') => {
    if (!isReadyToGenerate) {
      setValidationAttempted(true);
      showToast(`Please fill in: ${missingFields.join(', ')}`, 'error');
      return;
    }

    if (slotOrKind === 5 && !hasMultipleColors) {
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
      <Navbar />

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
            />
          </div>

          {/* Column 3 (Right): Settings Panel (width: 2.5 / 12) */}
          <div className="lg:col-span-3 xl:col-span-3">
            <SettingsPanel settings={settings} setSettings={setSettings} />
          </div>
        </div>
      </main>
    </div>
  );
}
