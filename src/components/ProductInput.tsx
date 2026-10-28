import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { UploadCloud, X, Split, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProductInputProps {
  userId: string;
  projectId: string;
  productName: string;
  setProductName: (name: string) => void;
  featuresText: string;
  setFeaturesText: (text: string) => void;
  colors: string;
  setColors: (colors: string) => void;
  featureGroups: string[][];
  setFeatureGroups: (groups: string[][]) => void;
  sourceImage: {
    file: File | null;
    previewUrl: string;
    storagePath?: string;
  };
  setSourceImage: (img: { file: File | null; previewUrl: string; storagePath?: string }) => void;
  onSplitGroups: () => Promise<void>;
  isSplitting: boolean;
}

export function ProductInput({
  userId,
  projectId,
  productName,
  setProductName,
  featuresText,
  setFeaturesText,
  colors,
  setColors,
  featureGroups,
  setFeatureGroups,
  sourceImage,
  setSourceImage,
  onSplitGroups,
  isSplitting,
}: ProductInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setUploadError(null);

    // Validate type: PNG, JPG, WebP
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a PNG, JPG, or WebP product photo.');
      return;
    }

    // Validate size: max 10MB
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError('Image size exceeds 10 MB limit.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setIsUploading(true);

    try {
      // Direct upload to Supabase source-images bucket: {userId}/{projectId}/original.png
      const fileExt = file.name.split('.').pop() || 'png';
      const storagePath = `${userId}/${projectId}/original.${fileExt}`;

      const { error } = await supabase.storage
        .from('source-images')
        .upload(storagePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        console.warn('Storage upload note:', error.message);
      }

      setSourceImage({
        file,
        previewUrl,
        storagePath,
      });
    } catch (err: any) {
      console.warn('Supabase upload exception:', err);
      // Fallback: still keep local preview and file for direct API transmission
      setSourceImage({
        file,
        previewUrl,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileProcess(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSourceImage({ file: null, previewUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadExamplePreset = () => {
    setProductName('Portable Handheld Mini Fan');
    setFeaturesText(
      `5500 RPM brushless motor
Three adjustable speeds (Low, Medium, High)
Up to 4.5 hours continuous runtime on low speed
Removable 1800mAh rechargeable lithium battery
Type-C fast charging port with 5-hour full recharge time
Red and green LED charging status indicators
Built-in folding phone holder stand in base
Compact ergonomic ultra-portable pocket design
Four vibrant pastel finishes: Sky Blue, Yellow, Light Pink, Green`
    );
    setColors('Sky Blue, Yellow, Light Pink, Green');
    setFeatureGroups([
      ['5500 RPM brushless motor', 'Three adjustable speeds (Low, Medium, High)'],
      ['Up to 4.5 hours continuous runtime on low speed', 'Removable 1800mAh rechargeable lithium battery'],
      ['Type-C fast charging port', '5-hour full recharge time', 'Red and green LED charging indicators'],
      ['Built-in folding phone holder stand in base', 'Compact ergonomic ultra-portable pocket design'],
      ['Four vibrant pastel finishes: Sky Blue, Yellow, Light Pink, Green'],
    ]);
  };

  const handleGroupTextChange = (groupIndex: number, text: string) => {
    const updated = [...featureGroups];
    updated[groupIndex] = text.split('\n').filter((f) => f.trim() !== '');
    setFeatureGroups(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white">Product Input</h2>
          <p className="text-xs text-slate-400">Photo & specifications</p>
        </div>
        <button
          type="button"
          onClick={loadExamplePreset}
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/30 transition flex items-center space-x-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Preset</span>
        </button>
      </div>

      {/* Drag & Drop Photo Upload */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
          White-Background Product Photo <span className="text-indigo-400">*</span>
        </label>

        {sourceImage.previewUrl ? (
          <div className="relative rounded-xl border border-slate-700 bg-slate-950 p-2 flex items-center justify-center overflow-hidden group">
            <img
              src={sourceImage.previewUrl}
              alt="Product source"
              className="max-h-48 object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 p-1.5 bg-slate-900/90 text-slate-300 hover:text-red-400 hover:bg-slate-900 rounded-lg border border-slate-700 shadow-md transition"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-slate-400 border border-slate-800">
              {sourceImage.file?.name || 'Attached photo'}
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-slate-200">
                  {isUploading ? 'Processing photo...' : 'Click or drag product photo'}
                </p>
                <p className="text-[11px] text-slate-400">
                  PNG, JPG, or WebP (max 10 MB). White background recommended.
                </p>
              </div>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="flex items-center space-x-1.5 text-xs text-red-400 pt-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Product Name */}
      <div className="space-y-1.5">
        <label htmlFor="productName" className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
          Product Name <span className="text-indigo-400">*</span>
        </label>
        <input
          id="productName"
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="e.g. Ergonomic Standing Desk Converter"
          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Verified Feature List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="featuresText" className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
            Verified Feature List <span className="text-indigo-400">*</span>
          </label>
          <span className="text-[11px] text-slate-500">One feature per line</span>
        </div>
        <textarea
          id="featuresText"
          rows={5}
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          placeholder="5500 RPM brushless motor&#10;Three adjustable speeds&#10;Up to 4.5 hours runtime&#10;Type-C fast charging"
          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono leading-relaxed resize-y"
        />
      </div>

      {/* Colors (Optional) */}
      <div className="space-y-1.5">
        <label htmlFor="colors" className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
          Colours Available <span className="text-slate-500 text-[10px]">(Optional)</span>
        </label>
        <input
          id="colors"
          type="text"
          value={colors}
          onChange={(e) => setColors(e.target.value)}
          placeholder="e.g. Matte Black, Arctic White, Silver"
          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Split into 5 Groups Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSplitGroups}
          disabled={isSplitting || !featuresText.trim()}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs uppercase tracking-wider rounded-lg shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2"
        >
          {isSplitting ? (
            <>
              <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
              <span>Splitting Features...</span>
            </>
          ) : (
            <>
              <Split className="w-4 h-4" />
              <span>Split Into 5 Groups</span>
            </>
          )}
        </button>
      </div>

      {/* 5 Editable Group Boxes */}
      {featureGroups && featureGroups.length === 5 && (
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              5 Image Feature Groups
            </span>
            <span className="text-[10px] text-slate-500">Editable before generation</span>
          </div>

          <div className="space-y-2.5">
            {featureGroups.map((group, index) => (
              <div key={index} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-indigo-400">
                  <span>Image {index + 1} Features</span>
                  <span className="text-[10px] text-slate-500">{group.length} item(s)</span>
                </div>
                <textarea
                  rows={Math.max(2, group.length)}
                  value={group.join('\n')}
                  onChange={(e) => handleGroupTextChange(index, e.target.value)}
                  placeholder={`Features for image ${index + 1}...`}
                  className="w-full bg-transparent border-0 p-0 text-xs text-slate-200 placeholder-slate-600 focus:ring-0 resize-y font-sans leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
