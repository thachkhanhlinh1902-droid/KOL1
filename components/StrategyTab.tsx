
import React, { useState, FC, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { generateChannelStrategy, generateFunnelDesign, generateOfferStack, generateLandingPageCopy, generatePostForCalendarRow, generateContent, editImage, generateCreativeVariationPrompts, MODEL_IMAGE_FLASH, MODEL_IMAGE_PRO } from '../services/geminiService';
import { strategyOptions, contentOptions, poseOptions } from '../data/contentOptions';
import { StrategyItem, LockedFace, AudienceType, LibraryAsset, QuickEditModalState } from '../types';
import { DownloadIcon, SaveIcon, SearchIcon, RefreshIcon, SparklesIcon, WandIcon, VideoCameraIcon, XMarkIcon } from './icons';

interface StrategyTabProps {
    audienceType: AudienceType;
    kolName: string;
    lockedFace: LockedFace | null;
    handleSaveToLibrary: (asset: LibraryAsset) => void;
    setLightboxImageSrc: (src: string | null) => void;
    handleOpenVeoModal: (image: LibraryAsset) => void;
    skinTone: string;
}

const loadingMessages = [
    "Nghiên cứu thị trường mục tiêu...",
    "Phân tích đối thủ cạnh tranh...",
    "Xây dựng phễu marketing...",
    "Thiết kế các điểm chạm khách hàng...",
    "Soạn thảo các bước hành động...",
    "Hoàn tất bản kế hoạch chiến lược...",
];

const handleDownloadImage = (imageSrc: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

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
                />
            )}
        </div>
    );
};


