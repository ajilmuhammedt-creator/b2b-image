export interface StudioSettings {
  model: 'gpt-image-2.5-sunburst' | 'gpt-image-2.5-flare';
  quality: 'low' | 'medium' | 'high' | 'xhigh' | 'max';
  featureSize: '1024x1024' | '2048x2048';
  posterSize: '1024x1536' | '1536x1024';
  accentColor: string; // 'Auto' or hex string '#...'
  styleLock: boolean;
  imagesPerRun: number; // 1 to 5
  background: 'white' | 'pale tint';
}

export interface GenerationItem {
  id: string;
  projectId: string;
  kind: 'feature' | 'poster';
  slot: number | null; // 1 to 5 for feature, null for poster
  status: 'idle' | 'pending' | 'done' | 'failed';
  imageUrl?: string;
  imagePath?: string;
  b64_json?: string;
  prompt?: string;
  error?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
  selected?: boolean;
  featureGroup?: string[];
}

export interface ProjectData {
  id: string;
  user_id: string;
  product_name: string;
  features: string[];
  colors?: string;
  feature_groups: string[][];
  source_image_path?: string;
  source_image_data_url?: string;
  created_at: string;
  generations?: GenerationItem[];
  settings?: StudioSettings;
  makePoster?: boolean;
}

