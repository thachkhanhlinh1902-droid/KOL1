

import React, { useState, FC, SVGProps, useEffect, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import { generateContent, extractOutfitFromImage, generatePromptFromImage, editImage, generateRichPrompt, generateCreativeVariationPrompts, extractBackgroundFromImage, getLandmarksForLocation, MODEL_IMAGE_FLASH, MODEL_IMAGE_PRO } from '../services/geminiService';
import { contentOptions, bodyTypeOptions, poseOptions, cameraAngleOptions, aspectRatioOptions, interactionOptions, kolCharacterOptions, museOptions, nudeArtOptions, mirrorSelfieContextOptions, handheldSelfieContextOptions, costumeOptions, hairStylingOptions, skinToneOptions } from '../data/contentOptions';
import { LockedFace, LibraryAsset, AudienceType, QuickEditModalState } from '../types';
import { WandIcon, ShirtIcon, SparklesIcon, SaveIcon, DownloadIcon, SearchIcon, DocumentDuplicateIcon, PaletteIcon, VideoCameraIcon, XMarkIcon, PhotoIcon, MegaphoneIcon, StarIcon, LightbulbIcon, DocumentTextIcon, CalendarDaysIcon, ChartBarIcon, RefreshIcon, UserGroupIcon, PoseIcon, LockClosedIcon, GlobeAltIcon, MapPinIcon, DevicePhoneMobileIcon, UserCircleIcon, TagIcon, ScissorsIcon } from './icons';

// Types for the new, grouped kolCharacterOptions structure
interface KolOption {
    label: string;
    items?: string[];
    type?: 'input';
}

interface KolOptionGroup {
    label: string;
    options: Record<string, KolOption>;
}

interface KolCategory {
    label: string;
    groups: Record<string, KolOptionGroup>;
}

type KolCharacterData = Record<string, KolCategory>;

interface AdditionalKOL {
    id: number;
    face: LockedFace;
    audienceType: AudienceType;
    clothing: string;
    customClothing: string;
    outfitImage: LockedFace | null;
    bodyType: string;
    customBodyType: string;
}

interface TravelLandmarkConfig {
    name: string;
    selected: boolean;
    outfit: string;
    customOutfit: string;
    pose: string;
    customPose: string;
    imageCount: number;
}


// UTILS
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const handleDownloadImage = (imageSrc: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const loadingMessages = [
    "Khởi tạo mô hình AI...",
    "Đánh thức các нейрон thần kinh...",
    "Phân tích yêu cầu sáng tạo...",
    "Tham khảo hàng triệu tác phẩm nghệ thuật...",
    "Pha một tách cà phê cho AI...",
    "Sắp xếp các điểm ảnh nghệ thuật...",
    "Tinh chỉnh ánh sáng và bóng đổ...",
    "Thêm một chút ma thuật...",
    "Hoàn thiện tác phẩm...",
];

// HELPER COMPONENTS
const CustomizableSelect: FC<{
    label: string;
    selectedValue: string;
    onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    customValue: string;
    onCustomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    options: string[];
    disabled?: boolean;
}> = ({ label, selectedValue, onSelectChange, customValue, onCustomChange, options, disabled = false }) => {
    const allOptions = ["Không thay đổi", "Tự động (AI Quyết định)", "Tùy chỉnh...", ...options];
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <select value={selectedValue} onChange={onSelectChange} disabled={disabled} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-700 disabled:cursor-not-allowed">
                {allOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {selectedValue === 'Tùy chỉnh...' && !disabled && (
                <input
                    type="text"
                    value={customValue}
                    onChange={onCustomChange}
                    placeholder={`Nhập ${label.toLowerCase()} tùy chỉnh...`}
                    className="mt-2 w-full bg-gray-600 border border-gray-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
            )}
        </div>
    );
};

const SimpleSelect: FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
}> = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1 truncate" title={label}>{label}</label>
        <select value={value} onChange={onChange} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            {["Tự động", ...options].map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


const renderImageUploader = (onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void, image: LockedFace | null, text: string, id: string = "file-upload", onDelete?: () => void) => (
    <div className="relative mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
        {image && onDelete && (
             <button
                onClick={onDelete}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors z-10"
                title="Xóa ảnh"
            >
                <XMarkIcon className="h-4 w-4" />
            </button>
        )}
        <div className="space-y-1 text-center">
            {image ? (
                <img src={`data:${image.mimeType};base64,${image.base64}`} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-md" />
            ) : (
                <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
            <div className="flex text-sm text-gray-500 justify-center">
                <label htmlFor={id} className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500 px-2">
                    <span>{text}</span>
                    <input id={id} name={id} type="file" className="sr-only" onChange={onFileChange} accept="image/png, image/jpeg, image/webp" />
                </label>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
        </div>
    </div>
);

// PROPS
interface ControlsProps {
    kolName: string;
    setKolName: (name: string) => void;
    audienceType: AudienceType;
    handleAudienceChange: (audience: AudienceType) => void;
    lockedFace: LockedFace | null;
    setLockedFace: (face: LockedFace | null) => void;
    skinTone: string;
    handleSkinToneChange: (tone: string) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    handleGenerateKOLName: () => Promise<void>;
    renderNavButton: (tabId: string, icon: React.ReactElement<SVGProps<SVGSVGElement>>, text: string) => React.ReactElement;
}

interface CreativeTabProps {
    activeTab: string;
    audienceType: AudienceType;
    kolName: string;
    lockedFace: LockedFace | null;
    skinTone: string;
    handleSaveToLibrary: (asset: LibraryAsset) => void;
    handleOpenVeoModal: (image: LibraryAsset) => void;
    setLightboxImageSrc: (src: string | null) => void;
    setLibrary: React.Dispatch<React.SetStateAction<LibraryAsset[]>>;
    setLockedFace: (face: LockedFace | null) => void;
    setActiveTab: (tab: string) => void;
    setIsLibraryOpen: (isOpen: boolean) => void;
    setLibraryFilter: (filter: 'all' | 'kol_video' | 'outfit' | 'background') => void;
}

export const Controls: FC<ControlsProps> = ({
    kolName,
    setKolName,
    audienceType,
    handleAudienceChange,
    lockedFace,
    setLockedFace,
    skinTone,
    handleSkinToneChange,
    activeTab,
    setActiveTab,
    handleGenerateKOLName,
    renderNavButton,
}) => {
    const [isNameLoading, setIsNameLoading] = useState(false);

    const onGenerateKOLName = async () => {
        setIsNameLoading(true);
        await handleGenerateKOLName();
        setIsNameLoading(false);
    };

    const handleFaceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = (await fileToBase64(file)).split(',')[1];
            setLockedFace({ base64, mimeType: file.type });
        }
    };

    return (
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">1. Cài đặt KOL</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tên KOL</label>
                        <div className="flex gap-2">
                            <input type="text" value={kolName} onChange={(e) => setKolName(e.target.value)} placeholder="Nhập tên hoặc để AI tạo" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                            <button onClick={onGenerateKOLName} disabled={isNameLoading} className="bg-indigo-600 text-white px-3 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 flex-shrink-0">
                                {isNameLoading ? '...' : <SparklesIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Đối tượng mục tiêu</label>
                        <select value={audienceType} onChange={(e) => handleAudienceChange(e.target.value as AudienceType)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                            <option value="female">Nữ (trưởng thành)</option>
                            <option value="male">Nam (trưởng thành)</option>
                            <option value="girl">Bé gái</option>
                            <option value="boy">Bé trai</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Khóa gương mặt (Face Lock)</label>
                        <p className="text-xs text-gray-400 mb-2">Tải ảnh chân dung rõ mặt để AI giữ lại đặc điểm gương mặt cho các lần tạo ảnh sau.</p>
                        {renderImageUploader(handleFaceFileChange, lockedFace, "Tải ảnh gương mặt", "face-upload", () => setLockedFace(null))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tông màu da</label>
                        <select value={skinTone} onChange={(e) => handleSkinToneChange(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                           {["Tự động (AI Quyết định)", ...skinToneOptions].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">2. Chọn Chức năng</h2>
                <div className="grid grid-cols-3 gap-2">
                    {renderNavButton('creative', <PhotoIcon />, 'Ảnh Sáng tạo')}
                    {renderNavButton('ads', <MegaphoneIcon />, 'Quảng cáo')}
                    {renderNavButton('outfit', <ShirtIcon />, 'Thử đồ')}
                    {renderNavButton('pro', <StarIcon />, 'Studio KOL')}
                    {renderNavButton('interpolation', <DocumentDuplicateIcon />, 'Nội suy')}
                    {renderNavButton('transform', <WandIcon />, 'Biến đổi')}
                    {renderNavButton('multi-kol', <UserGroupIcon />, 'Đa KOL')}
                    {renderNavButton('pose', <PoseIcon />, 'Đổi tư thế')}
                    {renderNavButton('muse', <PaletteIcon />, 'Nàng thơ')}
                    {renderNavButton('background', <GlobeAltIcon />, 'Tách nền')}
                    {renderNavButton('travel', <MapPinIcon />, 'Du lịch')}
                    {renderNavButton('selfie', <DevicePhoneMobileIcon />, 'Selfie')}
                    {renderNavButton('hair', <ScissorsIcon />, 'Làm tóc')}
                    {renderNavButton('suggestion', <LightbulbIcon />, 'Gợi ý AI')}
                    {renderNavButton('captions', <DocumentTextIcon />, 'Caption')}
                    {renderNavButton('calendar', <CalendarDaysIcon />, 'Lịch ND')}
                    {renderNavButton('strategy', <ChartBarIcon />, 'Chiến lược')}
                    {renderNavButton('affiliate', <TagIcon />, 'Affiliate')}
                </div>
            </div>
        </div>
    );
};


// CreativeTab Component
const CreativeTab: FC<CreativeTabProps> = ({
    activeTab, audienceType, kolName, lockedFace, skinTone, handleSaveToLibrary,
    handleOpenVeoModal, setLightboxImageSrc, setLibrary, setLockedFace, setActiveTab,
    setIsLibraryOpen, setLibraryFilter
}) => {
    // Local State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    
    const [generatedImages, setGeneratedImages] = useState<LibraryAsset[]>([]);
    const [variationResults, setVariationResults] = useState<{source: LibraryAsset, variations: LibraryAsset[]} | null>(null);
    const [numImages, setNumImages] = useState(4);
    const [aiModel, setAiModel] = useState<string>(MODEL_IMAGE_FLASH);
    
    const [context, setContext] = useState('Tự động (AI Quyết định)');
    const [clothing, setClothing] = useState('Tự động (AI Quyết định)');
    const [style, setStyle] = useState('Tự động (AI Quyết định)');
    const [bodyType, setBodyType] = useState('Tự động (AI Quyết định)');
    const [pose, setPose] = useState('Tự động (AI Quyết định)');
    const [cameraAngle, setCameraAngle] = useState('Tự động (AI Quyết định)');
    const [aspectRatio, setAspectRatio] = useState(aspectRatioOptions[0]);
    const [additionalRequirements, setAdditionalRequirements] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');

    const [customContext, setCustomContext] = useState('');
    const [customClothing, setCustomClothing] = useState('');
    const [customStyle, setCustomStyle] = useState('');
    const [customBodyType, setCustomBodyType] = useState('');
    const [customPose, setCustomPose] = useState('');
    const [customCameraAngle, setCustomCameraAngle] = useState('');
    const [customAspectRatio, setCustomAspectRatio] = useState('');
    
    // Ads state
    const [productDescription, setProductDescription] = useState('');
    const [interactionDescription, setInteractionDescription] = useState('');
    const [productImages, setProductImages] = useState<LockedFace[]>([]);
    const [addTextToAd, setAddTextToAd] = useState(true);
    
    // Outfit state
    const [outfitImages, setOutfitImages] = useState<LockedFace[]>([]);
    const [outfitExtractionSource, setOutfitExtractionSource] = useState<LockedFace | null>(null);
    const [isExtractingOutfit, setIsExtractingOutfit] = useState(false);
    const [extractedOutfit, setExtractedOutfit] = useState<LibraryAsset | null>(null);
    const [creativeBackgroundImage, setCreativeBackgroundImage] = useState<LockedFace | null>(null);
    const [outfitInstructions, setOutfitInstructions] = useState('');

    // Pro state
    const [proBackgroundImage, setProBackgroundImage] = useState<LockedFace | null>(null);
    const [proClothingImage, setProClothingImage] = useState<LockedFace | null>(null);
    const [isMagazineCover, setIsMagazineCover] = useState(false);

    // Interpolation state
    const [interpolationSampleImage, setInterpolationSampleImage] = useState<LockedFace | null>(null);
    const [interpolatedPrompt, setInterpolatedPrompt] = useState<string>('');
    const [isInterpolatingPrompt, setIsInterpolatingPrompt] = useState<boolean>(false);
    const [isCopyingStyle, setIsCopyingStyle] = useState(false);
    const [copyHairColor, setCopyHairColor] = useState(true);
    const [copyHairStyle, setCopyHairStyle] = useState(true);
    const [removeTattoo, setRemoveTattoo] = useState(true);

    // Transform state
    const [transformSourceImage, setTransformSourceImage] = useState<LockedFace | null>(null);
    const [transformInstruction, setTransformInstruction] = useState('');

    // Multi-KOL state
    const [additionalKOLs, setAdditionalKOLs] = useState<AdditionalKOL[]>([]);
    const [interaction, setInteraction] = useState(interactionOptions[0]);
    const [customInteraction, setCustomInteraction] = useState('');
    
    // Pose state
    const [poseSourceImage, setPoseSourceImage] = useState<LockedFace | null>(null);
    const [poseReferenceImage, setPoseReferenceImage] = useState<LockedFace | null>(null);
    const [poseDescription, setPoseDescription] = useState('');

    // Art Studio state
    const [studioMode, setStudioMode] = useState<'muse' | 'nude' | 'costume'>('muse');
    const [museOutfit, setMuseOutfit] = useState(museOptions.outfits[0]);
    const [museAccessory, setMuseAccessory] = useState(museOptions.accessories[0]);
    const [museBackground, setMuseBackground] = useState(museOptions.backgrounds[0]);
    const [museLighting, setMuseLighting] = useState(museOptions.lighting[0]);
    const [customMuseOutfit, setCustomMuseOutfit] = useState('');
    const [customMuseAccessory, setCustomMuseAccessory] = useState('');
    const [customMuseBackground, setCustomMuseBackground] = useState('');
    const [customMuseLighting, setCustomMuseLighting] = useState('');
    const [museBackgroundImage, setMuseBackgroundImage] = useState<LockedFace | null>(null);
    
    // Nude Art state
    const [nudeConcealmentLevel, setNudeConcealmentLevel] = useState(nudeArtOptions.concealmentLevels[0]);
    const [nudeConcealmentTechnique, setNudeConcealmentTechnique] = useState(nudeArtOptions.concealmentTechniques[0]);
    const [customNudeConcealmentLevel, setCustomNudeConcealmentLevel] = useState('');
    const [customNudeConcealmentTechnique, setCustomNudeConcealmentTechnique] = useState('');

    // Art Studio - Costume state (for kids)
    const [costumeCharacter, setCostumeCharacter] = useState(costumeOptions.girl.characters[0]);
    const [costumeOutfit, setCostumeOutfit] = useState(costumeOptions.girl.outfits[0]);
    const [costumeBackground, setCostumeBackground] = useState(costumeOptions.girl.backgrounds[0]);
    const [customCostumeCharacter, setCustomCostumeCharacter] = useState('');
    const [customCostumeOutfit, setCustomCostumeOutfit] = useState('');
    const [customCostumeBackground, setCustomCostumeBackground] = useState('');

    // Quick Edit Modal State
    const [editModalState, setEditModalState] = useState<QuickEditModalState>({ isOpen: false, image: null, editColor: '', editOutfitText: '', editOutfitSelection: 'Không thay đổi', editPose: 'Không thay đổi', customEditPose: '', editAdditionalReqs: '', isEditing: false });

    // Suggestion Prompt state
    const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
    
    // State for KOL Character Creation
    const [kolOptions, setKolOptions] = useState<Record<string, Record<string, string>>>({});
    const [activeKolCategory, setActiveKolCategory] = useState<string>('face');
    
    // Background Tab State
    const [backgroundSourceImage, setBackgroundSourceImage] = useState<LockedFace | null>(null);
    const [isExtractingBackground, setIsExtractingBackground] = useState(false);
    const [extractedBackground, setExtractedBackground] = useState<LibraryAsset | null>(null);

    // Travel Tab State
    const [travelLocation, setTravelLocation] = useState('');
    const [isSearchingLandmarks, setIsSearchingLandmarks] = useState(false);
    const [travelLandmarks, setTravelLandmarks] = useState<TravelLandmarkConfig[]>([]);

    // Selfie Tab State
    const [isMirrorSelfie, setIsMirrorSelfie] = useState(false);
    const [selfieBackground, setSelfieBackground] = useState('Tự động (AI Quyết định)');
    const [customSelfieBackground, setCustomSelfieBackground] = useState('');
    const [phoneVisible, setPhoneVisible] = useState(true);
    const [selfieFraming, setSelfieFraming] = useState('Tự động (AI Quyết định)');
    const [customSelfieFraming, setCustomSelfieFraming] = useState('');


    // Hair Tab State
    const [hairStyle, setHairStyle] = useState('Tự động (AI Quyết định)');
    const [customHairStyle, setCustomHairStyle] = useState('');
    const [hairColor, setHairColor] = useState('Tự động (AI Quyết định)');
    const [customHairColor, setCustomHairColor] = useState('');
    const [hairAccessory, setHairAccessory] = useState('Không có');
    const [customHairAccessory, setCustomHairAccessory] = useState('');

    const abortControllerRef = useRef<AbortController | null>(null);

    const isCreatingKOL = activeTab === 'pro' && !lockedFace;

    // Loading message effect
    const intervalRef = useRef<number | null>(null);
    useEffect(() => {
        if (isLoading) {
            setLoadingMessage(loadingMessages[0]);
            let index = 1;
            intervalRef.current = window.setInterval(() => {
                setLoadingMessage(loadingMessages[index % loadingMessages.length]);
                index++;
            }, 2500);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isLoading]);
    
    useEffect(() => {
        // This effect resets tab-specific state when the active tab changes
        // to prevent settings from one tab unintentionally affecting another.

        // Reset general custom prompt for all tab changes
        setCustomPrompt('');
        setAdditionalRequirements('');
        
        // Reset non-image results
        setError(null);

        // Reset state based on which tab is NOT active
        if (activeTab !== 'creative') {
            setCreativeBackgroundImage(null);
        }
        if (activeTab !== 'ads') {
            setProductDescription('');
            setInteractionDescription('');
            setProductImages([]);
            setAddTextToAd(true);
        }
        if (activeTab !== 'outfit') {
            setOutfitImages([]);
            setOutfitExtractionSource(null);
            setExtractedOutfit(null);
            setOutfitInstructions('');
        }
        if (activeTab !== 'pro') {
            setProBackgroundImage(null);
            setProClothingImage(null);
            setIsMagazineCover(false);
            // Not resetting kolOptions to preserve user's character design work
        }
        if (activeTab !== 'interpolation') {
            setInterpolationSampleImage(null);
            setInterpolatedPrompt('');
        }
         if (activeTab !== 'transform') {
            setTransformSourceImage(null);
            setTransformInstruction('');
        }
        if (activeTab !== 'multi-kol') {
            setAdditionalKOLs([]);
            setInteraction(interactionOptions[0]);
            setCustomInteraction('');
        }
        if (activeTab !== 'pose') {
            setPoseSourceImage(null);
            setPoseReferenceImage(null);
            setPoseDescription('');
        }
        if (activeTab !== 'muse') {
            setStudioMode('muse');
            setMuseOutfit(museOptions.outfits[0]);
            setMuseAccessory(museOptions.accessories[0]);
            setMuseBackground(museOptions.backgrounds[0]);
            setMuseLighting(museOptions.lighting[0]);
            setCustomMuseOutfit('');
            setCustomMuseAccessory('');
            setCustomMuseBackground('');
            setCustomMuseLighting('');
            setNudeConcealmentLevel(nudeArtOptions.concealmentLevels[0]);
            setNudeConcealmentTechnique(nudeArtOptions.concealmentTechniques[0]);
            setCustomNudeConcealmentLevel('');
            setCustomNudeConcealmentTechnique('');
            setMuseBackgroundImage(null);
            const currentCostumeDefaults = (costumeOptions as any)[audienceType] || costumeOptions.girl;
            setCostumeCharacter(currentCostumeDefaults.characters[0]);
            setCostumeOutfit(currentCostumeDefaults.outfits[0]);
            setCostumeBackground(currentCostumeDefaults.backgrounds[0]);
        }
        if (activeTab !== 'background') {
            setBackgroundSourceImage(null);
            setExtractedBackground(null);
        }
        if (activeTab !== 'travel') {
            setTravelLocation('');
            setTravelLandmarks([]);
        }
        if (activeTab !== 'selfie') {
            setIsMirrorSelfie(false);
            setSelfieBackground('Tự động (AI Quyết định)');
            setCustomSelfieBackground('');
            setPhoneVisible(true);
            setSelfieFraming('Tự động (AI Quyết định)');
            setCustomSelfieFraming('');
        }
        if (activeTab !== 'hair') {
            setHairStyle('Tự động (AI Quyết định)');
            setCustomHairStyle('');
            setHairColor('Tự động (AI Quyết định)');
            setCustomHairColor('');
            setHairAccessory('Không có');
            setCustomHairAccessory('');
        }

    }, [activeTab, audienceType]);

    // Update count when model changes
    useEffect(() => {
        if (aiModel === MODEL_IMAGE_PRO) {
            setNumImages(1);
        }
    }, [aiModel]);

    const handleRegenerate = async (image: LibraryAsset) => {
        setIsLoading(true);
        setError(null);
        setLibrary(prev => prev.map(img => img.id === image.id ? { ...img, isRegenerating: true } : img));
        try {
            const sourceImagePart: LockedFace = {
                base64: image.src.split(',')[1],
                mimeType: image.src.match(/data:(image\/[^;]+);/)?.[1] || 'image/png'
            };
            
            const imagesToUse = image.inputImages ? [...image.inputImages] : [sourceImagePart];
            
            // Ensure the primary face is always the first one if a global lockedFace exists
            if (lockedFace) {
                 const existingFaceIndex = imagesToUse.findIndex(img => img.base64 === lockedFace.base64);
                 if (existingFaceIndex > 0) {
                    // move it to the front
                    const [face] = imagesToUse.splice(existingFaceIndex, 1);
                    imagesToUse.unshift(face);
                 } else if (existingFaceIndex === -1) {
                    imagesToUse.unshift(lockedFace);
                 }
            }

            const results = await generateContent({ prompt: image.prompt }, imagesToUse, 1, undefined, undefined, aiModel);
            const newImage = { ...image, src: results[0], isRegenerating: false };
            setLibrary(prev => prev.map(img => img.id === image.id ? newImage : img));
        } catch (e) {
            const message = e instanceof Error ? e.message : "Đã xảy ra lỗi không xác định.";
            setError(message);
        } finally {
            setIsLoading(false);
            setLibrary(prev => prev.map(img => img.id === image.id ? { ...img, isRegenerating: false } : img));
        }
    };


    // FIX: Add explicit types for iterated values to prevent 'unknown' type errors, which can occur when type inference is disrupted (e.g., by JSON.parse in imported data).
    const initializeKolOptions = useCallback((audience: AudienceType) => {
        const optionsData = kolCharacterOptions[audience] as KolCharacterData;
        const initialState: Record<string, Record<string, string>> = {};
        // FIX: Add explicit types for iterated values to prevent 'unknown' type errors, which can occur when type inference is disrupted (e.g., by JSON.parse in imported data).
        Object.entries(optionsData).forEach(([categoryKey, categoryValueUntyped]) => {
            const categoryValue = categoryValueUntyped as KolCategory;
            initialState[categoryKey] = {};
            Object.values(categoryValue.groups).forEach((group: KolOptionGroup) => {
                // FIX: Explicitly type the destructured arguments from `Object.entries` to resolve the `unknown` type error on `optionValue`.
                Object.entries(group.options).forEach(([optionKey, value]) => {
                    const optionValue = value as KolOption;
                    if (optionValue.type === 'input') {
                        initialState[categoryKey][optionKey] = '';
                    } else {
                        initialState[categoryKey][optionKey] = "Tự động";
                    }
                });
            });
        });
        setKolOptions(initialState);
        const firstCategory = Object.keys(optionsData)[0];
        if (firstCategory) {
            setActiveKolCategory(firstCategory);
        }
    }, []);

    useEffect(() => {
        initializeKolOptions(audienceType);
        // Reset costume state based on new audience type
        const currentCostumeDefaults = (audienceType === 'girl' || audienceType === 'boy') ? costumeOptions[audienceType] : costumeOptions.girl;
        setCostumeCharacter(currentCostumeDefaults.characters[0]);
        setCostumeOutfit(currentCostumeDefaults.outfits[0]);
        setCostumeBackground(currentCostumeDefaults.backgrounds[0]);

        // Reset studio mode if it's 'nude' and audience is switched to a child
        if ((audienceType === 'girl' || audienceType === 'boy') && studioMode === 'nude') {
            setStudioMode('muse');
        }

    }, [audienceType, initializeKolOptions, studioMode]);

    const handleKolOptionChange = (category: string, option: string, value: string) => {
        setKolOptions(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [option]: value,
            }
        }));
    };


    // Effect to check for assets from library
    useEffect(() => {
        const checkSessionStorage = () => {
            const suggestionPrompt = sessionStorage.getItem('suggestionPrompt');
            if (suggestionPrompt) {
                setCustomPrompt(suggestionPrompt);
                sessionStorage.removeItem('suggestionPrompt');
            }
            
            const backgroundToUse = sessionStorage.getItem('backgroundToUse');
            if (backgroundToUse) {
                try {
                    const parsedBg = JSON.parse(backgroundToUse) as LockedFace;
                    setCreativeBackgroundImage(parsedBg);
                    setProBackgroundImage(parsedBg);
                } catch (e) { console.error("Failed to parse background from storage", e)}
                sessionStorage.removeItem('backgroundToUse');
            }
            
            const outfitToUse = sessionStorage.getItem('outfitToUse');
            if (outfitToUse) {
                try {
                    const parsedOutfit = JSON.parse(outfitToUse) as LockedFace;
                    setOutfitImages(prev => {
                        if (prev.some(p => p.base64 === parsedOutfit.base64)) return prev;
                        return [parsedOutfit, ...prev];
                    });
                } catch (e) { console.error("Failed to parse outfit from storage", e)}
                sessionStorage.removeItem('outfitToUse');
            }
        };

        checkSessionStorage();

        window.addEventListener('focus', checkSessionStorage);
    
        return () => {
            window.removeEventListener('focus', checkSessionStorage);
        };
    }, [activeTab]);

    
    // Handlers
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, imageSetter: (image: LockedFace | null) => void) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = (await fileToBase64(file)).split(',')[1];
            imageSetter({ base64, mimeType: file.type });
        }
    };
    
    const handleAddKOLs = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newKOLsPromises = files.map(async (file) => {
                if (file instanceof File) {
                    const b64 = await fileToBase64(file);
                    const defaultAudience: AudienceType = 'female';
                    const newKol: AdditionalKOL = {
                        id: Date.now() + Math.random(),
                        face: { base64: b64.split(',')[1], mimeType: file.type },
                        audienceType: defaultAudience,
                        clothing: contentOptions[defaultAudience].clothing[0],
                        customClothing: '',
                        outfitImage: null,
                        bodyType: bodyTypeOptions[defaultAudience].sort()[0],
                        customBodyType: '',
                    };
                    return newKol;
                }
                return null;
            });
            const newKOLs = (await Promise.all(newKOLsPromises)).filter((kol): kol is AdditionalKOL => !!kol);
            setAdditionalKOLs(prev => [...prev, ...newKOLs]);
        }
    };

    const updateAdditionalKOL = (index: number, newProps: Partial<AdditionalKOL>) => {
        setAdditionalKOLs(prev => prev.map((kol, i) => {
            if (i === index) {
                const updatedKol = { ...kol, ...newProps };
                // If audienceType changed, reset clothing and bodyType
                if (newProps.audienceType && newProps.audienceType !== kol.audienceType) {
                    const newAudience = newProps.audienceType;
                    updatedKol.clothing = contentOptions[newAudience].clothing[0];
                    updatedKol.customClothing = '';
                    updatedKol.bodyType = bodyTypeOptions[newAudience].sort()[0];
                    updatedKol.customBodyType = '';
                }
                return updatedKol;
            }
            return kol;
        }));
    };
    
    const getEffectiveValue = (selectedValue: string, customValue: string) => {
        if (selectedValue === 'Tùy chỉnh...') return customValue.trim();
        if (selectedValue === 'Tự động (AI Quyết định)' || selectedValue === 'Tự động' || selectedValue === 'Không thay đổi') return null;
        return selectedValue;
    };

    const buildPromptFromSelections = (exclude: string[] = []) => {
        const allEffectiveValues = [
            { label: 'Vóc dáng', value: getEffectiveValue(bodyType, customBodyType) },
            { label: 'Bối cảnh', value: getEffectiveValue(context, customContext) },
            { label: 'Phong cách', value: getEffectiveValue(style, customStyle) },
            { label: 'Trang phục', value: getEffectiveValue(clothing, customClothing) },
            { label: 'Tư thế', value: getEffectiveValue(pose, customPose) },
            { label: 'Góc chụp & Khung hình', value: getEffectiveValue(cameraAngle, customCameraAngle) },
        ];
        const effectiveValues = allEffectiveValues.filter(item => !exclude.includes(item.label.toLowerCase()));
        return effectiveValues.filter(item => item.value).map(item => `- ${item.label}: ${item.value}.`).join('\n');
    };

    const handleGenerateSuggestionPrompt = async () => {
        setIsGeneratingSuggestion(true);
        setError(null);
        try {
            const promptDetails = buildPromptFromSelections();
            const audienceMap = {
                female: 'một KOL nữ', male: 'một KOL nam',
                girl: 'một KOL bé gái', boy: 'một KOL bé trai',
            };
            const basePrompt = `Chụp ảnh ${audienceMap[audienceType]}.\n${promptDetails}`;

            const richPrompt = await generateRichPrompt(basePrompt);
            setCustomPrompt(richPrompt);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Đã xảy ra lỗi không xác định.";
            setError(message);
        } finally {
            setIsGeneratingSuggestion(false);
        }
    };

    const handleStopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const handleInterpolatePrompt = async () => {
        if (!interpolationSampleImage) return;
    
        setIsInterpolatingPrompt(true);
        setError(null);
        setInterpolatedPrompt('');
    
        try {
            const extractedPrompt = await generatePromptFromImage(interpolationSampleImage, copyHairColor, copyHairStyle, removeTattoo);
            setInterpolatedPrompt(extractedPrompt);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Lỗi không xác định.";
            setError(`Không thể phân tích ảnh: ${message}`);
        } finally {
            setIsInterpolatingPrompt(false);
        }
    };
    
    const handleSubmit = async () => {
        const audienceMap = {
            female: 'một KOL nữ', male: 'một KOL nam',
            girl: 'một KOL bé gái', boy: 'một KOL bé trai',
        };
        let imagesToUse: LockedFace[] = lockedFace ? [lockedFace] : [];
        let prompt: string;
        const isCreatingKOL = activeTab === 'pro' && !lockedFace;

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setVariationResults(null);

        if (activeTab === 'travel') {
            if (!lockedFace) {
                setError("Vui lòng khóa gương mặt KOL trước khi tạo ảnh du lịch.");
                setIsLoading(false);
                return;
            }
            const selectedLandmarks = travelLandmarks.filter(l => l.selected);
            if (selectedLandmarks.length === 0) {
                setError("Vui lòng chọn ít nhất một địa điểm để tạo ảnh.");
                setIsLoading(false);
                return;
            }
            // Group landmarks by prompt to batch generate images
            const generationGroups: Record<string, { landmarks: TravelLandmarkConfig[], count: number }> = {};
            for (const landmark of selectedLandmarks) {
                const effOutfit = getEffectiveValue(landmark.outfit, landmark.customOutfit) || "trang phục phù hợp với địa điểm";
                const effPose = getEffectiveValue(landmark.pose, landmark.customPose) || "tư thế tự nhiên";
                const groupPrompt = `**Chủ thể:** ${audienceMap[audienceType]}.\n**Bối cảnh:** Tại ${landmark.name}, ${travelLocation}.\n**Trang phục:** ${effOutfit}.\n**Tư thế:** ${effPose}.`;
                if (!generationGroups[groupPrompt]) {
                    generationGroups[groupPrompt] = { landmarks: [], count: 0 };
                }
                generationGroups[groupPrompt].landmarks.push(landmark);
                generationGroups[groupPrompt].count += landmark.imageCount;
            }

            try {
                const allNewImages: LibraryAsset[] = [];
                for (const [groupPrompt, groupData] of Object.entries(generationGroups)) {
                    const simpleSkinTone = (skinTone === 'Tự động (AI Quyết định)' || skinTone === 'Không thay đổi') ? null : skinTone;
                    const promptOptions = {
                        prompt: groupPrompt,
                        audienceType,
                        skinTone: simpleSkinTone,
                        bodyType: getEffectiveValue(bodyType, customBodyType),
                        style: getEffectiveValue(style, customStyle),
                        cameraAngle: getEffectiveValue(cameraAngle, customCameraAngle),
                        additionalRequirements,
                    };

                    const results = await generateContent(promptOptions, [lockedFace], groupData.count, getEffectiveValue(aspectRatio, customAspectRatio) || undefined, controller.signal, aiModel);
                    
                    const newImages: LibraryAsset[] = results.map((src, index) => ({
                        id: `travel_${Date.now()}_${index}`,
                        src,
                        prompt: groupPrompt,
                        inputImages: [lockedFace],
                        type: 'kol',
                    }));
                    allNewImages.push(...newImages);
                }
                setGeneratedImages(allNewImages);
            } catch (e: unknown) {
                if (!(e instanceof DOMException && e.name === 'AbortError')) {
                    const message = e instanceof Error ? e.message : "Đã xảy ra lỗi không xác định.";
                    setError(message);
                }
            } finally {
                setIsLoading(false);
            }
            return;
        }


        // Build prompt and images for other tabs
        switch(activeTab) {
            case 'creative':
                prompt = customPrompt.trim() || buildPromptFromSelections();
                if (creativeBackgroundImage) imagesToUse.push(creativeBackgroundImage);
                break;
            
            case 'ads':
                prompt = `**Mô tả sản phẩm:** ${productDescription}\n**Tương tác:** ${interactionDescription}\n**Yêu cầu thêm:** ${additionalRequirements}`;
                imagesToUse = [...imagesToUse, ...productImages];
                if(addTextToAd) prompt += "\n**Lưu ý:** Có thể thêm văn bản quảng cáo phù hợp vào ảnh.";
                break;

            case 'outfit':
                prompt = `**Yêu cầu:** Mặc cho người mẫu bộ trang phục được cung cấp trong ảnh thứ hai. Giữ nguyên gương mặt từ ảnh đầu tiên. ${outfitInstructions}`;
                imagesToUse = [...imagesToUse, ...outfitImages];
                break;
            
            case 'pro':
                if (isCreatingKOL) {
                    let characterDetails = `Tạo một KOL ảo là ${audienceMap[audienceType]}.`;
                    const featureParts: string[] = [];
                    Object.entries(kolOptions).forEach(([categoryKey, categoryOptions]) => {
                        Object.entries(categoryOptions).forEach(([optionKey, value]) => {
                            if (value && value !== 'Tự động') {
                                // Find the label for this option
                                const categoryData = (kolCharacterOptions[audienceType] as KolCharacterData)[categoryKey];
                                if (categoryData) {
                                    for (const group of Object.values(categoryData.groups)) {
                                        if (group.options[optionKey]) {
                                            featureParts.push(`- ${group.options[optionKey].label}: ${value}`);
                                            return;
                                        }
                                    }
                                }
                            }
                        });
                    });
                    if (featureParts.length > 0) {
                        characterDetails += "\n**Đặc điểm chi tiết:**\n" + featureParts.join('\n');
                    }
                    characterDetails += `\n**Bối cảnh & Phong cách:** ${buildPromptFromSelections(['vóc dáng', 'trang phục', 'tư thế'])}`;
                    prompt = characterDetails;
                } else {
                     prompt = customPrompt.trim() || buildPromptFromSelections();
                     if (proBackgroundImage) imagesToUse.push(proBackgroundImage);
                     if (proClothingImage) imagesToUse.push(proClothingImage);
                     if(isMagazineCover) prompt += "\n- **Yêu cầu bìa tạp chí:** Bố cục như bìa tạp chí thời trang cao cấp (Vogue, Harper's Bazaar). Có không gian trống để thêm tiêu đề và văn bản.";
                }
                break;
            
            case 'interpolation':
                if (!interpolatedPrompt) {
                    setError("Vui lòng phân tích và nội suy prompt từ ảnh mẫu trước.");
                    setIsLoading(false);
                    return;
                }
                prompt = interpolatedPrompt;
                if(isCopyingStyle && interpolationSampleImage) {
                   imagesToUse.push(interpolationSampleImage);
                }
                break;
            
            case 'transform':
                 if (!transformSourceImage) {
                     setError("Vui lòng tải ảnh gốc để biến đổi.");
                     setIsLoading(false);
                     return;
                 }
                 if (!transformInstruction.trim()) {
                     setError("Vui lòng nhập yêu cầu biến đổi.");
                     setIsLoading(false);
                     return;
                 }
                 prompt = transformInstruction.trim();
                 imagesToUse = [transformSourceImage]; 
                 break;
            
            case 'multi-kol':
                prompt = `Chụp ảnh nhiều KOL.\n- **Tương tác:** ${getEffectiveValue(interaction, customInteraction)}.\n- **Bối cảnh & Phong cách:** ${buildPromptFromSelections(['vóc dáng', 'trang phục', 'tư thế'])}`;
                const additionalFaces = additionalKOLs.map(kol => kol.face);
                imagesToUse.push(...additionalFaces);
                // Add clothing/body type details for each KOL
                additionalKOLs.forEach((kol, index) => {
                    const effClothing = getEffectiveValue(kol.clothing, kol.customClothing);
                    const effBody = getEffectiveValue(kol.bodyType, kol.customBodyType);
                    prompt += `\n- **KOL ${index + 2} (${kol.audienceType}):** ${effClothing ? `Trang phục là ${effClothing}.` : ''} ${effBody ? `Vóc dáng là ${effBody}.` : ''}`;
                });
                break;

            case 'pose':
                if (!poseSourceImage) {
                    setError("Vui lòng cung cấp ảnh gốc của KOL.");
                    setIsLoading(false);
                    return;
                }
                let posePrompt = `YÊU CẦU: Giữ nguyên 100% gương mặt, trang phục, và bối cảnh từ ảnh gốc (ảnh 1). Chỉ thay đổi tư thế của nhân vật.`;
                if (poseReferenceImage) {
                    posePrompt += `\n- **Tham khảo tư thế:** Hãy khớp với tư thế của nhân vật trong ảnh tham khảo (ảnh 2).`;
                    imagesToUse = [poseSourceImage, poseReferenceImage];
                } else {
                    imagesToUse = [poseSourceImage];
                }

                if (poseDescription.trim()) {
                    posePrompt += `\n- **Mô tả tư thế mong muốn:** ${poseDescription.trim()}.`;
                }

                if (!poseReferenceImage && !poseDescription.trim()) {
                     setError("Vui lòng cung cấp ảnh tham khảo tư thế hoặc mô tả tư thế mong muốn.");
                    setIsLoading(false);
                    return;
                }
                prompt = posePrompt;
                break;
            
            case 'muse':
                let musePromptParts: string[] = [];
                const effMuseOutfit = getEffectiveValue(museOutfit, customMuseOutfit);
                const effMuseAccessory = getEffectiveValue(museAccessory, customMuseAccessory);
                const effMuseBackground = getEffectiveValue(museBackground, customMuseBackground);
                const effMuseLighting = getEffectiveValue(museLighting, customMuseLighting);
                
                if (studioMode === 'muse') {
                    musePromptParts.push(`**Chủ thể:** ${audienceMap[audienceType]}.`);
                    musePromptParts.push(`**Trang phục:** ${effMuseOutfit}.`);
                    musePromptParts.push(`**Phụ kiện:** ${effMuseAccessory}.`);
                    musePromptParts.push(`**Bối cảnh:** ${effMuseBackground}.`);
                    musePromptParts.push(`**Ánh sáng:** ${effMuseLighting}.`);
                    musePromptParts.push(`**Vóc dáng:** ${getEffectiveValue(bodyType, customBodyType)}.`);
                    musePromptParts.push(`**Góc chụp & Khung hình:** ${getEffectiveValue(cameraAngle, customCameraAngle)}.`);
                    musePromptParts.push(`**Tư thế & Thần thái:** ${getEffectiveValue(pose, customPose)}.`);
                } else if (studioMode === 'nude') {
                    const effConcealmentLevel = getEffectiveValue(nudeConcealmentLevel, customNudeConcealmentLevel);
                    const effConcealmentTechnique = getEffectiveValue(nudeConcealmentTechnique, customNudeConcealmentTechnique);
                     musePromptParts.push(`Chụp ảnh nude nghệ thuật, ${audienceMap[audienceType]}.`);
                     musePromptParts.push(`- **Mức độ:** ${effConcealmentLevel}.`);
                     musePromptParts.push(`- **Kỹ thuật che phủ:** ${effConcealmentTechnique}.`);
                     musePromptParts.push(`- **Bối cảnh:** ${effMuseBackground}.`);
                     musePromptParts.push(`- **Ánh sáng:** ${effMuseLighting}.`);
                     musePromptParts.push(`**Vóc dáng:** ${getEffectiveValue(bodyType, customBodyType)}.`);
                     musePromptParts.push(`**Góc chụp & Khung hình:** ${getEffectiveValue(cameraAngle, customCameraAngle)}.`);
                     musePromptParts.push(`- **Tư thế & Thần thái:** ${getEffectiveValue(pose, customPose)}.`);
                } else { // costume
                    const currentCostume = (audienceType === 'girl' || audienceType === 'boy') ? costumeOptions[audienceType] : costumeOptions.girl;
                    const effChar = getEffectiveValue(costumeCharacter, customCostumeCharacter);
                    const effOutfit = getEffectiveValue(costumeOutfit, customCostumeOutfit);
                    const effBg = getEffectiveValue(costumeBackground, customCostumeBackground);
                    musePromptParts.push(`**Chủ đề:** Cosplay / Hóa trang.`);
                    musePromptParts.push(`**Nhân vật:** ${effChar}.`);
                    musePromptParts.push(`**Trang phục:** ${effOutfit}.`);
                    musePromptParts.push(`**Bối cảnh:** ${effBg}.`);
                    musePromptParts.push(`**Vóc dáng:** ${getEffectiveValue(bodyType, customBodyType)}.`);
                     musePromptParts.push(`**Góc chụp & Khung hình:** ${getEffectiveValue(cameraAngle, customCameraAngle)}.`);
                }
                
                prompt = musePromptParts.join('\n');
                if (museBackgroundImage) {
                    imagesToUse.push(museBackgroundImage);
                }
                break;
            
            case 'selfie':
                 const effSelfieBg = getEffectiveValue(selfieBackground, customSelfieBackground);
                 const effSelfieFraming = getEffectiveValue(selfieFraming, customSelfieFraming);
                 prompt = `Chụp ảnh selfie ${isMirrorSelfie ? 'qua gương' : 'cầm tay'} của ${audienceMap[audienceType]}.`;
                 if(isMirrorSelfie) {
                    prompt += `\n- **Môi trường:** ${effSelfieBg}.`;
                 } else {
                    prompt += `\n- **Bối cảnh nền:** ${effSelfieBg}.`;
                 }
                 if (effSelfieFraming) {
                    prompt += `\n- **Khung hình:** ${effSelfieFraming}.`;
                 }
                 prompt += `\n- **Điện thoại:** ${phoneVisible ? 'Nhìn thấy điện thoại trong ảnh.' : 'Không nhìn thấy điện thoại. Tư thế của nhân vật phải có một cánh tay giơ ra ngoài khung hình, ngụ ý rằng họ đang tự cầm điện thoại để chụp ảnh.'}`;
                 prompt += `\n- **Trang phục:** ${getEffectiveValue(clothing, customClothing)}.`;
                 prompt += `\n- **Tư thế:** ${getEffectiveValue(pose, customPose)}.`;
                 const effBodyType = getEffectiveValue(bodyType, customBodyType);
                 if (effBodyType) prompt += `\n- **Vóc dáng:** ${effBodyType}.`;
                 const effStyle = getEffectiveValue(style, customStyle);
                 if (effStyle) prompt += `\n- **Phong cách:** ${effStyle}.`;
                 if (additionalRequirements.trim()) {
                    prompt += `\n- **Yêu cầu bổ sung:** ${additionalRequirements.trim()}.`;
                 }
                 break;

            case 'hair':
                const effHairStyle = getEffectiveValue(hairStyle, customHairStyle);
                const effHairColor = getEffectiveValue(hairColor, customHairColor);
                const effHairAccessory = getEffectiveValue(hairAccessory, customHairAccessory);
                prompt = `YÊU CẦU: Chỉ thay đổi kiểu tóc. Giữ nguyên 100% gương mặt, trang phục, và bối cảnh.`;
                if(effHairStyle) prompt += `\n- **Kiểu tóc mới:** ${effHairStyle}.`;
                if(effHairColor) prompt += `\n- **Màu tóc mới:** ${effHairColor}.`;
                if(effHairAccessory && effHairAccessory !== 'Không có') prompt += `\n- **Phụ kiện tóc:** ${effHairAccessory}.`;
                if (!poseSourceImage) {
                    setError("Vui lòng tải ảnh gốc để thay đổi kiểu tóc.");
                    setIsLoading(false);
                    return;
                }
                imagesToUse = [poseSourceImage];
                break;
                
            default:
                prompt = customPrompt.trim() || buildPromptFromSelections();
        }

        try {
            const simpleSkinTone = (skinTone === 'Tự động (AI Quyết định)' || skinTone === 'Không thay đổi') ? null : skinTone;
            const promptOptions = {
                prompt,
                audienceType,
                skinTone: simpleSkinTone,
                bodyType: getEffectiveValue(bodyType, customBodyType),
                context: getEffectiveValue(context, customContext),
                style: getEffectiveValue(style, customStyle),
                clothing: getEffectiveValue(clothing, customClothing),
                pose: getEffectiveValue(pose, customPose),
                cameraAngle: getEffectiveValue(cameraAngle, customCameraAngle),
                additionalRequirements,
                isCreatingKOL
            };
            
            const results = await generateContent(promptOptions, imagesToUse, numImages, getEffectiveValue(aspectRatio, customAspectRatio) || undefined, controller.signal, aiModel);
            
            if (isCreatingKOL && results.length > 0) {
                 const newFace: LockedFace = {
                    base64: results[0].split(',')[1],
                    mimeType: results[0].match(/data:(image\/[^;]+);/)?.[1] || 'image/png'
                };
                setLockedFace(newFace);
            }
            
            const newImages: LibraryAsset[] = results.map((src, index) => ({
                id: `${activeTab}_${Date.now()}_${index}`,
                src,
                prompt,
                inputImages: imagesToUse,
                type: 'kol',
            }));
            setGeneratedImages(newImages);

        } catch (e: unknown) {
            if (!(e instanceof DOMException && e.name === 'AbortError')) {
                const message = e instanceof Error ? e.message : "Đã xảy ra lỗi không xác định.";
                setError(message);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };
    
    const handleQuickEdit = async () => {
        const { image, editColor, editOutfitText, editOutfitSelection, editPose, customEditPose, editAdditionalReqs } = editModalState;
        if (!image) return;

        let instruction = '';
        const getEffectiveValue = (sel: string, cust: string) => sel === 'Tùy chỉnh...' ? cust.trim() : (sel === 'Tự động (AI Quyết định)' || sel === 'Không thay đổi') ? null : sel;
        const effectiveOutfit = getEffectiveValue(editOutfitSelection, editOutfitText);
        const effectivePose = getEffectiveValue(editPose, customEditPose);
        const effectiveAdditionalReqs = editAdditionalReqs.trim();

        const activeEdits = [editColor.trim(), effectiveOutfit, effectivePose, effectiveAdditionalReqs].filter(Boolean);
        if (activeEdits.length > 1) {
            alert("Vui lòng chỉ thực hiện một loại chỉnh sửa tại một thời điểm (Màu sắc, Trang phục, Tư thế, hoặc Yêu cầu tùy chỉnh).");
            return;
        }

        if (editColor.trim()) {
            instruction = `YÊU CẦU: Chỉ thay đổi MÀU SẮC của trang phục thành '${editColor.trim()}'. Giữ nguyên mọi thứ khác.\n**CHÚ Ý QUAN TRỌNG:** Nếu trong ảnh có gương hoặc bề mặt phản chiếu, hãy đảm bảo màu sắc của trang phục trong hình ảnh phản chiếu cũng được thay đổi một cách nhất quán.`;
        } else if (effectiveOutfit) {
            instruction = `YÊU CẦU: Chỉ thay đổi TRANG PHỤC thành '${effectiveOutfit}'. Giữ nguyên mọi thứ khác.`;
        } else if (effectivePose) {
            instruction = `YÊU CẦU: Chỉ thay đổi TƯ THẾ của nhân vật thành '${effectivePose}'. Giữ nguyên mọi thứ khác.`;
        } else if (effectiveAdditionalReqs) {
            instruction = `YÊU CẦU: ${effectiveAdditionalReqs}. Giữ nguyên mọi thứ khác càng nhiều càng tốt.`;
        } else {
            alert("Vui lòng nhập yêu cầu chỉnh sửa.");
            return;
        }

        setEditModalState(prev => ({ ...prev, isEditing: true }));
        try {
            const sourceImage: LockedFace = {
                base64: image.src.split(',')[1],
                mimeType: image.src.match(/data:(image\/[^;]+);/)?.[1] || 'image/png'
            };

            const resultSrc = await editImage(instruction, sourceImage);
            
            const newImage: LibraryAsset = {
                ...image,
                src: resultSrc,
                prompt: `Chỉnh sửa: "${instruction}"\n---\nPrompt gốc:\n${image.prompt}`,
            };

            setGeneratedImages(prev => prev.map(img => img.id === image.id ? newImage : img));
            
            setEditModalState({ 
                isOpen: false, 
                image: null, 
                editColor: '', 
                editOutfitText: '', 
                editOutfitSelection: 'Không thay đổi', 
                editPose: 'Không thay đổi', 
                customEditPose: '', 
                editAdditionalReqs: '', 
                isEditing: false 
            });

        } catch (e) {
             const message = e instanceof Error ? e.message : "Lỗi không xác định.";
             setError(message);
        } finally {
            setEditModalState(prev => ({ ...prev, isEditing: false }));
        }
    };
    
    const handleGenerateVariation = async (sourceImage: LibraryAsset) => {
            if (!lockedFace) {
                alert("Vui lòng khóa gương mặt KOL trước khi tạo biến thể để đảm bảo tính nhất quán.");
                return;
            }
            setIsLoading(true);
            setError(null);
            setGeneratedImages(prev => prev.map(img => img.id === sourceImage.id ? { ...img, isGeneratingVariation: true } : img));
            
            const sourceImagePart: LockedFace = {
                base64: sourceImage.src.split(',')[1],
                mimeType: sourceImage.src.match(/data:(image\/[^;]+);/)?.[1] || 'image/png'
            };

            try {
                const variationPrompts = await generateCreativeVariationPrompts(sourceImage.prompt, sourceImagePart);
                const imagesToUseForGeneration: LockedFace[] = [lockedFace, sourceImagePart];
                
                const imagePromises = variationPrompts.map(prompt => {
                    const fullPrompt = `**YÊU CẦU BIẾN THỂ:**\n1. **GƯƠNG MẶT:** Giữ 100% gương mặt từ ảnh 1.\n2. **PHONG CÁCH:** Lấy cảm hứng từ ảnh 2.\n3. **KỊCH BẢN:** ${prompt}`;
                    return generateContent({ prompt: fullPrompt }, imagesToUseForGeneration, 1);
                });

                const resultsArrays = await Promise.all(imagePromises);
                const flattenedResults = resultsArrays.flat(); 

                const newImages: LibraryAsset[] = flattenedResults.map((src, index) => ({
                    id: `var_${sourceImage.id}_${Date.now()}_${index}`,
                    src,
                    prompt: variationPrompts[index] || "Prompt biến thể",
                    inputImages: imagesToUseForGeneration,
                    type: 'kol',
                }));
                
                setVariationResults({ source: sourceImage, variations: newImages });

            } catch (e) {
                const message = e instanceof Error ? e.message : "Lỗi không xác định.";
                setError(message);
            } finally {
                setIsLoading(false);
                setGeneratedImages(prev => prev.map(img => img.id === sourceImage.id ? { ...img, isGeneratingVariation: false } : img));
            }
    };
    
    const handleSaveVariationsToLibrary = () => {
        if (!variationResults) return;
        variationResults.variations.forEach(handleSaveToLibrary);
        alert(`Đã lưu ${variationResults.variations.length} biến thể vào thư viện.`);
        setVariationResults(null); // Go back to the main view
    };

    const handleDownloadAll = async (isVariation: boolean) => {
        const imagesToZip = isVariation && variationResults ? variationResults.variations : generatedImages;
        if (imagesToZip.length === 0) return;
    
        const zip = new JSZip();
        const imageFolder = zip.folder("kol-creative-images");
        if (!imageFolder) return;
    
        imagesToZip.forEach((image, index) => {
            const base64Data = image.src.split(',')[1];
            if (base64Data) {
                imageFolder.file(`image_${index + 1}_${image.id}.png`, base64Data, { base64: true });
            }
        });
    
        try {
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `kol-images_${isVariation ? 'variations' : 'generated'}_${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error("Error zipping files:", err);
            setError("Lỗi khi nén tệp tin.");
        }
    };

    const renderGeneratedContent = () => {
        if (generatedImages.length === 0) {
            return null;
        }
    
        return (
            <>
                <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Kết quả</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => generatedImages.forEach(handleSaveToLibrary)} className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-700 flex items-center gap-2">
                                <SaveIcon className="h-4 w-4" />
                                Lưu tất cả
                            </button>
                            <button onClick={() => handleDownloadAll(false)} className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                                <DownloadIcon className="h-4 w-4" />
                                Tải tất cả (.zip)
                            </button>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {generatedImages.map(image => (
                             <div key={image.id} className="relative group bg-gray-900 rounded-lg overflow-hidden">
                                {image.isGeneratingVariation ? 
                                    <div className="aspect-square flex items-center justify-center text-xs text-gray-400">Đang tạo...</div> :
                                    <img src={image.src} alt="Generated content" className="aspect-square object-cover w-full h-full" />
                                }
                                <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                    <div className="flex flex-wrap gap-1 justify-center">
                                        <button onClick={() => setLightboxImageSrc(image.src)} title="Xem lớn" className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md"><SearchIcon className="h-4 w-4" /></button>
                                        <button onClick={() => handleDownloadImage(image.src, `KOL_${activeTab}_${image.id}.png`)} title="Tải về" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"><DownloadIcon className="h-4 w-4" /></button>
                                        <button onClick={() => handleSaveToLibrary(image)} title="Lưu" className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"><SaveIcon className="h-4 w-4" /></button>
                                        <button onClick={() => setEditModalState({ isOpen: true, image: image, editColor: '', editOutfitText: '', editOutfitSelection: 'Không thay đổi', editPose: 'Không thay đổi', customEditPose: '', editAdditionalReqs: '', isEditing: false })} title="Sửa nhanh" className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-md"><WandIcon className="h-4 w-4" /></button>
                                        <button onClick={() => handleGenerateVariation(image)} disabled={image.isGeneratingVariation || isLoading} title="Tạo Biến thể" className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md disabled:bg-gray-500"><SparklesIcon className="h-4 w-4" /></button>
                                        <button onClick={() => handleOpenVeoModal(image)} title="Tạo Video" className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-md"><VideoCameraIcon className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {variationResults && (
                    <div className="mt-6 bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Kết quả Biến thể</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={handleSaveVariationsToLibrary} className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-700">Lưu tất cả vào Thư viện</button>
                                <button onClick={() => handleDownloadAll(true)} className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-1"><DownloadIcon className='h-4 w-4' /> Tải ZIP</button>
                                <button onClick={() => setVariationResults(null)} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                 <h4 className="text-sm font-semibold text-indigo-400 mb-1">Ảnh Gốc</h4>
                                 <img src={variationResults.source.src} alt="Source for variation" className="rounded-lg w-full aspect-square object-cover" />
                            </div>
                            {variationResults.variations.map(image => (
                                <div key={image.id} className="relative group bg-gray-900 rounded-lg overflow-hidden">
                                    <img src={image.src} alt="Generated variation" className="aspect-square object-cover w-full h-full" />
                                     <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            <button onClick={() => setLightboxImageSrc(image.src)} title="Xem lớn" className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md"><SearchIcon className="h-4 w-4" /></button>
                                            <button onClick={() => handleDownloadImage(image.src, `KOL_variation_${image.id}.png`)} title="Tải về" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"><DownloadIcon className="h-4 w-4" /></button>
                                            <button onClick={() => handleSaveToLibrary(image)} title="Lưu" className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"><SaveIcon className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderTabControls = () => {
        const currentContentOptions = contentOptions[audienceType];
        const currentBodyTypeOptions = bodyTypeOptions[audienceType];
        const currentPoseOptions = poseOptions[audienceType];
        const currentHairOptions = hairStylingOptions[audienceType];
        const currentKolCharacterOptions = kolCharacterOptions[audienceType] as KolCharacterData;

        const commonControls = (
             <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomizableSelect label="Vóc dáng" selectedValue={bodyType} onSelectChange={e => setBodyType(e.target.value)} customValue={customBodyType} onCustomChange={e => setCustomBodyType(e.target.value)} options={currentBodyTypeOptions} />
                    <CustomizableSelect label="Bối cảnh" selectedValue={context} onSelectChange={e => setContext(e.target.value)} customValue={customContext} onCustomChange={e => setCustomContext(e.target.value)} options={currentContentOptions.contexts} />
                    <CustomizableSelect label="Phong cách" selectedValue={style} onSelectChange={e => setStyle(e.target.value)} customValue={customStyle} onCustomChange={e => setCustomStyle(e.target.value)} options={currentContentOptions.styles} />
                    <CustomizableSelect label="Trang phục" selectedValue={clothing} onSelectChange={e => setClothing(e.target.value)} customValue={customClothing} onCustomChange={e => setCustomClothing(e.target.value)} options={currentContentOptions.clothing} />
                    <CustomizableSelect label="Tư thế" selectedValue={pose} onSelectChange={e => setPose(e.target.value)} customValue={customPose} onCustomChange={e => setCustomPose(e.target.value)} options={currentPoseOptions} />
                    <CustomizableSelect label="Góc chụp & Khung hình" selectedValue={cameraAngle} onSelectChange={e => setCameraAngle(e.target.value)} customValue={customCameraAngle} onCustomChange={e => setCustomCameraAngle(e.target.value)} options={cameraAngleOptions} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Yêu cầu phụ (VD: mồ hôi ướt mặt)</label>
                    <textarea value={additionalRequirements} onChange={e => setAdditionalRequirements(e.target.value)} rows={2} placeholder="VD: đeo kính râm, tóc ướt, có mồ hôi trên mặt..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                 </div>
            </div>
        );

        switch (activeTab) {
            case 'creative':
                return (
                     <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-bold text-white mb-2">Thông số Ảnh Sáng tạo</h2>
                        {commonControls}
                        <div className="pt-4 border-t border-gray-700 space-y-2">
                           <label className="block text-sm font-medium text-gray-300 mb-1">Hoặc nhập Prompt tùy chỉnh</label>
                            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} rows={4} placeholder="Nhập prompt chi tiết của bạn ở đây..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                             <button onClick={handleGenerateSuggestionPrompt} disabled={isGeneratingSuggestion} className="w-full text-sm bg-purple-600 hover:bg-purple-700 text-white py-2 px-2 rounded disabled:bg-gray-500">
                                {isGeneratingSuggestion ? "Đang làm giàu prompt..." : "AI làm giàu Prompt"}
                             </button>
                        </div>
                        <div className="pt-4 border-t border-gray-700 space-y-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Thêm Bối cảnh từ ảnh (Tùy chọn)</label>
                            {renderImageUploader((e) => handleFileChange(e, setCreativeBackgroundImage), creativeBackgroundImage, "Tải ảnh bối cảnh", "bg-upload", () => setCreativeBackgroundImage(null))}
                        </div>
                    </div>
                );
            case 'ads':
                return (
                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-bold text-white mb-2">Ảnh Quảng cáo</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Mô tả sản phẩm</label>
                            <textarea value={productDescription} onChange={e => setProductDescription(e.target.value)} rows={3} placeholder="Mô tả sản phẩm và lợi ích chính..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Mô tả tương tác của KOL với sản phẩm</label>
                            <textarea value={interactionDescription} onChange={e => setInteractionDescription(e.target.value)} rows={2} placeholder="VD: KOL đang cầm sản phẩm, đang sử dụng sản phẩm..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Ảnh sản phẩm (Tùy chọn)</label>
                             <input id="product-images-upload" type="file" multiple className="sr-only" onChange={(e) => {
                                 if (e.target.files) {
                                     const files = Array.from(e.target.files);
                                     Promise.all(files.map(fileToBase64)).then(base64s => {
                                         const newImages = base64s.map((b64, i) => ({ base64: b64.split(',')[1], mimeType: files[i].type }));
                                         setProductImages(prev => [...prev, ...newImages]);
                                     });
                                 }
                             }} accept="image/png, image/jpeg, image/webp" />
                            <label htmlFor="product-images-upload" className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md">Tải ảnh sản phẩm</label>
                             {productImages.length > 0 && (
                                <div className="mt-2 flex items-center gap-2 overflow-x-auto p-2 bg-gray-900/50 rounded-lg min-h-[80px]">
                                    {productImages.map((img, index) => (
                                        <div key={index} className="relative flex-shrink-0">
                                            <img src={`data:${img.mimeType};base64,${img.base64}`} className="h-16 w-16 object-cover rounded" />
                                            <button onClick={() => setProductImages(prev => prev.filter((_, i) => i !== index))} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5"><XMarkIcon className="h-3 w-3"/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {commonControls}
                         <div className="flex items-center">
                             <input type="checkbox" id="addTextToAd" checked={addTextToAd} onChange={e => setAddTextToAd(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <label htmlFor="addTextToAd" className="ml-2 block text-sm text-gray-300">Cho phép AI thêm văn bản quảng cáo</label>
                        </div>
                    </div>
                );
             case 'outfit':
                return (
                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-bold text-white mb-2">Thử đồ</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">1. Tải ảnh trang phục</label>
                                 <input id="outfit-images-upload" type="file" multiple className="sr-only" onChange={(e) => {
                                     if (e.target.files) {
                                         const files = Array.from(e.target.files);
                                         Promise.all(files.map(fileToBase64)).then(base64s => {
                                             const newImages = base64s.map((b64, i) => ({ base64: b64.split(',')[1], mimeType: files[i].type }));
                                             setOutfitImages(prev => [...prev, ...newImages]);
                                         });
                                     }
                                 }} accept="image/png, image/jpeg, image/webp" />
                                <label htmlFor="outfit-images-upload" className="w-full text-center block cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md">Tải ảnh trang phục</label>
                                 {outfitImages.length > 0 && (
                                    <div className="mt-2 flex items-center gap-2 overflow-x-auto p-2 bg-gray-900/50 rounded-lg min-h-[80px]">
                                        {outfitImages.map((img, index) => (
                                            <div key={index} className="relative flex-shrink-0">
                                                <img src={`data:${img.mimeType};base64,${img.base64}`} className="h-16 w-16 object-cover rounded" />
                                                <button onClick={() => setOutfitImages(prev => prev.filter((_, i) => i !== index))} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5"><XMarkIcon className="h-3 w-3"/></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Hoặc tách từ ảnh</label>
                                {renderImageUploader((e) => handleFileChange(e, setOutfitExtractionSource), outfitExtractionSource, "Tải ảnh gốc", "outfit-source-upload", () => setOutfitExtractionSource(null))}
                                <button
                                    onClick={async () => {
                                        if (!outfitExtractionSource) return;
                                        setIsExtractingOutfit(true); setError(null); setExtractedOutfit(null);
                                        try {
                                            const extracted = await extractOutfitFromImage(outfitExtractionSource);
                                             const newAsset: LibraryAsset = {
                                                id: `outfit_${Date.now()}`,
                                                src: `data:${extracted.mimeType};base64,${extracted.base64}`,
                                                prompt: 'Trang phục được tách từ ảnh',
                                                type: 'outfit'
                                            };
                                            setExtractedOutfit(newAsset);
                                            setOutfitImages(prev => [extracted, ...prev]);
                                        } catch (e) { setError(e instanceof Error ? e.message : "Lỗi tách trang phục"); }
                                        finally { setIsExtractingOutfit(false); }
                                    }}
                                    disabled={isExtractingOutfit || !outfitExtractionSource}
                                    className="w-full mt-2 bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 disabled:bg-gray-500">
                                    {isExtractingOutfit ? "Đang tách..." : "Tách Trang Phục"}
                                </button>
                            </div>
                        </div>
                         {extractedOutfit && (
                            <div className="space-y-2 pt-2 border-t border-gray-700">
                                <h3 className="font-semibold text-white">Trang phục vừa tách:</h3>
                                <img src={extractedOutfit.src} alt="Extracted outfit" className="rounded-lg w-full bg-white/10 p-2 object-contain max-h-48" />
                                <button onClick={() => { handleSaveToLibrary(extractedOutfit); setIsLibraryOpen(true); setLibraryFilter('outfit'); }} className="w-full text-sm bg-green-600 hover:bg-green-700 text-white py-2 px-2 rounded">Lưu vào Thư viện Trang phục</button>
                            </div>
                        )}
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">2. Bối cảnh & Tư thế</label>
                            {commonControls}
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">3. Yêu cầu thêm (Tùy chọn)</label>
                            <textarea value={outfitInstructions} onChange={e => setOutfitInstructions(e.target.value)} rows={2} placeholder="VD: Thay đổi màu sắc của trang phục thành màu xanh..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                        </div>
                    </div>
                );
            case 'pro':
                 return (
                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-bold text-white mb-2">Studio KOL</h2>
                        {isCreatingKOL ? (
                             <div className="space-y-4">
                                <p className="text-indigo-300 text-sm">Chế độ tạo KOL: Định hình các đặc điểm gương mặt cho KOL của bạn. Sau khi tạo xong ảnh đầu tiên, gương mặt sẽ được khóa lại.</p>
                                <div className="flex border border-gray-700 rounded-lg overflow-hidden">
                                    <div className="w-1/3 border-r border-gray-700">
                                        {Object.keys(currentKolCharacterOptions).map(key => (
                                            <button key={key} onClick={() => setActiveKolCategory(key)} className={`block w-full text-left px-3 py-2 text-sm ${activeKolCategory === key ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700'}`}>
                                                {currentKolCharacterOptions[key].label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="w-2/3 p-4 space-y-4 max-h-96 overflow-y-auto">
                                        {currentKolCharacterOptions[activeKolCategory] && Object.values(currentKolCharacterOptions[activeKolCategory].groups).map((group: KolOptionGroup) => {
                                            return (
                                            <div key={group.label}>
                                                <h4 className="text-sm font-semibold text-indigo-400 mb-2">{group.label}</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                {/* FIX: Explicitly cast optionValue to KolOption to resolve 'unknown' type error, which can occur when type inference is disrupted (e.g., by JSON.parse in imported data). */}
                                                {Object.entries(group.options).map(([optionKey, value]) => {
                                                    const optionValue = value as KolOption;
                                                    return (
                                                        <div key={optionKey}>
                                                            <label className="block text-xs font-medium text-gray-400 mb-1">{optionValue.label}</label>
                                                            {optionValue.type === 'input' ? (
                                                                <input type="text" value={kolOptions[activeKolCategory]?.[optionKey] || ''} onChange={e => handleKolOptionChange(activeKolCategory, optionKey, e.target.value)} className="w-full bg-gray-600 border-gray-500 rounded-md p-1 text-sm" />
                                                            ) : (
                                                                <select value={kolOptions[activeKolCategory]?.[optionKey] || 'Tự động'} onChange={e => handleKolOptionChange(activeKolCategory, optionKey, e.target.value)} className="w-full bg-gray-600 border-gray-500 rounded-md p-1 text-sm">
                                                                    {['Tự động', ...(optionValue.items || [])].map(item => <option key={item} value={item}>{item}</option>)}
                                                                </select>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-700">
                                    <h3 className="text-md font-semibold mb-2">Bối cảnh & Phong cách cho ảnh chân dung đầu tiên</h3>
                                    {commonControls}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-green-300 text-sm">KOL đã được khóa. Sử dụng các công cụ nâng cao dưới đây.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Sử dụng Bối cảnh từ ảnh</label>
                                        {renderImageUploader((e) => handleFileChange(e, setProBackgroundImage), proBackgroundImage, "Tải ảnh bối cảnh", "pro-bg-upload", () => setProBackgroundImage(null))}
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Sử dụng Trang phục từ ảnh</label>
                                        {renderImageUploader((e) => handleFileChange(e, setProClothingImage), proClothingImage, "Tải ảnh trang phục", "pro-cloth-upload", () => setProClothingImage(null))}
                                    </div>
                                </div>
                                {commonControls}
                                <div className="pt-4 border-t border-gray-700 space-y-2">
                                   <label className="block text-sm font-medium text-gray-300 mb-1">Hoặc nhập Prompt tùy chỉnh</label>
                                    <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} rows={3} placeholder="Nhập prompt chi tiết của bạn ở đây..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                                </div>
                                <div className="flex items-center">
                                     <input type="checkbox" id="isMagazineCover" checked={isMagazineCover} onChange={e => setIsMagazineCover(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    <label htmlFor="isMagazineCover" className="ml-2 block text-sm text-gray-300">Tạo ảnh bìa tạp chí (có không gian cho text)</label>
                                </div>
                            </div>
                        )}
                    </div>
                 );
            case 'interpolation':
                return (
                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-bold text-white mb-2">Nội suy Prompt từ ảnh</h2>
                        {renderImageUploader((e) => handleFileChange(e, setInterpolationSampleImage), interpolationSampleImage, "Tải ảnh mẫu", "interp-upload", () => { setInterpolationSampleImage(null); setInterpolatedPrompt(''); })}
                         <div className="space-y-2 bg-gray-900/50 p-3 rounded-lg">
                            <label className="flex items-center">
                                <input type="checkbox" checked={copyHairColor} onChange={e => setCopyHairColor(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                                <span className="ml-2 text-sm text-gray-300">Sao chép màu tóc</span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" checked={copyHairStyle} onChange={e => setCopyHairStyle(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                                <span className="ml-2 text-sm text-gray-300">Sao chép kiểu tóc</span>
                            </label>
                             <label className="flex items-center">
                                <input type="checkbox" checked={removeTattoo} onChange={e => setRemoveTattoo(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                                <span className="ml-2 text-sm text-gray-300">Xóa hình xăm (nếu có)</span>
                            </label>
                        </div>
                        <button
                            onClick={handleInterpolatePrompt}
                            disabled={isInterpolatingPrompt || !interpolationSampleImage}
                            className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 disabled:bg-gray-500"
                        >
                            {isInterpolatingPrompt ? "Đang phân tích..." : "Phân tích & Nội suy Prompt"}
                        </button>
                        <textarea value={interpolatedPrompt} onChange={e => setInterpolatedPrompt(e.target.value)} rows={5} placeholder="Prompt được phân tích từ ảnh sẽ hiện ở đây..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                         <label className="flex items-center">
                                <input type="checkbox" checked={isCopyingStyle} onChange={e => setIsCopyingStyle(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                                <span className="ml-2 text-sm text-gray-300">Sử dụng ảnh mẫu để sao chép phong cách</span>
                        </label>
                    </div>
                );
             case 'transform':
                 return (
                     <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                         <h2 className="text-xl font-bold text-white mb-2">Biến đổi Ảnh</h2>
                         <p className="text-sm text-gray-400">Tải lên một ảnh và mô tả sự thay đổi bạn muốn. AI sẽ giữ lại bố cục và các yếu tố chính, chỉ thay đổi theo yêu cầu của bạn.</p>
                         {renderImageUploader((e) => handleFileChange(e, setTransformSourceImage), transformSourceImage, "Tải ảnh gốc", "transform-source-upload", () => setTransformSourceImage(null))}
                         <div>
                             <label className="block text-sm font-medium text-gray-300 mb-1">Yêu cầu thay đổi</label>
                             <textarea value={transformInstruction} onChange={e => setTransformInstruction(e.target.value)} rows={3} placeholder="VD: thay đổi trang phục thành váy dạ hội màu đỏ, thêm một chiếc vương miện..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                         </div>
                     </div>
                 );
             case 'multi-kol':
                return (
                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-bold text-white mb-2">Chụp ảnh nhiều KOL</h2>
                         <input id="multi-kol-upload" type="file" multiple className="sr-only" onChange={handleAddKOLs} accept="image/png, image/jpeg, image/webp" />
                        <label htmlFor="multi-kol-upload" className="w-full text-center block cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md">Thêm KOL khác</label>
                        {additionalKOLs.length > 0 && (
                             <div className="space-y-3 max-h-60 overflow-y-auto p-2 bg-gray-900/50 rounded-lg">
                                {additionalKOLs.map((kol, index) => (
                                    <div key={kol.id} className="grid grid-cols-2 gap-2 p-2 border border-gray-700 rounded-md">
                                        <img src={`data:${kol.face.mimeType};base64,${kol.face.base64}`} alt={`KOL ${index+2}`} className="h-20 w-20 object-cover rounded" />
                                        <div className="space-y-1">
                                            <select value={kol.audienceType} onChange={e => updateAdditionalKOL(index, { audienceType: e.target.value as AudienceType })} className="w-full bg-gray-700 border-gray-600 rounded p-1 text-xs">
                                                <option value="female">Nữ</option><option value="male">Nam</option><option value="girl">Bé gái</option><option value="boy">Bé trai</option>
                                            </select>
                                            <CustomizableSelect label="" selectedValue={kol.clothing} onSelectChange={e => updateAdditionalKOL(index, { clothing: e.target.value })} customValue={kol.customClothing} onCustomChange={e => updateAdditionalKOL(index, { customClothing: e.target.value })} options={contentOptions[kol.audienceType].clothing} />
                                             <CustomizableSelect label="" selectedValue={kol.bodyType} onSelectChange={e => updateAdditionalKOL(index, { bodyType: e.target.value })} customValue={kol.customBodyType} onCustomChange={e => updateAdditionalKOL(index, { customBodyType: e.target.value })} options={bodyTypeOptions[kol.audienceType]} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                         <CustomizableSelect label="Tương tác giữa các KOL" selectedValue={interaction} onSelectChange={e => setInteraction(e.target.value)} customValue={customInteraction} onCustomChange={e => setCustomInteraction(e.target.value)} options={interactionOptions} />
                         <div className="pt-4 border-t border-gray-700">{commonControls}</div>
                    </div>
                );
             case 'pose':
                 return (
                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-bold text-white mb-2">Đổi tư thế theo ảnh mẫu</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">1. Ảnh gốc của KOL</label>
                                {renderImageUploader((e) => handleFileChange(e, setPoseSourceImage), poseSourceImage, "Tải ảnh gốc", "pose-source-upload", () => setPoseSourceImage(null))}
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">2. Ảnh tham khảo tư thế (Tùy chọn)</label>
                                {renderImageUploader((e) => handleFileChange(e, setPoseReferenceImage), poseReferenceImage, "Tải ảnh tư thế", "pose-ref-upload", () => setPoseReferenceImage(null))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">3. Hoặc mô tả tư thế mong muốn</label>
                            <textarea value={poseDescription} onChange={e => setPoseDescription(e.target.value)} rows={3} placeholder="VD: Tư thế ngồi suy tư bên cửa sổ, hai tay đan vào nhau..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                        </div>
                    </div>
                );
            case 'muse':
                const currentCostumeOptions = (audienceType === 'girl' || audienceType === 'boy') ? costumeOptions[audienceType] : costumeOptions.girl;
                return (
                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-bold text-white mb-2">Art Studio</h2>
                         <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg">
                            <button onClick={() => setStudioMode('muse')} className={`px-3 py-1 text-sm rounded-md w-full ${studioMode === 'muse' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Nàng thơ</button>
                            {(audienceType === 'female' || audienceType === 'male') && <button onClick={() => setStudioMode('nude')} className={`px-3 py-1 text-sm rounded-md w-full ${studioMode === 'nude' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Nude nghệ thuật</button>}
                            {(audienceType === 'girl' || audienceType === 'boy') && <button onClick={() => setStudioMode('costume')} className={`px-3 py-1 text-sm rounded-md w-full ${studioMode === 'costume' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Hóa trang</button>}
                        </div>

                        {studioMode === 'muse' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <CustomizableSelect label="Trang phục" selectedValue={museOutfit} onSelectChange={e => setMuseOutfit(e.target.value)} customValue={customMuseOutfit} onCustomChange={e => setCustomMuseOutfit(e.target.value)} options={museOptions.outfits} />
                                    <CustomizableSelect label="Phụ kiện" selectedValue={museAccessory} onSelectChange={e => setMuseAccessory(e.target.value)} customValue={customMuseAccessory} onCustomChange={e => setCustomMuseAccessory(e.target.value)} options={museOptions.accessories} />
                                    <CustomizableSelect label="Bối cảnh" selectedValue={museBackground} onSelectChange={e => setMuseBackground(e.target.value)} customValue={customMuseBackground} onCustomChange={e => setCustomMuseBackground(e.target.value)} options={museOptions.backgrounds} />
                                    <CustomizableSelect label="Ánh sáng" selectedValue={museLighting} onSelectChange={e => setMuseLighting(e.target.value)} customValue={customMuseLighting} onCustomChange={e => setCustomMuseLighting(e.target.value)} options={museOptions.lighting} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <CustomizableSelect label="Vóc dáng" selectedValue={bodyType} onSelectChange={e => setBodyType(e.target.value)} customValue={customBodyType} onCustomChange={e => setCustomBodyType(e.target.value)} options={currentBodyTypeOptions} />
                                     <CustomizableSelect label="Tư thế & Thần thái" selectedValue={pose} onSelectChange={e => setPose(e.target.value)} customValue={customPose} onCustomChange={e => setCustomPose(e.target.value)} options={[...museOptions.poses, ...museOptions.vibes]} />
                                </div>
                                <CustomizableSelect label="Góc chụp" selectedValue={cameraAngle} onSelectChange={e => setCameraAngle(e.target.value)} customValue={customCameraAngle} onCustomChange={e => setCustomCameraAngle(e.target.value)} options={cameraAngleOptions} />
                                {renderImageUploader((e) => handleFileChange(e, setMuseBackgroundImage), museBackgroundImage, "Tải ảnh bối cảnh (tùy chọn)", "muse-bg-upload", () => setMuseBackgroundImage(null))}
                            </div>
                        )}

                        {studioMode === 'nude' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <CustomizableSelect label="Mức độ che phủ" selectedValue={nudeConcealmentLevel} onSelectChange={e => setNudeConcealmentLevel(e.target.value)} customValue={customNudeConcealmentLevel} onCustomChange={e => setCustomNudeConcealmentLevel(e.target.value)} options={nudeArtOptions.concealmentLevels} />
                                     <CustomizableSelect label="Kỹ thuật che phủ" selectedValue={nudeConcealmentTechnique} onSelectChange={e => setNudeConcealmentTechnique(e.target.value)} customValue={customNudeConcealmentTechnique} onCustomChange={e => setCustomNudeConcealmentTechnique(e.target.value)} options={nudeArtOptions.concealmentTechniques} />
                                     <CustomizableSelect label="Bối cảnh" selectedValue={museBackground} onSelectChange={e => setMuseBackground(e.target.value)} customValue={customMuseBackground} onCustomChange={e => setCustomMuseBackground(e.target.value)} options={nudeArtOptions.backgrounds} />
                                     <CustomizableSelect label="Ánh sáng" selectedValue={museLighting} onSelectChange={e => setMuseLighting(e.target.value)} customValue={customMuseLighting} onCustomChange={e => setCustomMuseLighting(e.target.value)} options={nudeArtOptions.lighting} />
                                     <CustomizableSelect label="Vóc dáng" selectedValue={bodyType} onSelectChange={e => setBodyType(e.target.value)} customValue={customBodyType} onCustomChange={e => setCustomBodyType(e.target.value)} options={currentBodyTypeOptions} />
                                     <CustomizableSelect label="Tư thế & Thần thái" selectedValue={pose} onSelectChange={e => setPose(e.target.value)} customValue={customPose} onCustomChange={e => setCustomPose(e.target.value)} options={[...nudeArtOptions.poses, ...nudeArtOptions.vibes]} />
                                </div>
                            </div>
                        )}

                        {studioMode === 'costume' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <CustomizableSelect label="Nhân vật" selectedValue={costumeCharacter} onSelectChange={e => setCostumeCharacter(e.target.value)} customValue={customCostumeCharacter} onCustomChange={e => setCustomCostumeCharacter(e.target.value)} options={currentCostumeOptions.characters} />
                                    <CustomizableSelect label="Trang phục" selectedValue={costumeOutfit} onSelectChange={e => setCostumeOutfit(e.target.value)} customValue={customCostumeOutfit} onCustomChange={e => setCustomCostumeOutfit(e.target.value)} options={currentCostumeOptions.outfits} />
                                    <CustomizableSelect label="Bối cảnh" selectedValue={costumeBackground} onSelectChange={e => setCostumeBackground(e.target.value)} customValue={customCostumeBackground} onCustomChange={e => setCustomCostumeBackground(e.target.value)} options={currentCostumeOptions.backgrounds} />
                                </div>
                                <CustomizableSelect label="Vóc dáng" selectedValue={bodyType} onSelectChange={e => setBodyType(e.target.value)} customValue={customBodyType} onCustomChange={e => setCustomBodyType(e.target.value)} options={currentBodyTypeOptions} />
                                <CustomizableSelect label="Góc chụp" selectedValue={cameraAngle} onSelectChange={e => setCameraAngle(e.target.value)} customValue={customCameraAngle} onCustomChange={e => setCustomCameraAngle(e.target.value)} options={cameraAngleOptions} />
                            </div>
                        )}
                    </div>
                );
            case 'background':
                return (
                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-bold text-white mb-2">Tách nền Bối cảnh</h2>
                        {renderImageUploader((e) => handleFileChange(e, setBackgroundSourceImage), backgroundSourceImage, "Tải ảnh gốc", "bg-source-upload", () => {setBackgroundSourceImage(null); setExtractedBackground(null);})}
                        <button
                            onClick={async () => {
                                if (!backgroundSourceImage) return;
                                setIsExtractingBackground(true); setError(null); setExtractedBackground(null);
                                try {
                                    const resultSrc = await extractBackgroundFromImage(backgroundSourceImage);
                                    const newAsset: LibraryAsset = { id: `bg_${Date.now()}`, src: resultSrc, prompt: 'Bối cảnh được tách từ ảnh', type: 'background' };
                                    setExtractedBackground(newAsset);
                                } catch (e) { setError(e instanceof Error ? e.message : "Lỗi tách nền"); }
                                finally { setIsExtractingBackground(false); }
                            }}
                            disabled={isExtractingBackground || !backgroundSourceImage}
                            className="w-full mt-2 bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 disabled:bg-gray-500">
                            {isExtractingBackground ? "Đang tách..." : "Tách nền Bối cảnh"}
                        </button>
                        {extractedBackground && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-white">Kết quả:</h3>
                                <img src={extractedBackground.src} alt="Extracted background" className="rounded-lg w-full" />
                                <button onClick={() => { handleSaveToLibrary(extractedBackground); setIsLibraryOpen(true); setLibraryFilter('background'); }} className="w-full text-sm bg-green-600 hover:bg-green-700 text-white py-2 px-2 rounded">Lưu vào Thư viện Bối cảnh</button>
                            </div>
                        )}
                    </div>
                );
            case 'travel':
                return (
                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-bold text-white mb-2">Du lịch & Check-in</h2>
                        <div className="flex gap-2">
                            <input type="text" value={travelLocation} onChange={e => setTravelLocation(e.target.value)} placeholder="Nhập địa danh (VD: Đà Lạt, Hội An...)" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                            <button
                                onClick={async () => {
                                    if (!travelLocation) return;
                                    setIsSearchingLandmarks(true); setError(null); setTravelLandmarks([]);
                                    try {
                                        const landmarks = await getLandmarksForLocation(travelLocation);
                                        const landmarkConfigs = landmarks.map(name => ({ name, selected: true, outfit: 'Tự động (AI Quyết định)', customOutfit: '', pose: 'Tự động (AI Quyết định)', customPose: '', imageCount: 1 }));
                                        setTravelLandmarks(landmarkConfigs);
                                    } catch(e) { setError(e instanceof Error ? e.message : 'Lỗi tìm kiếm'); }
                                    finally { setIsSearchingLandmarks(false); }
                                }}
                                disabled={isSearchingLandmarks || !travelLocation}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 flex-shrink-0"
                            >
                                {isSearchingLandmarks ? '...' : <SearchIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        {travelLandmarks.length > 0 && (
                            <div className="space-y-3 max-h-96 overflow-y-auto p-2 bg-gray-900/50 rounded-lg">
                                {travelLandmarks.map((landmark, index) => (
                                    <details key={index} className="p-2 border border-gray-700 rounded-md" open>
                                        <summary className="cursor-pointer flex items-center">
                                            <input type="checkbox" checked={landmark.selected} onChange={e => setTravelLandmarks(p => p.map((l, i) => i === index ? {...l, selected: e.target.checked} : l))} className="h-4 w-4 mr-3" />
                                            <span>{landmark.name}</span>
                                        </summary>
                                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-600">
                                            <CustomizableSelect label="" selectedValue={landmark.outfit} onSelectChange={e => setTravelLandmarks(p => p.map((l, i) => i === index ? {...l, outfit: e.target.value} : l))} customValue={landmark.customOutfit} onCustomChange={e => setTravelLandmarks(p => p.map((l, i) => i === index ? {...l, customOutfit: e.target.value} : l))} options={currentContentOptions.clothing} />
                                            <CustomizableSelect label="" selectedValue={landmark.pose} onSelectChange={e => setTravelLandmarks(p => p.map((l, i) => i === index ? {...l, pose: e.target.value} : l))} customValue={landmark.customPose} onCustomChange={e => setTravelLandmarks(p => p.map((l, i) => i === index ? {...l, customPose: e.target.value} : l))} options={currentPoseOptions} />
                                        </div>
                                         <div className="flex items-center gap-2 mt-2">
                                            <label className="text-xs">Số lượng ảnh:</label>
                                            <input type="number" min="1" max="4" value={landmark.imageCount} onChange={e => setTravelLandmarks(p => p.map((l, i) => i === index ? {...l, imageCount: parseInt(e.target.value) || 1} : l))} className="w-16 bg-gray-700 rounded p-1 text-sm" />
                                        </div>
                                    </details>
                                ))}
                            </div>
                        )}
                        <h3 className="text-md font-semibold pt-2 border-t border-gray-600">Tùy chọn chung</h3>
                        {commonControls}
                    </div>
                );
            case 'selfie':
                 return (
                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-bold text-white mb-2">Chụp ảnh Selfie</h2>
                         <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg">
                            <button onClick={() => setIsMirrorSelfie(false)} className={`px-3 py-1 text-sm rounded-md w-full ${!isMirrorSelfie ? 'bg-indigo-600' : 'bg-gray-700'}`}>Cầm tay</button>
                            <button onClick={() => setIsMirrorSelfie(true)} className={`px-3 py-1 text-sm rounded-md w-full ${isMirrorSelfie ? 'bg-indigo-600' : 'bg-gray-700'}`}>Qua gương</button>
                        </div>
                        <CustomizableSelect 
                            label="Khung hình" 
                            selectedValue={selfieFraming} 
                            onSelectChange={e => setSelfieFraming(e.target.value)} 
                            customValue={customSelfieFraming} 
                            onCustomChange={e => setCustomSelfieFraming(e.target.value)} 
                            options={['Nửa người (từ hông trở lên)', 'Toàn thân (thấy cả chân)', 'Cận mặt (close-up)']} 
                        />
                        <CustomizableSelect label={isMirrorSelfie ? "Môi trường gương" : "Bối cảnh nền"} selectedValue={selfieBackground} onSelectChange={e => setSelfieBackground(e.target.value)} customValue={customSelfieBackground} onCustomChange={e => setCustomSelfieBackground(e.target.value)} options={isMirrorSelfie ? mirrorSelfieContextOptions : handheldSelfieContextOptions} />
                        <CustomizableSelect label="Trang phục" selectedValue={clothing} onSelectChange={e => setClothing(e.target.value)} customValue={customClothing} onCustomChange={e => setCustomClothing(e.target.value)} options={currentContentOptions.clothing} />
                        <CustomizableSelect label="Tư thế" selectedValue={pose} onSelectChange={e => setPose(e.target.value)} customValue={customPose} onCustomChange={e => setCustomPose(e.target.value)} options={currentPoseOptions} />
                        <CustomizableSelect label="Vóc dáng" selectedValue={bodyType} onSelectChange={e => setBodyType(e.target.value)} customValue={customBodyType} onCustomChange={e => setCustomBodyType(e.target.value)} options={currentBodyTypeOptions} />
                        <CustomizableSelect label="Phong cách" selectedValue={style} onSelectChange={e => setStyle(e.target.value)} customValue={customStyle} onCustomChange={e => setCustomStyle(e.target.value)} options={currentContentOptions.styles} />
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Yêu cầu bổ sung</label>
                            <textarea
                                value={additionalRequirements}
                                onChange={e => setAdditionalRequirements(e.target.value)}
                                rows={2}
                                placeholder="VD: biểu cảm cười rạng rỡ, đeo kính râm..."
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                            />
                        </div>
                        <label className="flex items-center">
                            <input type="checkbox" checked={phoneVisible} onChange={e => setPhoneVisible(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                            <span className="ml-2 text-sm text-gray-300">Nhìn thấy điện thoại</span>
                        </label>
                    </div>
                );
            case 'hair':
                return (
                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-bold text-white mb-2">Studio Làm tóc</h2>
                        {renderImageUploader((e) => handleFileChange(e, setPoseSourceImage), poseSourceImage, "Tải ảnh gốc của KOL", "hair-source-upload", () => setPoseSourceImage(null))}
                        <CustomizableSelect label="Kiểu tóc" selectedValue={hairStyle} onSelectChange={e => setHairStyle(e.target.value)} customValue={customHairStyle} onCustomChange={e => setCustomHairStyle(e.target.value)} options={currentHairOptions.styles} />
                        <CustomizableSelect label="Màu tóc" selectedValue={hairColor} onSelectChange={e => setHairColor(e.target.value)} customValue={customHairColor} onCustomChange={e => setCustomHairColor(e.target.value)} options={currentHairOptions.colors} />
                        <CustomizableSelect label="Phụ kiện" selectedValue={hairAccessory} onSelectChange={e => setHairAccessory(e.target.value)} customValue={customHairAccessory} onCustomChange={e => setCustomHairAccessory(e.target.value)} options={currentHairOptions.accessories} />
                    </div>
                );
            default:
                return <div className="bg-gray-800 p-5 rounded-xl shadow-lg"><p>Tab không xác định</p></div>;
        }
    };

    return (
        <div className="space-y-6">
            {renderTabControls()}

            <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                <div className="flex items-center gap-4">
                     <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Mô hình AI</label>
                        <select 
                            value={aiModel} 
                            onChange={(e) => setAiModel(e.target.value)} 
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm focus:ring-indigo-500"
                        >
                            <option value={MODEL_IMAGE_FLASH}>Gemini 2.5 Flash (Nhanh, Nhiều ảnh)</option>
                            <option value={MODEL_IMAGE_PRO}>Gemini 3.0 Pro (Chất lượng cao, 1 ảnh/lần)</option>
                        </select>
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="num-images" className="block text-sm font-medium text-gray-300 mb-1">Số lượng ảnh</label>
                        <div className="flex items-center gap-2">
                             <input 
                                id="num-images" 
                                type="range" 
                                min="1" 
                                max="4" 
                                value={numImages} 
                                onChange={e => setNumImages(parseInt(e.target.value))} 
                                disabled={aiModel === MODEL_IMAGE_PRO}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50" 
                            />
                            <span className="bg-indigo-600 text-white text-lg font-bold rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">{numImages}</span>
                        </div>
                         {aiModel === MODEL_IMAGE_PRO && <p className="text-xs text-yellow-500 mt-1">Model Pro chỉ hỗ trợ tạo 1 ảnh mỗi lần.</p>}
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <label htmlFor="aspect-ratio" className="text-sm font-medium text-gray-300">Tỷ lệ khung hình</label>
                    <CustomizableSelect
                        label=""
                        selectedValue={aspectRatio}
                        onSelectChange={e => setAspectRatio(e.target.value)}
                        customValue={customAspectRatio}
                        onCustomChange={e => setCustomAspectRatio(e.target.value)}
                        options={aspectRatioOptions}
                    />
                </div>
                <button
                    onClick={isLoading ? handleStopGeneration : handleSubmit}
                    disabled={isCreatingKOL || activeTab === 'transform' ? false : !lockedFace}
                    className={`w-full text-white font-semibold py-3 px-4 rounded-md transition-colors ${isLoading ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed'}`}
                >
                    {isLoading ? `Dừng (${loadingMessage})` : (isCreatingKOL ? 'Tạo KOL & Khóa gương mặt' : 'Tạo ảnh')}
                </button>
                {!isCreatingKOL && activeTab !== 'transform' && !lockedFace && <p className="text-xs text-center text-yellow-400">Vui lòng khóa gương mặt KOL để có thể tạo ảnh.</p>}
            </div>

            {error && <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md">{error}</div>}

            {renderGeneratedContent()}
            
            {editModalState.isOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 z-[70] flex items-center justify-center p-4">
                     <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                             <h2 className="text-2xl font-bold text-white">Sửa nhanh</h2>
                             <button onClick={() => setEditModalState(p => ({...p, isOpen: false}))} className="text-gray-400 hover:text-white"><XMarkIcon className="h-8 w-8" /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <img src={editModalState.image?.src} alt="Image to edit" className="rounded-lg w-full max-w-sm mx-auto" />
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">1. Đổi màu trang phục</label>
                                <input type="text" placeholder="VD: màu xanh navy..." value={editModalState.editColor} onChange={e => setEditModalState(p => ({...p, editColor: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"/>
                            </div>
                            <div className="text-center text-gray-400 text-sm">hoặc</div>
                            <CustomizableSelect label="2. Thay đổi trang phục" selectedValue={editModalState.editOutfitSelection} onSelectChange={e => setEditModalState(p => ({...p, editOutfitSelection: e.target.value}))} customValue={editModalState.editOutfitText} onCustomChange={e => setEditModalState(p => ({...p, editOutfitText: e.target.value}))} options={contentOptions[audienceType].clothing} />
                            <div className="text-center text-gray-400 text-sm">hoặc</div>
                            <CustomizableSelect label="3. Thay đổi tư thế" selectedValue={editModalState.editPose} onSelectChange={e => setEditModalState(p => ({...p, editPose: e.target.value}))} customValue={editModalState.customEditPose} onCustomChange={e => setEditModalState(p => ({...p, customEditPose: e.target.value}))} options={poseOptions[audienceType]} />
                            <div className="text-center text-gray-400 text-sm">hoặc</div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">4. Yêu cầu tùy chỉnh khác</label>
                                <textarea placeholder="VD: thêm một chiếc kính râm..." value={editModalState.editAdditionalReqs} onChange={e => setEditModalState(p => ({...p, editAdditionalReqs: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white" rows={2}/>
                            </div>
                            <button onClick={handleQuickEdit} disabled={editModalState.isEditing} className="w-full bg-teal-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-500">{editModalState.isEditing ? 'Đang chỉnh sửa...' : 'Thực hiện'}</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
export default CreativeTab;
