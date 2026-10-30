import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { ProductInput } from '../components/ProductInput';
import { ResultsGrid } from '../components/ResultsGrid';
import { SettingsPanel } from '../components/SettingsPanel';
import { projectStorage } from '../lib/projectStorage';
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
    headline: 'Refreshing Airflow In Every Spin!',
    description: 'Exact BuySanford lifestyle template: Person at desk with fan, top-right solid red corner badge with rounded corner containing white Sharp Sans text. Strictly NO floating text and NO specs.',
    features: [],
  },
  {
    slot: 3,
    theme: 'specs_part_1',
    title: 'Specifications — Part 1',
    headline: 'SUITABLE FOR OUTDOOR & INDOOR USE',
    promoBanner: 'Rechargeable Cooling Hand Fan with Cold Plate',
    description: 'Upper-left red circular icon badges with white symbols & divider lines; upper-right usage slogan; full-width solid red bottom promotional banner in Sharp Sans font. Zero feature duplicates.',
    features: ['Cooling Function Cold Plate', '5 Level Wind Speed (0-100)', '5 Watts Power'],
  },
  {
    slot: 4,
    theme: 'specs_part_2',
    title: 'Specifications — Part 2 (Non-Overlapping)',
    headline: 'PORTABLE, POWERFUL, PEACEFUL, STAY COOL EVERYWHERE',
    promoBanner: 'Light Weight and Easy to Carry',
    description: 'Upper-left red circular icon badges with white symbols & divider lines; upper-right usage slogan; full-width solid red bottom promotional banner in Sharp Sans font. Zero feature duplicates.',
    features: ['Digital Display - Gear & Battery Levels', '3600mAh Rechargeable Battery', 'Type-C Charging Port', '90° Rotation Fold (Up & Down)'],
  },
  {
    slot: 5,
    theme: 'colors',
    title: 'Available Colour Models Only',
    headline: 'Available Colors',
    promoBanner: 'Available in Multiple Attractive Colors',
    description: 'Product lineup in available color finishes; full-width solid red bottom promotional banner with white typography.',
    features: ['Graphite Black', 'Arctic White', 'Slate Grey', 'Pastel Blue'],
  },
  {
    slot: 6,
    theme: 'size_warranty',
    title: 'Unit Dimension & Warranty Only',
    headline: 'Unit Dimension',
    description: 'Exact BuySanford style: Pale warm pastel background, "Unit Dimension" header in top left, red/navy 1-Year Warranty ribbon badge in top right, crimson red double-ended arrows (<--->) for height/width/depth. Strictly NO weight, NO box contents.',
    features: ['Dimensions: 197mm x 78mm x 57mm', '1 Year Service Warranty'],
  },
];

