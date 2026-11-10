export type EcommercePlatform =
  | 'shopify'
  | 'amazon'
  | 'amazon_aplus'
  | 'noon'
  | 'noon_aplus';

export type AmazonFormat = 'jpeg' | 'png';

export type AmazonComplianceStatus = 'pass' | 'review' | 'failed';

export interface AmazonRuleCheck {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  category: 'technical' | 'content' | 'accuracy';
}

export interface AmazonComplianceResult {
  status: AmazonComplianceStatus;
  score: number;
  rules: AmazonRuleCheck[];
  summary: string;
}

export type NoonComplianceStatus = 'pass' | 'review' | 'failed';

export interface NoonRuleCheck {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  category: 'technical' | 'content' | 'accuracy';
}

export interface NoonComplianceResult {
  status: NoonComplianceStatus;
  score: number;
  rules: NoonRuleCheck[];
  summary: string;
}

export type AmazonAPlusModuleType =
  | 'standard_banner_970x300'
  | 'premium_banner_1464x600'
  | 'triple_card_300x300'
  | 'technical_deepdive_970x600';

export type NoonAPlusModuleType =
  | 'intro_banner_2400x1000'
  | 'primary_features_2400x1200'
  | 'additional_features_2400x1200'
  | 'lifestyle_banner_2400x1000'
  | 'dimensions_2400x1200'
  | 'colors_2400x1000';

export type NoonAPlusLanguage = 'en' | 'ar' | 'both';

export interface StudioSettings {
  model: 'gpt-image-2.5-sunburst' | 'gpt-image-2.5-flare';
  quality: 'low' | 'medium' | 'high' | 'xhigh' | 'max';
  featureSize?: '1024x1024' | '2048x2048';
  posterSize?: '1024x1536' | '1536x1024';
  accentColor?: string; // 'Auto' or hex string '#...'
  styleLock?: boolean;
  imagesPerRun?: number; // 1 to 6
  background?: 'white' | 'pale tint';
  platform?: EcommercePlatform | null;
  amazonFormat?: AmazonFormat;
  amazonResolution?: string;
  amazonValidateCategory?: string;
  noonFormat?: 'jpeg' | 'png' | string;
  noonLanguage?: NoonAPlusLanguage;
  noonResolution?: string;
}

export type SanfordTheme =
  | 'hero'
  | 'lifestyle'
  | 'specs_part_1'
  | 'specs_part_2'
  | 'colors'
  | 'size_warranty'
  | 'poster'
  | 'aplus_standard_banner'
  | 'aplus_premium_banner'
  | 'aplus_triple_card'
  | 'aplus_comparison'
  | 'noon_front'
  | 'noon_back'
  | 'noon_side'
  | 'noon_angle'
  | 'noon_detail'
  | 'noon_lifestyle'
  | 'noon_aplus_intro'
  | 'noon_aplus_features'
  | 'noon_aplus_details'
  | 'noon_aplus_lifestyle'
  | 'noon_aplus_dimensions'
  | 'noon_aplus_colors';

export interface SanfordSlotSpec {
  slot: number;
  theme: SanfordTheme;
  title: string;
  headline?: string;
  promoBanner?: string;
  description?: string;
  features: string[];
  dimensions?: string;
  weight?: string;
  whatsInTheBox?: string[];
  warranty?: string;
  colors?: string;
  platform?: EcommercePlatform;
  aplusType?: AmazonAPlusModuleType;
  noonAplusType?: NoonAPlusModuleType;
  noonLanguage?: NoonAPlusLanguage;
}

export interface GenerationItem {
  id: string;
  projectId: string;
  kind: 'feature' | 'poster';
  slot: number | null; // 1 to 6 for feature, null for poster
  theme?: SanfordTheme;
  slotTitle?: string;
  status: 'idle' | 'pending' | 'done' | 'failed' | 'skipped';
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
  sanfordSlot?: SanfordSlotSpec;
  disabled?: boolean;
  platform?: EcommercePlatform;
  compliance?: AmazonComplianceResult;
  noonCompliance?: NoonComplianceResult;
  exportFormat?: 'webp' | 'jpeg' | 'png';
  noonLanguage?: 'en' | 'ar';
  isApproved?: boolean;
}

export interface CatalogueParsedData {
  productName: string;
  modelNumber: string;
  brand: string;
  tagline: string;
  fullFeatures: string[];
  dimensions?: string;
  weight?: string;
  whatsInTheBox?: string[];
  warranty?: string;
  colors?: string;
  hasMultipleColors?: boolean;
  cropBox?: { ymin: number; xmin: number; ymax: number; xmax: number };
  slots: SanfordSlotSpec[];
}

export interface ProjectData {
  id: string;
  user_id: string;
  product_name: string;
  model_number?: string;
  tagline?: string;
  features: string[];
  colors?: string;
  dimensions?: string;
  weight?: string;
  whats_in_the_box?: string[];
  warranty?: string;
  feature_groups?: string[][];
  source_image_path?: string;
  source_image_data_url?: string;
  catalogue_preview_url?: string;
  created_at: string;
  generations?: GenerationItem[];
  settings?: StudioSettings;
  makePoster?: boolean;
  sanford_slots?: SanfordSlotSpec[];
  platform?: EcommercePlatform | null;
}

export type UserRole = 'admin' | 'staff';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  requested_at: string;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  creditsToday?: number;
  creditsTotal?: number;
  lastActive?: string | null;
}

export interface DailyCreditStat {
  date: string;
  label: string;
  credits: number;
  activeUsers: number;
}

export interface CreditStats {
  creditsToday: number;
  creditsLast24h: number;
  creditsYesterday: number;
  creditsTotal: number;
  dailyBreakdown: DailyCreditStat[];
}
