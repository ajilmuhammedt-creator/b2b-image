import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { ProductInput } from '../components/ProductInput';
import { ResultsGrid } from '../components/ResultsGrid';
import { SettingsPanel } from '../components/SettingsPanel';
import { projectStorage } from '../lib/projectStorage';
import type { GenerationItem, ProjectData, StudioSettings } from '../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function Studio() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('project');

  const userId = user?.id || 'demo-supplier';

  // Project state
  const [projectId, setProjectId] = useState<string>(() => crypto.randomUUID());
  const [productName, setProductName] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [colors, setColors] = useState('');
  const [featureGroups, setFeatureGroups] = useState<string[][]>([[], [], [], [], []]);
  const [sourceImage, setSourceImage] = useState<{
    file: File | null;
    previewUrl: string;
    storagePath?: string;
  }>({ file: null, previewUrl: '' });

  // Settings state
  const [settings, setSettings] = useState<StudioSettings>({
    model: 'gpt-image-2.5-sunburst',
    quality: 'medium',
    featureSize: '1024x1024',
    posterSize: '1024x1536',
    accentColor: 'Auto',
    styleLock: false,
    imagesPerRun: 5,
    background: 'white',
  });

  const [makePoster, setMakePoster] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize 5 feature cards + 1 poster card
  const [generations, setGenerations] = useState<GenerationItem[]>(() => {
    const initial: GenerationItem[] = [];
    for (let i = 1; i <= 5; i++) {
      initial.push({
        id: `card-${i}`,
        projectId: '',
        kind: 'feature',
        slot: i,
        status: 'idle',
        selected: false,
      });
    }
    initial.push({
      id: 'card-poster',
      projectId: '',
      kind: 'poster',
      slot: null,
      status: 'idle',
      selected: false,
    });
    return initial;
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Load project if opened from History
  useEffect(() => {
    if (urlProjectId && user?.id) {
      projectStorage.getProjectById(urlProjectId, user.id).then((saved) => {
        if (saved) {
          setProjectId(saved.id);
          setProductName(saved.product_name);
          setFeaturesText(saved.features?.join('\n') || '');
          setColors(saved.colors || '');
          if (saved.feature_groups && saved.feature_groups.length === 5) {
            setFeatureGroups(saved.feature_groups);
          }
          if (saved.source_image_data_url || saved.source_image_path) {
            setSourceImage({
              file: null,
              previewUrl: saved.source_image_data_url || '',
              storagePath: saved.source_image_path,
            });
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

  // Split into 5 groups handler
  const handleSplitGroups = async () => {
    const rawFeatures = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (rawFeatures.length === 0) {
      showToast('Please enter at least 1 feature before splitting.', 'error');
      return;
    }

    setIsSplitting(true);
    try {
      const response = await fetch('/api/split-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productName.trim() || 'Product',
          features: rawFeatures,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to split features');
      }

      const data = await response.json();
      if (Array.isArray(data.groups) && data.groups.length === 5) {
        setFeatureGroups(data.groups);
        // Link groups to cards
        setGenerations((prev) =>
          prev.map((g) => {
            if (g.kind === 'feature' && g.slot && data.groups[g.slot - 1]) {
              return { ...g, featureGroup: data.groups[g.slot - 1] };
            }
            return g;
          })
        );
        showToast('Features split into 5 balanced groups!');
      } else {
        throw new Error('Invalid format returned');
      }
    } catch (err: any) {
      console.warn('API split failed, using local split:', err);
      // Fallback local round-robin split
      const fallback: string[][] = [[], [], [], [], []];
      rawFeatures.forEach((f, i) => fallback[i % 5].push(f));
      setFeatureGroups(fallback);
      showToast('Features grouped into 5 groups');
    } finally {
      setIsSplitting(false);
    }
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

    const slotGroup = !isPoster && currentSlot ? featureGroups[currentSlot - 1] || [] : [];

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
          productName: productName.trim() || 'Product',
          fullFeatures,
          featureGroup: slotGroup,
          colors: colors.trim(),
          sourceImagePath: sourceImage.storagePath,
          sourceImageDataUrl,
          styleRefPath,
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
        status: 'done',
        imageUrl: data.imageUrl,
        imagePath: data.imagePath,
        b64_json: data.b64_json,
        prompt: data.prompt,
        usage: data.usage,
        featureGroup: slotGroup,
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
        status: 'failed',
        error: err.message || 'Generation failed',
        featureGroup: slotGroup,
      };

      setGenerations((prev) => prev.map((g) => (g.id === cardId ? failedCard : g)));
      return failedCard;
    }
  };

  // Check 24-hour spend guard
  const checkSpendGuard = (): boolean => {
    const KEY = 'octopus_generations_24h_count';
    const now = Date.now();
    try {
      const raw = localStorage.getItem(KEY);
      const records: number[] = raw ? JSON.parse(raw) : [];
      // Filter timestamps within last 24h
      const recent = records.filter((ts) => now - ts < 24 * 60 * 60 * 1000);
      if (recent.length >= 50) {
        showToast('24-Hour spend guard reached: 50 generations maximum per day.', 'error');
        return false;
      }
      return true;
    } catch {
      return true;
    }
  };

  const recordGenerationSpend = (count: number) => {
    const KEY = 'octopus_generations_24h_count';
    const now = Date.now();
    try {
      const raw = localStorage.getItem(KEY);
      const records: number[] = raw ? JSON.parse(raw) : [];
      for (let i = 0; i < count; i++) {
        records.push(now);
      }
      localStorage.setItem(KEY, JSON.stringify(records));
    } catch {
      // Ignore
    }
  };

  // Generate All Handler
  const handleGenerateAll = async () => {
    if (!sourceImage.previewUrl) {
      showToast('Please upload a product photo first.', 'error');
      return;
    }

    if (!productName.trim()) {
      showToast('Please enter the product name.', 'error');
      return;
    }

    if (!checkSpendGuard()) {
      return;
    }

    // Auto split if feature groups are empty
    let currentGroups = featureGroups;
    const hasAnyGroups = currentGroups.some((g) => g.length > 0);
    if (!hasAnyGroups) {
      const rawFeatures = featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
      const autoGroups: string[][] = [[], [], [], [], []];
      rawFeatures.forEach((f, i) => autoGroups[i % 5].push(f));
      currentGroups = autoGroups;
      setFeatureGroups(autoGroups);
    }

    setIsGeneratingAll(true);
    const totalCalls = makePoster ? 6 : 5;
    recordGenerationSpend(totalCalls);

    try {
      if (settings.styleLock) {
        // Step 7/8 in plan: When style lock is ON, generate slot 1 first,
        // then slots 2 to 5 with Image 1 as style reference.
        showToast('Style lock enabled: Generating Image 1 as master reference...');
        const slot1Result = await callGenerateApi(1);

        const remainingPromises: Promise<GenerationItem>[] = [];
        for (let slot = 2; slot <= 5; slot++) {
          remainingPromises.push(callGenerateApi(slot, slot1Result.imagePath));
        }
        if (makePoster) {
          remainingPromises.push(callGenerateApi('poster', slot1Result.imagePath));
        }

        await Promise.allSettled(remainingPromises);
      } else {
        // Standard run: Fire all 5 (or 6) in parallel!
        showToast(`Generating ${totalCalls} images in parallel...`);
        const promises: Promise<GenerationItem>[] = [];
        for (let slot = 1; slot <= 5; slot++) {
          promises.push(callGenerateApi(slot));
        }
        if (makePoster) {
          promises.push(callGenerateApi('poster'));
        }

        await Promise.allSettled(promises);
      }

      showToast('Image generation batch completed!');

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
          features: featuresText.split('\n').filter((f) => f.trim().length > 0),
          colors,
          feature_groups: currentGroups,
          source_image_path: sourceImage.storagePath,
          source_image_data_url: previewDataUrl,
          created_at: new Date().toISOString(),
          settings,
          makePoster,
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
    if (!checkSpendGuard()) return;

    recordGenerationSpend(1);
    showToast(`Regenerating ${slotOrKind === 'poster' ? 'Poster' : `Image ${slotOrKind}`}...`);

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
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1 (Left): Product Input (width: 3.5 / 12) */}
          <div className="lg:col-span-3 xl:col-span-3">
            <ProductInput
              userId={userId}
              projectId={projectId}
              productName={productName}
              setProductName={setProductName}
              featuresText={featuresText}
              setFeaturesText={setFeaturesText}
              colors={colors}
              setColors={setColors}
              featureGroups={featureGroups}
              setFeatureGroups={setFeatureGroups}
              sourceImage={sourceImage}
              setSourceImage={setSourceImage}
              onSplitGroups={handleSplitGroups}
              isSplitting={isSplitting}
            />
          </div>

          {/* Column 2 (Center): Results Grid (width: 6.5 / 12) */}
          <div className="lg:col-span-6 xl:col-span-6">
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