export function Studio() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('project');

  const userId = user?.id || 'demo-supplier';

  // Project state
  const [projectId, setProjectId] = useState<string>(() => crypto.randomUUID());
  const [productName, setProductName] = useState('Sanford SF6671HFN Rechargeable Cooling Hand Fan');
  const [modelNumber, setModelNumber] = useState('SF6671HFN');
  const [tagline, setTagline] = useState('The Smartest Breeze!');
  const [featuresText, setFeaturesText] = useState(
    `Rechargeable Cooling Hand Fan
Cooling Function
Digital Display - Gear Position and Battery Levels
5 Level Wind Speed (0-100)
90° Rotation Fold (up & down)
3600mAh Rechargeable Battery
Safety Protection
Type-C Charging Port
Lanyard & Loop Holder
5 Watts Power`
  );
  const [colors, setColors] = useState('Graphite Black');
  const [dimensions, setDimensions] = useState('78mm x 197mm x 57mm');
  const [weight, setWeight] = useState('Unit 225g, Package 305g');
  const [whatsInTheBox, setWhatsInTheBox] = useState<string[]>([
    'Hand Fan',
    'Type-C USB Cable',
    'User Manual',
    'Lanyard',
  ]);
  const [warranty, setWarranty] = useState('1 Year Service Warranty');
  const [sanfordSlots, setSanfordSlots] = useState<SanfordSlotSpec[]>(DEFAULT_SANFORD_SLOTS);

  const [sourceImage, setSourceImage] = useState<{
    file: File | null;
    previewUrl: string;
    storagePath?: string;
  }>({ file: null, previewUrl: '' });

  const [catalogueImage, setCatalogueImage] = useState<{
    previewUrl: string;
    fileName?: string;
  }>({ previewUrl: '' });

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

  // When Catalogue is parsed from ProductInput
  const handleCatalogueParsed = (data: CatalogueParsedData) => {
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
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userId,
          kind: isPoster ? 'poster' : 'feature',
          slot: currentSlot,
          productName: productName.trim() || 'Sanford Product',
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
    if (!sourceImage.previewUrl) {
      showToast('Please upload a product catalogue or photo first.', 'error');
      return;
    }

    if (!productName.trim()) {
      showToast('Please enter the product name.', 'error');
      return;
    }

    setIsGeneratingAll(true);
    const slotsToRun = sanfordSlots.length > 0 ? sanfordSlots.length : 6;
    const totalCalls = makePoster ? slotsToRun + 1 : slotsToRun;

    try {
      if (settings.styleLock) {
        showToast('Style lock enabled: Generating Slot 1 (Hero) as master reference...');
        const slot1Result = await callGenerateApi(1);

        const remainingPromises: Promise<GenerationItem>[] = [];
        for (let s = 2; s <= slotsToRun; s++) {
          remainingPromises.push(callGenerateApi(s, slot1Result.imagePath));
        }
        if (makePoster) {
          remainingPromises.push(callGenerateApi('poster', slot1Result.imagePath));
        }

        await Promise.allSettled(remainingPromises);
      } else {
        showToast(`Generating ${totalCalls} Sanford e-commerce images in parallel...`);
        const promises: Promise<GenerationItem>[] = [];
        for (let s = 1; s <= slotsToRun; s++) {
          promises.push(callGenerateApi(s));
        }
        if (makePoster) {
          promises.push(callGenerateApi('poster'));
        }

        await Promise.allSettled(promises);
      }

      showToast('Sanford pattern generation batch completed!');

      // Save project state to projectStorage
      setTimeout(async () => {
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
          generations,
        };
        await projectStorage.saveProject(projectPayload);
      }, 500);
    } catch (err: any) {
      console.error('Batch generation error:', err);
      showToast(err.message || 'Error occurred during generation', 'error');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Regenerate single slot
  const handleRegenerateSlot = async (slotOrKind: number | 'poster') => {
    if (!sourceImage.previewUrl) {
      showToast('Product photo required', 'error');
      return;
    }

    showToast(`Regenerating ${slotOrKind === 'poster' ? 'Poster' : `Slot ${slotOrKind}`}...`);

    let styleRef: string | undefined = undefined;
    if (settings.styleLock && slotOrKind !== 1) {
      const slot1 = generations.find((g) => g.kind === 'feature' && g.slot === 1);
      styleRef = slot1?.imagePath;
    }

    await callGenerateApi(slotOrKind, styleRef);
  };

  const toggleSelectCard = (id: string) => {
    setGenerations((prev) =>
      prev.map((g) => (g.id === id ? { ...g, selected: !g.selected } : g))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 py-3 px-4 rounded-xl shadow-2xl border text-xs font-medium flex items-center space-x-2 transition-all ${
            toastMessage.type === 'error'
              ? 'bg-red-950/90 border-red-800 text-red-200'
              : 'bg-indigo-950/90 border-indigo-700 text-indigo-200'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Studio 3-Column Layout */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
            />
          </div>

          {/* Column 2 (Center): Sanford Results Grid (width: 5.5 / 12) */}
          <div className="lg:col-span-5 xl:col-span-5">
            <ResultsGrid
              productName={productName}
              generations={generations}
              makePoster={makePoster}
              setMakePoster={setMakePoster}
              isGeneratingAll={isGeneratingAll}
              onGenerateAll={handleGenerateAll}
              onRegenerateSlot={handleRegenerateSlot}
              toggleSelectCard={toggleSelectCard}
              settings={settings}
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
