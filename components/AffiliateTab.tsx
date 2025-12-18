import React, { useState, FC, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { generateAffiliateCampaignStrategy, generateContent, generatePostForCalendarRow, editImage, generateCreativeVariationPrompts } from '../services/geminiService';
import { LockedFace, AudienceType, LibraryAsset, StrategyItem, QuickEditModalState } from '../types';
import { DownloadIcon, SaveIcon, SearchIcon, RefreshIcon, VideoCameraIcon, XMarkIcon, WandIcon, SparklesIcon } from './icons';
import { contentOptions, poseOptions } from '../data/contentOptions';

const loadingMessages = [
    "Nghiên cứu thị trường mục tiêu...",
    "Phân tích đối thủ cạnh tranh...",
    "Xây dựng phễu marketing...",
    "Thiết kế các điểm chạm khách hàng...",
    "Soạn thảo các bước hành động...",
    "Hoàn tất bản kế hoạch chiến lược...",
];


// Helper: File to Base64
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

// Props
interface AffiliateTabProps {
    audienceType: AudienceType;
    kolName: string;
    lockedFace: LockedFace | null;
    handleSaveToLibrary: (asset: LibraryAsset) => void;
    setLightboxImageSrc: (src: string | null) => void;
    handleOpenVeoModal: (image: LibraryAsset) => void;
    skinTone: string;
}

const AffiliateTab: FC<AffiliateTabProps> = ({ audienceType, kolName, lockedFace, handleSaveToLibrary, setLightboxImageSrc, handleOpenVeoModal, skinTone }) => {
    // Component State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    let lastStrategyStage = '';

    // New, more detailed inputs
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productLink, setProductLink] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [uniqueSellingPoint, setUniqueSellingPoint] = useState('');
    const [discountOffer, setDiscountOffer] = useState('');
    const [campaignGoal, setCampaignGoal] = useState('');

    const [generatedCampaign, setGeneratedCampaign] = useState<StrategyItem[]>([]);
    const [numImages, setNumImages] = useState(1);
    const [productImages, setProductImages] = useState<LockedFace[]>([]);
    const [editModalState, setEditModalState] = useState<QuickEditModalState>({ isOpen: false, image: null, editColor: '', editOutfitText: '', editOutfitSelection: 'Không thay đổi', editPose: 'Không thay đổi', customEditPose: '', editAdditionalReqs: '', isEditing: false });

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

    
    // Handlers
    const handleGenerateCampaign = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedCampaign([]);

        try {
            const result = await generateAffiliateCampaignStrategy(
                productName,
                productDescription,
                productLink,
                targetAudience,
                uniqueSellingPoint,
                discountOffer,
                campaignGoal,
                kolName
            );
            setGeneratedCampaign(result);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Lỗi không xác định.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };
    
     const handleGeneratePostForRow = async (rowIndex: number) => {
        setError(null);
        setGeneratedCampaign(prev => prev.map((row, index) => index === rowIndex ? { ...row, isGeneratingPost: true } : row));
        try {
            const post = await generatePostForCalendarRow(generatedCampaign[rowIndex], audienceType, kolName);
            setGeneratedCampaign(prev => prev.map((row, index) => index === rowIndex ? { ...row, generatedPost: post } : row));
        } catch(e) { 
            const message = e instanceof Error ? e.message : "Lỗi không xác định khi tạo bài viết.";
            setError(message);
        }
        finally { setGeneratedCampaign(prev => prev.map((row, index) => index === rowIndex ? { ...row, isGeneratingPost: false } : row)); }
    };

    const handleGenerateImagesForRow = async (rowIndex: number) => {
        if (!lockedFace) {
            setError("Vui lòng khóa gương mặt KOL trước khi tạo ảnh.");
            return;
        }
        setError(null);
        setGeneratedCampaign(prev => prev.map((row, i) => i === rowIndex ? { ...row, isGeneratingImages: true, generatedAssets: [] } : row));
        try {
            const rowData = generatedCampaign[rowIndex];
            
            let fullPrompt = rowData.imagePromptSuggestion;
            
            const imagesToUse: LockedFace[] = [lockedFace, ...productImages];
             if (productImages.length > 0) {
                fullPrompt += `\n- Yêu cầu sản phẩm: Lồng ghép sản phẩm từ các ảnh tham khảo (bắt đầu từ ảnh thứ 2) vào bối cảnh một cách tự nhiên.`;
            }

            const getEffectiveValue = (selectedValue: string) => {
                if (selectedValue === 'Tự động (AI Quyết định)' || selectedValue === 'Tự động' || selectedValue === 'Không thay đổi') return null;
                return selectedValue;
            };
            const promptOptions = {
                prompt: fullPrompt,
                audienceType,
                skinTone: getEffectiveValue(skinTone),
            };
            const results = await generateContent(promptOptions, imagesToUse, numImages);
            const newAssets: LibraryAsset[] = results.map((src, i) => ({
                id: `aff_strat_${Date.now()}_${i}`, src, prompt: fullPrompt, inputImages: imagesToUse
            }));
            setGeneratedCampaign(prev => prev.map((row, i) => i === rowIndex ? { ...row, generatedAssets: newAssets } : row));
        } catch (e) {
            const message = e instanceof Error ? e.message : "Lỗi không xác định khi tạo ảnh.";
            setError(message);
        } finally {
            setGeneratedCampaign(prev => prev.map((row, i) => i === rowIndex ? { ...row, isGeneratingImages: false } : row));
        }
    };
    
     const handleRegenerateForRowImage = async (rowIndex: number, assetToRegen: LibraryAsset) => {
        if (!lockedFace) { setError("Vui lòng khóa gương mặt KOL."); return; }
        setGeneratedCampaign(prev => prev.map((r, i) => i !== rowIndex ? r : { ...r, generatedAssets: r.generatedAssets?.map(a => a.id === assetToRegen.id ? {...a, isRegenerating: true} : a) }));
        try {
            const results = await generateContent({ prompt: assetToRegen.prompt }, assetToRegen.inputImages || [lockedFace], 1);
            if (results.length > 0) {
                const newAsset = { ...assetToRegen, src: results[0], isRegenerating: false };
                setGeneratedCampaign(prev => prev.map((r, i) => i !== rowIndex ? r : { ...r, generatedAssets: r.generatedAssets?.map(a => a.id === assetToRegen.id ? newAsset : a) }));
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Lỗi tạo lại ảnh.");
        } finally {
            setGeneratedCampaign(prev => prev.map((r, i) => i !== rowIndex ? r : { ...r, generatedAssets: r.generatedAssets?.map(a => a.id === assetToRegen.id ? {...a, isRegenerating: false} : a) }));
        }
    };

    const handleGenerateVariationForRow = async (rowIndex: number, sourceAsset: LibraryAsset) => {
        if (!lockedFace) { setError("Vui lòng khóa gương mặt KOL."); return; }
        setGeneratedCampaign(prev => prev.map((r, i) => i === rowIndex ? { ...r, isGeneratingImages: true } : r));
        try {
            const sourceImagePart = { base64: sourceAsset.src.split(',')[1], mimeType: sourceAsset.src.match(/data:(image\/[^;]+);/)?.[1] || 'image/png' };
            const variationPrompts = await generateCreativeVariationPrompts(sourceAsset.prompt, sourceImagePart);
            const imagesToUse = [lockedFace, sourceImagePart, ...productImages];
            const imagePromises = variationPrompts.map(prompt => {
                const getEffectiveSkinTone = (selectedValue: string) => (selectedValue === 'Tự động (AI Quyết định)' || selectedValue === 'Không thay đổi') ? null : selectedValue;
                const promptOptions = {
                    prompt: `**YÊU CẦU BIẾN THỂ:** Giữ mặt từ ảnh 1, phong cách từ ảnh 2, sản phẩm từ các ảnh sau. **KỊCH BẢN:** ${prompt}`,
                    audienceType,
                    skinTone: getEffectiveSkinTone(skinTone),
                };
                return generateContent(promptOptions, imagesToUse, 1);
            });
            const resultsArrays = await Promise.all(imagePromises);
            const newAssets = resultsArrays.flat().map((src, index) => ({
                id: `var_aff_${sourceAsset.id}_${index}`, src, prompt: variationPrompts[index], inputImages: imagesToUse
            }));
            setGeneratedCampaign(prev => prev.map((r, i) => i === rowIndex ? { ...r, generatedAssets: newAssets } : r));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Lỗi tạo biến thể.");
        } finally {
            setGeneratedCampaign(prev => prev.map((r, i) => i === rowIndex ? { ...r, isGeneratingImages: false } : r));
        }
    };

    const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const imagePromises = files.map(async file => {
                if (!(file instanceof File)) return null;
                const base64 = (await fileToBase64(file)).split(',')[1];
                return { base64, mimeType: file.type };
            });
            const newImages = (await Promise.all(imagePromises)).filter((img): img is LockedFace => !!img);
            setProductImages(prev => [...prev, ...newImages]);
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
            
            setGeneratedCampaign(prev => prev.map((row, index) => {
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
        const folder = zip.folder("affiliate-images");
        if (!folder) return;
        assets.forEach((asset, index) => {
            const base64Data = asset.src.split(',')[1];
            if (base64Data) folder.file(`image_${index + 1}_${asset.id}.png`, base64Data, { base64: true });
        });
        try {
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `affiliate_images_${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            setError("Lỗi khi nén tệp tin.");
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
                        <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-300">1. Đổi màu trang phục</label>
                             <input type="text" placeholder="VD: màu xanh navy..." value={editColor} onChange={(e) => setEditModalState(p => ({...p, editColor: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white" />
                        </div>
                        <div className="text-center text-gray-400 text-sm">hoặc</div>
                        <CustomizableSelect label="2. Thay đổi trang phục" selectedValue={editOutfitSelection} onSelectChange={e => setEditModalState(p => ({...p, editOutfitSelection: e.target.value}))} customValue={editOutfitText} onCustomChange={e => setEditModalState(p => ({...p, editOutfitText: e.target.value}))} options={contentOptions[audienceType].clothing} />
                        <div className="text-center text-gray-400 text-sm">hoặc</div>
                        <CustomizableSelect label="3. Thay đổi tư thế" selectedValue={editPose} onSelectChange={e => setEditModalState(p => ({...p, editPose: e.target.value}))} customValue={customEditPose} onCustomChange={e => setEditModalState(p => ({...p, customEditPose: e.target.value}))} options={poseOptions[audienceType]} />
                         <div className="text-center text-gray-400 text-sm">hoặc</div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">4. Yêu cầu tùy chỉnh khác</label>
                            <textarea placeholder="VD: thêm một chiếc kính râm..." value={editAdditionalReqs} onChange={(e) => setEditModalState(p => ({...p, editAdditionalReqs: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white" rows={2}/>
                        </div>
                        <button onClick={handleQuickEdit} disabled={isEditing} className="w-full bg-teal-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-500">{isEditing ? 'Đang chỉnh sửa...' : 'Thực hiện'}</button>
                    </div>
                </div>
            </div>
        );
    };


    // Render logic
    return (
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Xây dựng Chiến dịch Affiliate</h2>
                <p className="text-gray-400 mt-1">Cung cấp thông tin chi tiết, AI sẽ xây dựng một chiến dịch quảng bá hoàn chỉnh theo phễu marketing.</p>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tên sản phẩm</label>
                        <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="VD: Son môi Super Matte" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Mục tiêu chiến dịch</label>
                        <input type="text" value={campaignGoal} onChange={e => setCampaignGoal(e.target.value)} placeholder="VD: Tăng doanh số, thu thập data khách hàng..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Mô tả sản phẩm</label>
                    <textarea value={productDescription} onChange={e => setProductDescription(e.target.value)} rows={3} placeholder="Mô tả chi tiết về sản phẩm, tính năng, lợi ích..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Đối tượng khách hàng mục tiêu</label>
                        <input type="text" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="VD: Nữ nhân viên văn phòng 25-35 tuổi" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Điểm bán hàng độc nhất (USP)</label>
                        <input type="text" value={uniqueSellingPoint} onChange={e => setUniqueSellingPoint(e.target.value)} placeholder="VD: Lâu trôi nhất thị trường, không chứa chì" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Ưu đãi / Giảm giá (Nếu có)</label>
                        <input type="text" value={discountOffer} onChange={e => setDiscountOffer(e.target.value)} placeholder="VD: Giảm 20% cho 100 đơn hàng đầu tiên" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Link Affiliate</label>
                        <input type="text" value={productLink} onChange={e => setProductLink(e.target.value)} placeholder="https://..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Ảnh sản phẩm (Tùy chọn)</label>
                    <p className="text-xs text-gray-400 mb-2">Tải lên ảnh sản phẩm để AI nhận diện và đưa vào hình ảnh quảng cáo.</p>
                    <input id="product-images-upload" type="file" multiple className="sr-only" onChange={handleProductImageUpload} accept="image/png, image/jpeg, image/webp" />
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
            </div>
            
            <button onClick={handleGenerateCampaign} disabled={isLoading} className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500">
                {isLoading ? loadingMessage : 'Tạo Chiến dịch'}
            </button>
             <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-300">Số lượng ảnh mỗi lần tạo</label>
                <input type="range" min="1" max="4" value={numImages} onChange={e => setNumImages(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                <span className="bg-indigo-600 text-white text-lg font-bold rounded-full h-8 w-8 flex items-center justify-center">{numImages}</span>
            </div>

            {error && <div className="mt-4 bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md" role="alert">{error}</div>}
            
            {generatedCampaign.length > 0 && (
                 <div className="pt-4 border-t border-gray-700 space-y-4">
                     <h3 className="font-bold text-xl text-center">Kế hoạch Chiến dịch Affiliate</h3>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {generatedCampaign.map((row, index) => {
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
                                <div className="flex gap-2 items-center flex-wrap">
                                    <button onClick={() => handleGeneratePostForRow(index)} disabled={row.isGeneratingPost} className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded disabled:bg-gray-500">{row.isGeneratingPost ? "Đang viết..." : "Viết bài"}</button>
                                    <button onClick={() => handleGenerateImagesForRow(index)} disabled={row.isGeneratingImages} className="text-xs bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded disabled:bg-gray-500">{row.isGeneratingImages ? "Đang vẽ..." : "Tạo ảnh"}</button>
                                </div>
                                {row.generatedPost && (
                                    <div className="bg-gray-800 p-2 rounded-md text-sm w-full">
                                        <strong className="block">{row.generatedPost.title}</strong>
                                        <p className="whitespace-pre-wrap mt-1">{row.generatedPost.caption}</p>
                                    </div>
                                )}
                                {row.isGeneratingImages && <div className="text-center text-sm text-gray-400">Đang tạo ảnh...</div>}
                                {row.generatedAssets && row.generatedAssets.length > 0 && (
                                    <>
                                        <div className="flex justify-end my-2">
                                            <button onClick={() => handleDownloadAllForRow(row.generatedAssets!)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded flex items-center gap-1">
                                                <DownloadIcon className="h-3 w-3" />
                                                Tải tất cả
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {row.generatedAssets.map(asset => (
                                                <div key={asset.id} className="relative group bg-gray-800 rounded-md overflow-hidden">
                                                    {asset.isRegenerating ? <div className="aspect-square flex items-center justify-center text-xs">Đang tạo...</div> : <img src={asset.src} alt="Generated asset" className="aspect-square object-cover w-full h-full" />}
                                                    <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                                        <div className="flex flex-wrap gap-1 justify-center">
                                                            <button onClick={() => handleOpenVeoModal(asset)} title="Tạo Video" className="text-sm bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-md"><VideoCameraIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => handleRegenerateForRowImage(index, asset)} title="Tạo lại" className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-md"><RefreshIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => handleGenerateVariationForRow(index, asset)} title="Biến thể" className="text-sm bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-md"><SparklesIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => setEditModalState({ isOpen: true, image: asset, rowIndex: index, editColor: '', editOutfitText: '', editOutfitSelection: 'Không thay đổi', editPose: 'Không thay đổi', customEditPose: '', editAdditionalReqs: '', isEditing: false })} title="Sửa nhanh" className="text-sm bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-md"><WandIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => setLightboxImageSrc(asset.src)} title="Xem lớn" className="text-sm bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md"><SearchIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => handleDownloadImage(asset.src, `KOL_asset_${asset.id}.png`)} title="Tải về" className="text-sm bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"><DownloadIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => handleSaveToLibrary(asset)} title="Lưu" className="text-sm bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"><SaveIcon className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
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

export default AffiliateTab;