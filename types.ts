export type AudienceType = 'female' | 'male' | 'girl' | 'boy';

export interface LockedFace {
  base64: string;
  mimeType: string;
}

export interface LibraryAsset {
  id: string;
  src: string;
  videoSrc?: string;
  caption?: {
    vi: string;
    en: string;
  }
  prompt: string;
  inputImages?: LockedFace[];
  isRegenerating?: boolean;
  isGeneratingVariation?: boolean;
  blogTitle?: string;
  blogContent?: string;
  type?: 'kol' | 'outfit' | 'background' | 'video';
}

export interface CalendarRow {
    day: string;
    contentType: string;
    description: string;
    captionTheme: string;
    imagePromptSuggestion: string;
    isGeneratingPost?: boolean;
    isGeneratingImages?: boolean; // Renamed from isGeneratingImage
    generatedPost?: { title: string; caption: string; };
    generatedAssets?: LibraryAsset[]; // Changed from generatedImageSrc
    style?: string;
    customStyle?: string;
    pose?: string;
    customPose?: string;
    cameraAngle?: string;
    customCameraAngle?: string;
    aspectRatio?: string;
    customAspectRatio?: string;
    additionalRequirements?: string;
    variationResult?: { source: LibraryAsset; variations: LibraryAsset[] };
    isGeneratingVariation?: boolean;
}

export interface StrategyItem {
    stage?: string;
    task: string;
    description: string;
    imagePromptSuggestion: string;
    isGeneratingPost?: boolean;
    isGeneratingImages?: boolean; // Renamed from isGeneratingImage
    generatedPost?: { title: string; caption: string; };
    generatedAssets?: LibraryAsset[]; // Changed from generatedImageSrc
    variationResult?: { source: LibraryAsset; variations: LibraryAsset[] };
    isGeneratingVariation?: boolean;
}

export interface VeoModalState {
    isOpen: boolean;
    image: LibraryAsset | null;
    prompts: { prompt: string, title: string }[];
    idea: string;
    isGeneratingVideo: boolean;
    generatedVideoSrc: string | null;
    generatedVideoPrompt: string | null;
    error: string | null;
    aspectRatio: '16:9' | '9:16';
    resolution: '720p' | '1080p';
    negativePrompt: string;
}

export interface QuickEditModalState {
    isOpen: boolean;
    image: LibraryAsset | null;
    editColor: string;
    editOutfitText: string;
    editOutfitSelection: string;
    editPose: string;
    customEditPose: string;
    editAdditionalReqs: string;
    isEditing: boolean;
    // Add rowIndex to know which item to update in Calendar/Strategy tabs
    rowIndex?: number; 
}
