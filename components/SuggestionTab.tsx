
import React, { useState, FC, useEffect } from 'react';
import { generatePostFromTopic, generateImagePromptFromTopic, generateContent, MODEL_IMAGE_FLASH, MODEL_IMAGE_PRO } from '../services/geminiService';
import { AudienceType, LibraryAsset, LockedFace } from '../types';
import { ClipboardIcon, DownloadIcon, SaveIcon, SearchIcon, VideoCameraIcon } from './icons';
import { contentOptions, weatherOptions, bodyTypeOptions, poseOptions, cameraAngleOptions, aspectRatioOptions } from '../data/contentOptions';

const CustomizableSelect: FC<{
    label: string;
    selectedValue: string;
    onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    customValue: string;
    onCustomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    options: string[];
    disabled?: boolean;
}> = ({ label, selectedValue, onSelectChange, customValue, onCustomChange, options, disabled = false }) => {
    const allOptions = ["Tự động (AI Quyết định)", "Tùy chỉnh...", ...options];
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <select value={selectedValue} onChange={onSelectChange} disabled={disabled} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-600 disabled:cursor-not-allowed">
                {allOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {selectedValue === 'Tùy chỉnh...' && !disabled && (
                <input
                    type="text"
                    value={customValue}
                    onChange={onCustomChange}
                    placeholder={`Nhập ${label.toLowerCase()} tùy chỉnh...`}
                    className="mt-2 w-full bg-gray-600 border border-gray-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={disabled}
                />
            )}
        </div>
    );
};

interface SuggestionTabProps {
    audienceType: AudienceType;
    kolName: string;
    setActiveTab: (tab: string) => void;
    lockedFace: LockedFace | null;
    skinTone: string;
    handleSaveToLibrary: (asset: LibraryAsset) => void;
    setLightboxImageSrc: (src: string | null) => void;
    handleOpenVeoModal: (image: LibraryAsset) => void;
}