const StrategyTab: FC<StrategyTabProps> = ({ audienceType, kolName, lockedFace, handleSaveToLibrary, setLightboxImageSrc, handleOpenVeoModal, skinTone }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

    const [strategyType, setStrategyType] = useState<keyof typeof strategyOptions['female']>('channel');
    
    const [strategySelections, setStrategySelections] = useState({
        channel_goal: strategyOptions[audienceType].channel.goals[0],
        channel_platform: 'Instagram',
        channel_niche: strategyOptions[audienceType].channel.niches[0],
        funnel_product: strategyOptions[audienceType].funnel.products[0],
        funnel_audience: strategyOptions[audienceType].funnel.audiences[0],
        funnel_goal: 'sales',
        offer_product: strategyOptions[audienceType].offer.products[0],
        offer_price: '500,000 VNĐ',
        offer_problem: strategyOptions[audienceType].offer.problems[0],
        landing_product: strategyOptions[audienceType].landing.products[0],
        landing_audience: strategyOptions[audienceType].landing.audiences[0],
        landing_cta: strategyOptions[audienceType].landing.ctas[0],
    });

    const [strategyCustomInputs, setStrategyCustomInputs] = useState({
        channel_goal: '', channel_platform: '', channel_niche: '',
        funnel_product: '', funnel_audience: '',
        offer_product: '', offer_price: '', offer_problem: '',
        landing_product: '', landing_audience: '', landing_cta: '',
    });

    const [generatedStrategy, setGeneratedStrategy] = useState<StrategyItem[]>([]);
    const [numImages, setNumImages] = useState(1);
    const [aiModel, setAiModel] = useState<string>(MODEL_IMAGE_FLASH);
    
    const [editModalState, setEditModalState] = useState<QuickEditModalState>({ isOpen: false, image: null, editColor: '', editOutfitText: '', editOutfitSelection: 'Không thay đổi', editPose: 'Không thay đổi', customEditPose: '', editAdditionalReqs: '', isEditing: false });

    let lastStrategyStage = '';
    
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
        const currentAudienceOptions = strategyOptions[audienceType];
        setStrategySelections(prev => ({
            ...prev,
            channel_goal: currentAudienceOptions.channel.goals[0],
            channel_niche: currentAudienceOptions.channel.niches[0],
            funnel_product: currentAudienceOptions.funnel.products[0],
            funnel_audience: currentAudienceOptions.funnel.audiences[0],
            offer_product: currentAudienceOptions.offer.products[0],
            offer_problem: currentAudienceOptions.offer.problems[0],
            landing_product: currentAudienceOptions.landing.products[0],
            landing_audience: currentAudienceOptions.landing.audiences[0],
            landing_cta: currentAudienceOptions.landing.ctas[0],
        }));
         setStrategyCustomInputs({
            channel_goal: '', channel_platform: '', channel_niche: '',
            funnel_product: '', funnel_audience: '',
            offer_product: '', offer_price: '', offer_problem: '',
            landing_product: '', landing_audience: '', landing_cta: '',
        });
    }, [audienceType]);

    // Update count when model changes
    useEffect(() => {
        if (aiModel === MODEL_IMAGE_PRO) {
            setNumImages(1);
        }
    }, [aiModel]);

    const handleSelectionChange = (key: keyof typeof strategySelections, value: string) => {
        setStrategySelections(prev => ({ ...prev, [key]: value }));
    };

    const handleCustomInputChange = (key: keyof typeof strategyCustomInputs, value: string) => {
        setStrategyCustomInputs(prev => ({ ...prev, [key]: value }));
    };

    const getEffectiveValue = (key: keyof typeof strategySelections) => {
        const selectedValue = strategySelections[key];
        const customValue = strategyCustomInputs[key as keyof typeof strategyCustomInputs];
        if (selectedValue === 'Tùy chỉnh...') {
            return customValue.trim();
        }
        return selectedValue;
    };

    const handleGenerateStrategy = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedStrategy([]);
        try {
            let result;
            switch (strategyType) {
                case 'channel':
                    result = await generateChannelStrategy(getEffectiveValue('channel_goal'), getEffectiveValue('channel_platform'), getEffectiveValue('channel_niche'), kolName);
                    break;
                case 'funnel':
                    result = await generateFunnelDesign(getEffectiveValue('funnel_product'), getEffectiveValue('funnel_audience'), getEffectiveValue('funnel_goal'), kolName);
                    break;
                case 'offer':
                    result = await generateOfferStack(getEffectiveValue('offer_product'), getEffectiveValue('offer_price'), getEffectiveValue('offer_problem'), kolName);
                    break;
                case 'landing':
                    result = await generateLandingPageCopy(getEffectiveValue('landing_product'), getEffectiveValue('landing_audience'), getEffectiveValue('landing_cta'), kolName);
                    break;
                default:
                    throw new Error("Loại chiến lược không hợp lệ.");
            }
            setGeneratedStrategy(result);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Lỗi không xác định.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGeneratePostForRow = async (rowIndex: number) => {
        setError(null);
        setGeneratedStrategy(prev => prev.map((row, index) => index === rowIndex ? { ...row, isGeneratingPost: true } : row));
        try {
            const post = await generatePostForCalendarRow(generatedStrategy[rowIndex], audienceType, kolName);
            setGeneratedStrategy(prev => prev.map((row, index) => index === rowIndex ? { ...row, generatedPost: post } : row));
        } catch (e) {
            const message = e instanceof Error ? e.message : "Lỗi không xác định khi tạo bài viết.";
            setError(message);
        } finally {
            setGeneratedStrategy(prev => prev.map((row, index) => index === rowIndex ? { ...row, isGeneratingPost: false } : row));
        }
    };
    
    const handleGenerateImagesForRow = async (rowIndex: number) => {
        if (!lockedFace) {
            setError("Vui lòng khóa gương mặt KOL trước khi tạo ảnh.");
            return;
        }
        setError(null);
        setGeneratedStrategy(prev => prev.map((row, i) => i === rowIndex ? { ...row, isGeneratingImages: true, generatedAssets: [] } : row));
        try {
            const rowData = generatedStrategy[rowIndex];
            const getEffectiveSkinTone = (selectedValue: string) => (selectedValue === 'Tự động (AI Quyết định)' || selectedValue === 'Không thay đổi') ? null : selectedValue;
            const promptOptions = { 
                prompt: rowData.imagePromptSuggestion, 
                audienceType,
                skinTone: getEffectiveSkinTone(skinTone),
            };
            const results = await generateContent(promptOptions, [lockedFace], numImages, undefined, undefined, aiModel);
            const newAssets: LibraryAsset[] = results.map((src, i) => ({
                id: `strat_${Date.now()}_${i}`, src, prompt: rowData.imagePromptSuggestion, inputImages: [lockedFace]
            }));
            setGeneratedStrategy(prev => prev.map((row, i) => i === rowIndex ? { ...row, generatedAssets: newAssets } : row));
        } catch (e) {
            const message = e instanceof Error ? e.message : "Lỗi không xác định khi tạo ảnh.";
            setError(message);
        } finally {
            setGeneratedStrategy(prev => prev.map((row, i) => i === rowIndex ? { ...row, isGeneratingImages: false } : row));
        }
    };
    
    const handleRegenerateForRowImage = async (rowIndex: number, assetToRegen: LibraryAsset) => {
        if (!lockedFace) { setError("Vui lòng khóa gương mặt KOL."); return; }
        setGeneratedStrategy(prev => prev.map((r, i) => i !== rowIndex ? r : { ...r, generatedAssets: r.generatedAssets?.map(a => a.id === assetToRegen.id ? {...a, isRegenerating: true} : a) }));
        try {
            const getEffectiveSkinTone = (selectedValue: string) => (selectedValue === 'Tự động (AI Quyết định)' || selectedValue === 'Không thay đổi') ? null : selectedValue;
            const promptOptions = { 
                prompt: assetToRegen.prompt, 
                audienceType,
                skinTone: getEffectiveSkinTone(skinTone),
            };
            const results = await generateContent(promptOptions, assetToRegen.inputImages || [lockedFace], 1, undefined, undefined, aiModel);
            if (results.length > 0) {
                const newAsset = { ...assetToRegen, src: results[0], isRegenerating: false };
                setGeneratedStrategy(prev => prev.map((r, i) => i !== rowIndex ? r : { ...r, generatedAssets: r.generatedAssets?.map(a => a.id === assetToRegen.id ? newAsset : a) }));
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Lỗi tạo lại ảnh.");
        } finally {
            setGeneratedStrategy(prev => prev.map((r, i) => i !== rowIndex ? r : { ...r, generatedAssets: r.generatedAssets?.map(a => a.id === assetToRegen.id ? {...a, isRegenerating: false} : a) }));
        }
    };

    const handleGenerateVariationForRow = async (rowIndex: number, sourceAsset: LibraryAsset) => {
        if (!lockedFace) { setError("Vui lòng khóa gương mặt KOL."); return; }
        setGeneratedStrategy(prev => prev.map((r, i) => i === rowIndex ? { ...r, isGeneratingImages: true } : r));
        try {
            const sourceImagePart = { base64: sourceAsset.src.split(',')[1], mimeType: sourceAsset.src.match(/data:(image\/[^;]+);/)?.[1] || 'image/png' };
            const variationPrompts = await generateCreativeVariationPrompts(sourceAsset.prompt, sourceImagePart);
            const imagesToUse = [lockedFace, sourceImagePart];
            const imagePromises = variationPrompts.map(prompt => {
                 const getEffectiveSkinTone = (selectedValue: string) => (selectedValue === 'Tự động (AI Quyết định)' || selectedValue === 'Không thay đổi') ? null : selectedValue;
                 const promptOptions = {
                    prompt: `**YÊU CẦU BIẾN THỂ:**\n1. **GƯƠNG MẶT:** Giữ 100% gương mặt từ ảnh 1.\n2. **PHONG CÁCH:** Lấy cảm hứng từ ảnh 2.\n3. **KỊCH BẢN:** ${prompt}`,
                    audienceType,
                    skinTone: getEffectiveSkinTone(skinTone),
                };
                return generateContent(promptOptions, imagesToUse, 1);
            });
            const resultsArrays = await Promise.all(imagePromises);
            const newAssets = resultsArrays.flat().map((src, index) => ({
                id: `var_strat_${sourceAsset.id}_${index}`, src, prompt: variationPrompts[index], inputImages: imagesToUse
            }));
            setGeneratedStrategy(prev => prev.map((r, i) => i === rowIndex ? { ...r, generatedAssets: newAssets } : r));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Lỗi tạo biến thể.");
        } finally {
            setGeneratedStrategy(prev => prev.map((r, i) => i === rowIndex ? { ...r, isGeneratingImages: false } : r));
        }
    };
    
    const handleQuickEdit = async () => {
        const { image, editColor, editOutfitText, editOutfitSelection, editPose, customEditPose, editAdditionalReqs, rowIndex } = editModalState;
        if (!image || rowIndex === undefined) return;
        
        let instruction = '';
        const getEffectiveValue = (sel: string, cust: string) => sel === 'Tùy chỉnh...' ? cust.trim() : (sel === 'Tự động (AI Quyết định)' || sel === 'Không thay đổi') ? null : sel;
        const effectiveOutfit = getEffectiveValue(editOutfitSelection, editOutfitText);
        const effectivePose = getEffectiveValue(editPose, customEditPose);
        const effectiveAdditionalReqs = editAdditionalReqs.trim();
        
        if (editColor.trim()) {
            instruction = `YÊU CẦU: Chỉ thay đổi MÀU SẮC của trang phục thành '${editColor.trim()}'. Giữ nguyên mọi thứ khác.`;
        } else if (effectiveOutfit) {
            instruction = `YÊU CẦU: Chỉ thay đổi TRANG PHỤC thành '${effectiveOutfit}'. Giữ nguyên mọi thứ khác.`;
        } else if (effectivePose) {
            instruction = `YÊU CẦU: Chỉ thay đổi TƯ THẾ của nhân vật thành '${effectivePose}'. Giữ nguyên mọi thứ khác.`;
        } else if (effectiveAdditionalReqs) {
            instruction = `YÊU CẦU: ${effectiveAdditionalReqs}. Giữ nguyên mọi thứ khác càng nhiều càng tốt.`;
        } else { return; }

        setEditModalState(prev => ({ ...prev, isEditing: true }));
        try {
            const sourceImage = { base64: image.src.split(',')[1], mimeType: image.src.match(/data:(image\/[^;]+);/)?.[1] || 'image/png' };
            const resultSrc = await editImage(instruction, sourceImage);
            const newImage = { ...image, src: resultSrc, prompt: `Chỉnh sửa: "${instruction}"\n---\n${image.prompt}` };
            
            setGeneratedStrategy(prev => prev.map((row, index) => {
                if (index === rowIndex) {
                    return { ...row, generatedAssets: row.generatedAssets?.map(asset => asset.id === image.id ? newImage : asset) };
                }
                return row;
            }));
            
            setEditModalState({ isOpen: false, image: null, editColor: '', editOutfitText: '', editOutfitSelection: 'Không thay đổi', editPose: 'Không thay đổi', customEditPose: '', editAdditionalReqs: '', isEditing: false });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Lỗi chỉnh sửa ảnh.");
        } finally {
            setEditModalState(prev => ({ ...prev, isEditing: false }));
        }
    };

    const handleDownloadAllForRow = async (assets: LibraryAsset[]) => {
        if (!assets || assets.length === 0) return;
        const zip = new JSZip();
        const folder = zip.folder("strategy-images");
        if (!folder) return;
        assets.forEach((asset, index) => {
            const base64Data = asset.src.split(',')[1];
            if (base64Data) folder.file(`image_${index + 1}_${asset.id}.png`, base64Data, { base64: true });
        });
        try {
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `strategy_images_${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            setError("Lỗi khi nén tệp tin.");
        }
    };

    const renderStrategyInputs = () => {
        const currentAudienceOptions = strategyOptions[audienceType];
        switch(strategyType) {
            case 'channel':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CustomizableSelect label="Mục tiêu kênh" selectedValue={strategySelections.channel_goal} onSelectChange={e => handleSelectionChange('channel_goal', e.target.value)} customValue={strategyCustomInputs.channel_goal} onCustomChange={e => handleCustomInputChange('channel_goal', e.target.value)} options={currentAudienceOptions.channel.goals} />
                        <CustomizableSelect label="Nền tảng" selectedValue={strategySelections.channel_platform} onSelectChange={e => handleSelectionChange('channel_platform', e.target.value)} customValue={strategyCustomInputs.channel_platform} onCustomChange={e => handleCustomInputChange('channel_platform', e.target.value)} options={['Facebook', 'TikTok', 'YouTube', 'Blog']} />
                        <CustomizableSelect label="Lĩnh vực (Niche)" selectedValue={strategySelections.channel_niche} onSelectChange={e => handleSelectionChange('channel_niche', e.target.value)} customValue={strategyCustomInputs.channel_niche} onCustomChange={e => handleCustomInputChange('channel_niche', e.target.value)} options={currentAudienceOptions.channel.niches} />
                    </div>
                );
            case 'funnel':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CustomizableSelect label="Sản phẩm/Dịch vụ" selectedValue={strategySelections.funnel_product} onSelectChange={e => handleSelectionChange('funnel_product', e.target.value)} customValue={strategyCustomInputs.funnel_product} onCustomChange={e => handleCustomInputChange('funnel_product', e.target.value)} options={currentAudienceOptions.funnel.products} />
                        <CustomizableSelect label="Đối tượng mục tiêu" selectedValue={strategySelections.funnel_audience} onSelectChange={e => handleSelectionChange('funnel_audience', e.target.value)} customValue={strategyCustomInputs.funnel_audience} onCustomChange={e => handleCustomInputChange('funnel_audience', e.target.value)} options={currentAudienceOptions.funnel.audiences} />
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Mục tiêu phễu</label><select value={strategySelections.funnel_goal} onChange={e => handleSelectionChange('funnel_goal', e.target.value)} className="w-full bg-gray-700 border border-gray-600 p-2 rounded-md h-[42px]"><option value="sales">Bán hàng</option><option value="lead_generation">Thu thập leads</option></select></div>
                    </div>
                );
            case 'offer':
                 return (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CustomizableSelect label="Sản phẩm/Quà tặng" selectedValue={strategySelections.offer_product} onSelectChange={e => handleSelectionChange('offer_product', e.target.value)} customValue={strategyCustomInputs.offer_product} onCustomChange={e => handleCustomInputChange('offer_product', e.target.value)} options={currentAudienceOptions.offer.products} />
                        <CustomizableSelect label="Vấn đề giải quyết" selectedValue={strategySelections.offer_problem} onSelectChange={e => handleSelectionChange('offer_problem', e.target.value)} customValue={strategyCustomInputs.offer_problem} onCustomChange={e => handleCustomInputChange('offer_problem', e.target.value)} options={currentAudienceOptions.offer.problems} />
                        <input type="text" value={strategyCustomInputs.offer_price || strategySelections.offer_price} onChange={e => handleCustomInputChange('offer_price', e.target.value)} placeholder="Giá sản phẩm chính" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white self-end" />
                    </div>
                );
            case 'landing':
                 return (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CustomizableSelect label="Sản phẩm/Dịch vụ" selectedValue={strategySelections.landing_product} onSelectChange={e => handleSelectionChange('landing_product', e.target.value)} customValue={strategyCustomInputs.landing_product} onCustomChange={e => handleCustomInputChange('landing_product', e.target.value)} options={currentAudienceOptions.landing.products} />
                        <CustomizableSelect label="Đối tượng mục tiêu" selectedValue={strategySelections.landing_audience} onSelectChange={e => handleSelectionChange('landing_audience', e.target.value)} customValue={strategyCustomInputs.landing_audience} onCustomChange={e => handleCustomInputChange('landing_audience', e.target.value)} options={currentAudienceOptions.landing.audiences} />
                        <CustomizableSelect label="Kêu gọi hành động (CTA)" selectedValue={strategySelections.landing_cta} onSelectChange={e => handleSelectionChange('landing_cta', e.target.value)} customValue={strategyCustomInputs.landing_cta} onCustomChange={e => handleCustomInputChange('landing_cta', e.target.value)} options={currentAudienceOptions.landing.ctas} />
                    </div>
                );
            default: return null;
        }
    };

    const renderQuickEditModal = () => {
        const { isOpen, image, isEditing, editColor, editOutfitSelection, editOutfitText, editPose, customEditPose, editAdditionalReqs } = editModalState;
        if (!isOpen) return null;
        const resetAndClose = () => setEditModalState({ isOpen: false, image: null, editColor: '', editOutfitText: '', editOutfitSelection: 'Không thay đổi', editPose: 'Không thay đổi', customEditPose: '', editAdditionalReqs: '', isEditing: false });
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <h2 className="text-2xl font-bold text-white">Sửa nhanh</h2>
                        <button onClick={resetAndClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-8 w-8" /></button>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <img src={image?.src} alt="Image to edit" className="rounded-lg w-full max-w-sm mx-auto" />
                        <CustomizableSelect label="1. Đổi màu trang phục" selectedValue={editColor} onSelectChange={e => setEditModalState(p => ({...p, editColor: e.target.value}))} customValue={editColor} onCustomChange={e => setEditModalState(p => ({...p, editColor: e.target.value}))} options={[]} />
                        <div className="text-center text-gray-400 text-sm">hoặc</div>
                        <CustomizableSelect label="2. Thay đổi trang phục" selectedValue={editOutfitSelection} onSelectChange={e => setEditModalState(p => ({...p, editOutfitSelection: e.target.value}))} customValue={editOutfitText} onCustomChange={e => setEditModalState(p => ({...p, editOutfitText: e.target.value}))} options={contentOptions[audienceType].clothing} />
                        <div className="text-center text-gray-400 text-sm">hoặc</div>
                        <CustomizableSelect label="3. Thay đổi tư thế" selectedValue={editPose} onSelectChange={e => setEditModalState(p => ({...p, editPose: e.target.value}))} customValue={customEditPose} onCustomChange={e => setEditModalState(p => ({...p, customEditPose: e.target.value}))} options={poseOptions[audienceType]} />
                        <div className="text-center text-gray-400 text-sm">hoặc</div>
                        <div><label className="block text-sm font-medium text-gray-300">4. Yêu cầu tùy chỉnh khác</label><textarea value={editAdditionalReqs} onChange={e => setEditModalState(p => ({...p, editAdditionalReqs: e.target.value}))} className="w-full bg-gray-800 border-gray-600 rounded-md p-2 mt-1" rows={2}/></div>
                        <button onClick={handleQuickEdit} disabled={isEditing} className="w-full bg-teal-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-500">{isEditing ? 'Đang chỉnh sửa...' : 'Thực hiện'}</button>
                    </div>
                </div>
            </div>
        );
    };
    
    return (
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Xây dựng Chiến lược Marketing</h2>
                <p className="text-gray-400 mt-1">Chọn loại chiến lược và cung cấp thông tin, AI sẽ tạo một kế hoạch chi tiết.</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg">
                <button onClick={() => setStrategyType('channel')} className={`px-3 py-1 text-sm rounded-md w-full ${strategyType === 'channel' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Xây kênh</button>
                <button onClick={() => setStrategyType('funnel')} className={`px-3 py-1 text-sm rounded-md w-full ${strategyType === 'funnel' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Phễu Marketing</button>
                <button onClick={() => setStrategyType('offer')} className={`px-3 py-1 text-sm rounded-md w-full ${strategyType === 'offer' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Tạo Offer</button>
                <button onClick={() => setStrategyType('landing')} className={`px-3 py-1 text-sm rounded-md w-full ${strategyType === 'landing' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Landing Page</button>
            </div>
            
            <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg">{renderStrategyInputs()}</div>

            <button onClick={handleGenerateStrategy} disabled={isLoading} className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500">{isLoading ? loadingMessage : 'Tạo Chiến lược'}</button>
            <div className="flex items-center gap-4">
                 <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Mô hình AI</label>
                    <select 
                        value={aiModel} 
                        onChange={(e) => setAiModel(e.target.value)} 
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm focus:ring-indigo-500"
                    >
                        <option value={MODEL_IMAGE_FLASH}>Gemini 2.5 Flash</option>
                        <option value={MODEL_IMAGE_PRO}>Gemini 3.0 Pro</option>
                    </select>
                </div>
                <div className="w-1/2">
                    <label className="text-sm font-medium text-gray-300">Số lượng ảnh mỗi lần tạo</label>
                    <div className="flex items-center gap-2">
                        <input 
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
                </div>
            </div>
            {error && <div className="mt-4 bg-red-900 text-red-300 px-4 py-3 rounded-md">{error}</div>}
            
            {generatedStrategy.length > 0 && (
                 <div className="pt-4 border-t border-gray-700 space-y-4">
                    <h3 className="font-bold text-xl text-center">Kế hoạch Hành động</h3>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {generatedStrategy.map((row, index) => {
                            const showStageHeader = row.stage && row.stage !== lastStrategyStage;
                            if(showStageHeader) { lastStrategyStage = row.stage!; }
                            return (
                            <React.Fragment key={index}>
                                {showStageHeader && <h4 className="text-lg font-semibold mt-4 pt-3 border-t border-gray-600 text-indigo-400">{row.stage}</h4>}
                                <div className="bg-gray-700 p-3 rounded-md space-y-3">
                                    <div>
                                        <p><strong>{row.task}</strong>: {row.description}</p>
                                        <p className="text-xs text-indigo-300 bg-gray-800 p-2 rounded mt-1"><strong>Gợi ý ảnh:</strong> {row.imagePromptSuggestion}</p>
                                    </div>
                                    <div className="flex gap-2 items-center flex-wrap"><button onClick={() => handleGeneratePostForRow(index)} disabled={row.isGeneratingPost} className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded disabled:bg-gray-500">{row.isGeneratingPost ? "Đang viết..." : "Viết bài"}</button><button onClick={() => handleGenerateImagesForRow(index)} disabled={row.isGeneratingImages || !lockedFace} className="text-xs bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded disabled:bg-gray-500">{row.isGeneratingImages ? "Đang vẽ..." : "Tạo ảnh"}</button></div>
                                    {row.generatedPost && <div className="bg-gray-800 p-2 rounded-md text-sm w-full"><strong className="block">{row.generatedPost.title}</strong><p className="whitespace-pre-wrap mt-1">{row.generatedPost.caption}</p></div>}
                                    {row.isGeneratingImages && <div className="text-center text-sm text-gray-400">Đang tạo ảnh...</div>}
                                    {row.generatedAssets && row.generatedAssets.length > 0 && (
                                        <><div className="flex justify-end my-2"><button onClick={() => handleDownloadAllForRow(row.generatedAssets!)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded flex items-center gap-1"><DownloadIcon className="h-3 w-3" />Tải tất cả</button></div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {row.generatedAssets.map(asset => (
                                                <div key={asset.id} className="relative group bg-gray-800 rounded-md overflow-hidden">
                                                    {asset.isRegenerating ? <div className="aspect-square flex items-center justify-center text-xs">Đang tạo...</div> : <img src={asset.src} alt="Generated asset" className="aspect-square object-cover w-full h-full" />}
                                                    <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                                        <div className="flex flex-wrap gap-1 justify-center">
                                                            <button onClick={() => handleOpenVeoModal(asset)} title="Tạo Video" className="bg-pink-500 p-2 rounded-md"><VideoCameraIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => handleRegenerateForRowImage(index, asset)} title="Tạo lại" className="bg-indigo-500 p-2 rounded-md"><RefreshIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => handleGenerateVariationForRow(index, asset)} title="Biến thể" className="bg-purple-500 p-2 rounded-md"><SparklesIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => setEditModalState({ isOpen: true, image: asset, rowIndex: index, editColor: '', editOutfitText: '', editOutfitSelection: 'Không thay đổi', editPose: 'Không thay đổi', customEditPose: '', editAdditionalReqs: '', isEditing: false })} title="Sửa nhanh" className="bg-orange-500 p-2 rounded-md"><WandIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => setLightboxImageSrc(asset.src)} title="Xem lớn" className="bg-gray-500 p-2 rounded-md"><SearchIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => handleDownloadImage(asset.src, `KOL_asset_${asset.id}.png`)} title="Tải về" className="bg-blue-500 p-2 rounded-md"><DownloadIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => handleSaveToLibrary(asset)} title="Lưu" className="bg-green-500 p-2 rounded-md"><SaveIcon className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div></>
                                    )}
                                </div>
                            </React.Fragment>
                        )})}
                    </div>
                </div>
            )}
            {editModalState.isOpen && renderQuickEditModal()}
        </div>
    );
};

export default StrategyTab;