// FIX: Add helper function to download images. This function was missing, causing a reference error.
const handleDownloadImage = (imageSrc: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const SuggestionTab: FC<SuggestionTabProps> = ({ 
    audienceType, 
    kolName, 
    setActiveTab,
    lockedFace,
    skinTone,
    handleSaveToLibrary,
    setLightboxImageSrc,
    handleOpenVeoModal
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestionTopic, setSuggestionTopic] = useState("");
    const [generatedSuggestionPost, setGeneratedSuggestionPost] = useState<{title: string, content: string} | null>(null);
    const [generatedSuggestionImagePrompt, setGeneratedSuggestionImagePrompt] = useState<string>("");
    const [copiedIdentifier, setCopiedIdentifier] = useState<string | null>(null);

    // Initial suggestion controls
    const [context, setContext] = useState('Tự động (AI Quyết định)');
    const [customContext, setCustomContext] = useState('');
    const [weather, setWeather] = useState('Tự động (AI Quyết định)');
    const [customWeather, setCustomWeather] = useState('');
    const [clothing, setClothing] = useState('Tự động (AI Quyết định)');
    const [customClothing, setCustomClothing] = useState('');
    const [bodyType, setBodyType] = useState('Tự động (AI Quyết định)');
    const [customBodyType, setCustomBodyType] = useState('');
    
    // Image generation controls
    const [pose, setPose] = useState('Tự động (AI Quyết định)');
    const [customPose, setCustomPose] = useState('');
    const [cameraAngle, setCameraAngle] = useState('Tự động (AI Quyết định)');
    const [customCameraAngle, setCustomCameraAngle] = useState('');
    const [aspectRatio, setAspectRatio] = useState(aspectRatioOptions[0]);
    const [customAspectRatio, setCustomAspectRatio] = useState('');
    const [style, setStyle] = useState('Tự động (AI Quyết định)');
    const [customStyle, setCustomStyle] = useState('');
    const [additionalRequirements, setAdditionalRequirements] = useState('');
    
    const [generatedImages, setGeneratedImages] = useState<LibraryAsset[]>([]);
    const [numImages, setNumImages] = useState(4);
    const [aiModel, setAiModel] = useState<string>(MODEL_IMAGE_FLASH);
    
    const currentContentOptions = contentOptions[audienceType];
    const currentBodyTypeOptions = bodyTypeOptions[audienceType];
    const currentPoseOptions = poseOptions[audienceType];

    // Update count when model changes
    useEffect(() => {
        if (aiModel === MODEL_IMAGE_PRO) {
            setNumImages(1);
        }
    }, [aiModel]);

    const handleCopyToClipboard = (text: string, identifier: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIdentifier(identifier);
            setTimeout(() => setCopiedIdentifier(null), 2000);
        });
    };

    const getEffectiveValue = (selectedValue: string, customValue: string) => {
        if (selectedValue === 'Tùy chỉnh...') return customValue.trim();
        if (selectedValue === 'Tự động (AI Quyết định)' || selectedValue === 'Tự động' || selectedValue === 'Không thay đổi') return null;
        return selectedValue;
    };

    const handleGenerateSuggestion = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedSuggestionPost(null);
        setGeneratedSuggestionImagePrompt("");
        setGeneratedImages([]);
        try {
            const options = {
                context: getEffectiveValue(context, customContext),
                weather: getEffectiveValue(weather, customWeather),
                clothing: getEffectiveValue(clothing, customClothing),
                bodyType: getEffectiveValue(bodyType, customBodyType),
            };

            const [postResult, imagePromptResult] = await Promise.all([
                generatePostFromTopic(suggestionTopic, audienceType, kolName, options),
                generateImagePromptFromTopic(suggestionTopic, audienceType, options)
            ]);
            setGeneratedSuggestionPost(postResult);
            setGeneratedSuggestionImagePrompt(imagePromptResult);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Lỗi không xác định.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateImages = async () => {
        if (!generatedSuggestionImagePrompt) {
            setError("Vui lòng tạo gợi ý prompt trước.");
            return;
        }
        if (!lockedFace) {
            setError("Vui lòng khóa gương mặt KOL trước khi tạo ảnh.");
            return;
        }
        setIsGeneratingImages(true);
        setError(null);
        setGeneratedImages([]);
        try {
             const simpleSkinTone = (skinTone === 'Tự động (AI Quyết định)' || skinTone === 'Không thay đổi') ? null : skinTone;
             
             const promptOptions = {
                prompt: generatedSuggestionImagePrompt,
                audienceType,
                skinTone: simpleSkinTone,
                context: getEffectiveValue(context, customContext),
                clothing: getEffectiveValue(clothing, customClothing),
                bodyType: getEffectiveValue(bodyType, customBodyType),
                style: getEffectiveValue(style, customStyle),
                pose: getEffectiveValue(pose, customPose),
                cameraAngle: getEffectiveValue(cameraAngle, customCameraAngle),
                additionalRequirements,
            };
            const effectiveAspectRatio = getEffectiveValue(aspectRatio, customAspectRatio);

            const results = await generateContent(promptOptions, [lockedFace], numImages, effectiveAspectRatio || undefined, undefined, aiModel);
            const newImages: LibraryAsset[] = results.map((src, index) => ({
                id: `sugg_${Date.now()}_${index}`,
                src,
                prompt: generatedSuggestionImagePrompt,
                inputImages: [lockedFace],
                type: 'kol',
            }));
            setGeneratedImages(newImages);

        } catch (e) {
            const message = e instanceof Error ? e.message : "Lỗi không xác định.";
            setError(message);
        } finally {
            setIsGeneratingImages(false);
        }
    };
    
    return (
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-white">Gợi ý từ AI</h2>
            <p className="text-gray-400">Nhập một chủ đề hoặc ý tưởng, AI sẽ viết bài và gợi ý prompt tạo ảnh cho bạn.</p>
            <div className="space-y-4">
                <input 
                    type="text" 
                    value={suggestionTopic} 
                    onChange={e => setSuggestionTopic(e.target.value)} 
                    placeholder="VD: Một buổi sáng cuối tuần thư giãn" 
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900/50 rounded-lg">
                    <CustomizableSelect label="Bối cảnh" selectedValue={context} onSelectChange={(e) => setContext(e.target.value)} customValue={customContext} onCustomChange={(e) => setCustomContext(e.target.value)} options={currentContentOptions.contexts} />
                    <CustomizableSelect label="Thời tiết" selectedValue={weather} onSelectChange={(e) => setWeather(e.target.value)} customValue={customWeather} onCustomChange={(e) => setCustomWeather(e.target.value)} options={weatherOptions} />
                    <CustomizableSelect label="Trang phục" selectedValue={clothing} onSelectChange={(e) => setClothing(e.target.value)} customValue={customClothing} onCustomChange={(e) => setCustomClothing(e.target.value)} options={currentContentOptions.clothing} />
                    <CustomizableSelect label="Vóc dáng" selectedValue={bodyType} onSelectChange={(e) => setBodyType(e.target.value)} customValue={customBodyType} onCustomChange={(e) => setCustomBodyType(e.target.value)} options={currentBodyTypeOptions} />
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={handleGenerateSuggestion} disabled={isLoading} className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500">
                    {isLoading ? "Đang nghĩ..." : "Tạo gợi ý"}
                </button>
            </div>
            {isLoading && <div className="text-center py-4">Đang tạo gợi ý...</div>}
            {error && <div className="text-red-400">{error}</div>}

            {generatedSuggestionPost && (
                <div className="space-y-4 pt-4 border-t border-gray-700">
                    <div>
                        <h3 className="font-semibold text-lg text-indigo-400">Gợi ý bài viết</h3>
                        <div className="bg-gray-900 p-3 rounded-md mt-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold">{generatedSuggestionPost.title}</h4>
                                    <p className="whitespace-pre-wrap">{generatedSuggestionPost.content}</p>
                                </div>
                                <button onClick={() => handleCopyToClipboard(generatedSuggestionPost.content, 'suggestion-post')} className="ml-2 text-xs bg-gray-600 hover:bg-gray-500 text-white py-1 px-2 rounded flex-shrink-0">
                                    {copiedIdentifier === 'suggestion-post' ? 'Đã chép' : 'Chép'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Image Generation Section */}
                    <div className="pt-4 border-t border-gray-600 space-y-4">
                        <h3 className="font-semibold text-lg text-indigo-400">Tạo ảnh minh họa</h3>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Gợi ý Prompt ảnh (có thể chỉnh sửa)</label>
                            <textarea
                                value={generatedSuggestionImagePrompt}
                                onChange={e => setGeneratedSuggestionImagePrompt(e.target.value)}
                                rows={4}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white font-mono text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomizableSelect label="Phong cách" selectedValue={style} onSelectChange={e => setStyle(e.target.value)} customValue={customStyle} onCustomChange={e => setCustomStyle(e.target.value)} options={currentContentOptions.styles} />
                            <CustomizableSelect label="Tư thế" selectedValue={pose} onSelectChange={e => setPose(e.target.value)} customValue={customPose} onCustomChange={e => setCustomPose(e.target.value)} options={currentPoseOptions} />
                            <CustomizableSelect label="Góc chụp & Khung hình" selectedValue={cameraAngle} onSelectChange={e => setCameraAngle(e.target.value)} customValue={customCameraAngle} onCustomChange={e => setCustomCameraAngle(e.target.value)} options={cameraAngleOptions} />
                            <CustomizableSelect label="Kích thước ảnh" selectedValue={aspectRatio} onSelectChange={e => setAspectRatio(e.target.value)} customValue={customAspectRatio} onCustomChange={e => setCustomAspectRatio(e.target.value)} options={aspectRatioOptions} />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Yêu cầu phụ (Tùy chọn)</label>
                            <textarea 
                                value={additionalRequirements} 
                                onChange={e => setAdditionalRequirements(e.target.value)} 
                                rows={2} 
                                placeholder="VD: đeo một chiếc kính râm màu đen, không trang điểm..." 
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                            />
                        </div>

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
                                <label htmlFor="num-images-sugg" className="block text-sm font-medium text-gray-300 whitespace-nowrap mb-1">Số lượng ảnh</label>
                                <div className="flex items-center gap-2">
                                     <input 
                                        id="num-images-sugg" 
                                        type="range" 
                                        min="1" 
                                        max="10" 
                                        value={numImages} 
                                        onChange={e => setNumImages(parseInt(e.target.value))} 
                                        disabled={aiModel === MODEL_IMAGE_PRO}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50" 
                                    />
                                    <span className="bg-indigo-600 text-white text-lg font-bold rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">{numImages}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleGenerateImages} disabled={isGeneratingImages || !lockedFace} className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {isGeneratingImages ? "Đang tạo ảnh..." : "Tạo ảnh từ gợi ý"}
                        </button>
                        {!lockedFace && <p className="text-xs text-center text-yellow-400">Vui lòng khóa gương mặt KOL để có thể tạo ảnh.</p>}
                    </div>
                    
                    {isGeneratingImages && <div className="text-center py-4">Đang tạo ảnh...</div>}

                    {generatedImages.length > 0 && (
                        <div className="pt-4 border-t border-gray-600 space-y-2">
                             <div className="flex justify-end">
                                <button onClick={() => generatedImages.forEach(handleSaveToLibrary)} className="text-sm bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md flex items-center gap-1">
                                    <SaveIcon className="h-4 w-4" />
                                    Lưu tất cả
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {generatedImages.map(image => (
                                    <div key={image.id} className="relative group bg-gray-900 rounded-lg overflow-hidden">
                                        <img src={image.src} alt="Generated from suggestion" className="aspect-square object-cover w-full h-full" />
                                        <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                             <div className="flex flex-wrap gap-1 justify-center">
                                                <button onClick={() => setLightboxImageSrc(image.src)} title="Xem lớn" className="text-sm bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md"><SearchIcon className="h-4 w-4" /></button>
                                                <button onClick={() => handleDownloadImage(image.src, `KOL_suggestion_${image.id}.png`)} title="Tải về" className="text-sm bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"><DownloadIcon className="h-4 w-4" /></button>
                                                <button onClick={() => handleSaveToLibrary(image)} title="Lưu vào thư viện" className="text-sm bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"><SaveIcon className="h-4 w-4" /></button>
                                                <button onClick={() => handleOpenVeoModal(image)} title="Tạo Video" className="text-sm bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-md"><VideoCameraIcon className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
         </div>
    );
};

export default SuggestionTab;
