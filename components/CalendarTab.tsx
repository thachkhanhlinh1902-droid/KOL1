
import React, { useState, FC, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { generateContentCalendar, generatePostForCalendarRow, generateContent, editImage, generateCreativeVariationPrompts, MODEL_IMAGE_FLASH, MODEL_IMAGE_PRO } from '../services/geminiService';
import { CalendarRow, LockedFace, AudienceType, LibraryAsset, QuickEditModalState } from '../types';
import { DownloadIcon, SaveIcon, SearchIcon, RefreshIcon, SparklesIcon, WandIcon, VideoCameraIcon, XMarkIcon } from './icons';
import { contentOptions, calendarTopicOptions, weatherOptions, bodyTypeOptions, captionToneOptions, poseOptions, cameraAngleOptions, aspectRatioOptions } from '../data/contentOptions';


const loadingMessages = [
    "Lên ý tưởng chiến lược...",
    "Vẽ sơ đồ tư duy cho tháng...",
    "Tham khảo xu hướng nội dung mới nhất...",
    "Sắp xếp lịch trình sáng tạo...",
    "Viết các chủ đề chính...",
    "Hoàn thiện lịch nội dung...",
];

const handleDownloadImage = (imageSrc: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
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
    includeAuto?: boolean;
}> = ({ label, selectedValue, onSelectChange, customValue, onCustomChange, options, disabled = false, includeAuto = true }) => {
    const allOptions = [
        ...(includeAuto ? ["Tự động (AI Quyết định)"] : []),
        "Tùy chỉnh...",
        ...options
    ];
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

interface CalendarTabProps {
    audienceType: AudienceType;
    kolName: string;
    lockedFace: LockedFace | null;
    handleSaveToLibrary: (asset: LibraryAsset) => void;
    setLightboxImageSrc: (src: string | null) => void;
    handleOpenVeoModal: (image: LibraryAsset) => void;
    skinTone: string;
}

const CalendarTab: FC<CalendarTabProps> = ({ audienceType, kolName, lockedFace, handleSaveToLibrary, setLightboxImageSrc, handleOpenVeoModal, skinTone }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

    const [topic, setTopic] = useState('Tự động (AI Quyết định)');
    const [customTopic, setCustomTopic] = useState('');
    const [tone, setTone] = useState('Tự động (AI Quyết định)');
    const [customTone, setCustomTone] = useState('');
    const [weather, setWeather] = useState('Tự động (AI Quyết định)');
    const [customWeather, setCustomWeather] = useState('');
    const [bodyType, setBodyType] = useState('Tự động (AI Quyết định)');
    const [customBodyType, setCustomBodyType] = useState('');
    const [style, setStyle] = useState('Tự động (AI Quyết định)');
    const [customStyle, setCustomStyle] = useState('');

    const [calendarRows, setCalendarRows] = useState<CalendarRow[]>([]);
    
    // FIX: Add state for number of images to generate per row
    const [numImages, setNumImages] = useState(1);
    const [aiModel, setAiModel] = useState<string>(MODEL_IMAGE_FLASH);

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

    // Update count when model changes
    useEffect(() => {
        if (aiModel === MODEL_IMAGE_PRO) {
            setNumImages(1);
        }
    }, [aiModel]);
    
    const getEffectiveValue = (selectedValue: string, customValue: string) => {
        if (selectedValue === 'Tùy chỉnh...') return customValue.trim();
        if (selectedValue === 'Tự động (AI Quyết định)' || selectedValue === 'Tự động' || selectedValue === 'Không thay đổi') return null;
        return selectedValue;
    };

    const handleGenerateCalendar = async () => {
        setIsLoading(true);
        setError(null);
        setCalendarRows([]);
        
        const audienceMap = {
            female: 'một KOL nữ',
            male: 'một KOL nam',
            girl: 'một KOL bé gái',
            boy: 'một KOL bé trai',
        };

        let prompt = `Bạn là một chuyên gia sáng tạo nội dung mạng xã hội. Hãy tạo một lịch nội dung cho 1 tháng (4 tuần) cho ${audienceMap[audienceType]} ${kolName ? `tên là ${kolName}` : ''}.`;
        const details = [
            getEffectiveValue(topic, customTopic) && `Chủ đề chính: ${getEffectiveValue(topic, customTopic)}`,
            getEffectiveValue(tone, customTone) && `Giọng văn (tone of voice): ${getEffectiveValue(tone, customTone)}`,
            getEffectiveValue(weather, customWeather) && `Bối cảnh thời tiết chủ đạo: ${getEffectiveValue(weather, customWeather)}`,
            getEffectiveValue(bodyType, customBodyType) && `Vóc dáng của KOL: ${getEffectiveValue(bodyType, customBodyType)}`,
            getEffectiveValue(style, customStyle) && `Phong cách hình ảnh chung: ${getEffectiveValue(style, customStyle)}`
        ].filter(Boolean);

        if (details.length > 0) {
            prompt += `\n**Bối cảnh chung của chiến dịch:**\n- ${details.join('\n- ')}`;
        }
        
        try {
            const result = await generateContentCalendar(prompt);
            setCalendarRows(result.map(row => ({ ...row, style: 'Tự động (AI Quyết định)', customStyle: '', pose: 'Tự động (AI Quyết định)', customPose: '', cameraAngle: 'Tự động (AI Quyết định)', customCameraAngle: '', aspectRatio: aspectRatioOptions[0], customAspectRatio: '', additionalRequirements: '' })));
        } catch (e) {
            const message = e instanceof Error ? e.message : "Lỗi không xác định.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGeneratePostForRow = async (rowIndex: number) => {
        setError(null);
        setCalendarRows(prev => prev.map((row, index) => index === rowIndex ? { ...row, isGeneratingPost: true } : row));
        try {
            const calendarSettings = {
                topic: getEffectiveValue(topic, customTopic),
                tone: getEffectiveValue(tone, customTone),
                weather: getEffectiveValue(weather, customWeather),
                bodyType: getEffectiveValue(bodyType, customBodyType),
                style: getEffectiveValue(style, customStyle)
            };
            const post = await generatePostForCalendarRow(calendarRows[rowIndex], audienceType, kolName, 'long', calendarSettings);
            setCalendarRows(prev => prev.map((row, index) => index === rowIndex ? { ...row, generatedPost: post } : row));
        } catch (e) {
            const message = e instanceof Error ? e.message : "Lỗi không xác định khi tạo bài viết.";
            setError(message);
        } finally {
            setCalendarRows(prev => prev.map((row, index) => index === rowIndex ? { ...row, isGeneratingPost: false } : row));
        }
    };

    // FIX: Update function to handle multiple images based on `numImages` state.
    const handleGenerateImagesForRow = async (rowIndex: number) => {
        if (!lockedFace) {
            setError("Vui lòng khóa gương mặt KOL trước khi tạo ảnh.");
            return;
        }
        setError(null);
        setCalendarRows(prev => prev.map((row, i) => i === rowIndex ? { ...row, isGeneratingImages: true, generatedAssets: [] } : row));
        try {
            const rowData = calendarRows[rowIndex];
            const getEffectiveSkinTone = (selectedValue: string) => {
                if (selectedValue === 'Tự động (AI Quyết định)' || selectedValue === 'Không thay đổi') return null;
                return selectedValue;
            };
            
            const promptOptions = { 
                prompt: rowData.imagePromptSuggestion, 
                audienceType,
                skinTone: getEffectiveSkinTone(skinTone),
                style: getEffectiveValue(rowData.style || 'Tự động (AI Quyết định)', rowData.customStyle || ''),
                pose: getEffectiveValue(rowData.pose || 'Tự động (AI Quyết định)', rowData.customPose || ''),
                cameraAngle: getEffectiveValue(rowData.cameraAngle || 'Tự động (AI Quyết định)', rowData.customCameraAngle || ''),
                additionalRequirements: rowData.additionalRequirements || '',
            };
            const effectiveAspectRatio = getEffectiveValue(rowData.aspectRatio || aspectRatioOptions[0], rowData.customAspectRatio || '');

            const results = await generateContent(promptOptions, [lockedFace], numImages, effectiveAspectRatio || undefined, undefined, aiModel);
            
            const newAssets: LibraryAsset[] = results.map((src, i) => ({
                id: `cal_${Date.now()}_${i}`,
                src,
                prompt: rowData.imagePromptSuggestion,
                inputImages: [lockedFace],
                blogTitle: rowData.generatedPost?.title,
                blogContent: rowData.generatedPost?.caption,
            }));
            setCalendarRows(prev => prev.map((row, i) => i === rowIndex ? { ...row, generatedAssets: newAssets } : row));
        } catch (e) {
            const message = e instanceof Error ? e.message : "Lỗi không xác định khi tạo ảnh.";
            setError(message);
        } finally {
            setCalendarRows(prev => prev.map((row, i) => i === rowIndex ? { ...row, isGeneratingImages: false } : row));
        }
    };

    const handleRegenerateForRowImage = async (rowIndex: number, assetToRegen: LibraryAsset) => {
        if (!lockedFace) { setError("Vui lòng khóa gương mặt KOL."); return; }
        setCalendarRows(prev => prev.map((r, i) => i !== rowIndex ? r : { ...r, generatedAssets: r.generatedAssets?.map(a => a.id === assetToRegen.id ? {...a, isRegenerating: true} : a) }));
        try {
            const rowData = calendarRows[rowIndex];
            const getEffectiveSkinTone = (selectedValue: string) => (selectedValue === 'Tự động (AI Quyết định)' || selectedValue === 'Không thay đổi') ? null : selectedValue;
             const promptOptions = { 
                prompt: assetToRegen.prompt, 
                audienceType,
                skinTone: getEffectiveSkinTone(skinTone),
                style: getEffectiveValue(rowData.style || 'Tự động (AI Quyết định)', rowData.customStyle || ''),
                pose: getEffectiveValue(rowData.pose || 'Tự động (AI Quyết định)', rowData.customPose || ''),
                cameraAngle: getEffectiveValue(rowData.cameraAngle || 'Tự động (AI Quyết định)', rowData.customCameraAngle || ''),
                additionalRequirements: rowData.additionalRequirements || '',
            };
            const effectiveAspectRatio = getEffectiveValue(rowData.aspectRatio || aspectRatioOptions[0], rowData.customAspectRatio || '');
            const results = await generateContent(promptOptions, assetToRegen.inputImages || [lockedFace], 1, effectiveAspectRatio || undefined, undefined, aiModel);

            if (results.length > 0) {
                const newAsset = { ...assetToRegen, src: results[0], isRegenerating: false };
                setCalendarRows(prev => prev.map((r, i) => i !== rowIndex ? r : { ...r, generatedAssets: r.generatedAssets?.map(a => a.id === assetToRegen.id ? newAsset : a) }));
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Lỗi tạo lại ảnh.");
        } finally {
            setCalendarRows(prev => prev.map((r, i) => i !== rowIndex ? r : { ...r, generatedAssets: r.generatedAssets?.map(a => a.id === assetToRegen.id ? {...a, isRegenerating: false} : a) }));
        }
    };

    const handleGenerateVariationForRow = async (rowIndex: number, sourceAsset: LibraryAsset) => {
        if (!lockedFace) { setError("Vui lòng khóa gương mặt KOL."); return; }
        setCalendarRows(prev => prev.map((r, i) => i === rowIndex ? { ...r, isGeneratingVariation: true } : r));
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
                id: `var_cal_${sourceAsset.id}_${index}`, src, prompt: variationPrompts[index], inputImages: imagesToUse
            }));
            setCalendarRows(prev => prev.map((r, i) => i === rowIndex ? { ...r, variationResult: { source: sourceAsset, variations: newAssets } } : r));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Lỗi tạo biến thể.");
        } finally {
            setCalendarRows(prev => prev.map((r, i) => i === rowIndex ? { ...r, isGeneratingVariation: false } : r));
        }
    };
    
    // FIX: Add helper function to download all images in a row as a ZIP file.
    const handleDownloadAllForRow = async (assets: LibraryAsset[]) => {
        if (!assets || assets.length === 0) return;
        const zip = new JSZip();
        const folder = zip.folder("calendar-images");
        if (!folder) return;

        assets.forEach((asset, index) => {
            const base64Data = asset.src.split(',')[1];
            if (base64Data) {
                folder.file(`image_${index + 1}_${asset.id}.png`, base64Data, { base64: true });
            }
        });
        
        try {
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `calendar_images_${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error("Error zipping files:", err);
            setError("Lỗi khi nén tệp tin.");
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
        } else {
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
                id: `edit_${image.id}_${Date.now()}`,
                src: resultSrc,
                prompt: `Chỉnh sửa: "${instruction}"\n---\nPrompt gốc:\n${image.prompt}`,
                inputImages: [sourceImage],
            };
            
            setCalendarRows(prev => prev.map((row, index) => {
                if (index === rowIndex) {
                    return { ...row, generatedAssets: [newImage, ...(row.generatedAssets || []).filter(asset => asset.id !== image.id)] };
                }
                return row;
            }));
            
            setEditModalState({ isOpen: false, image: null, editColor: '', editOutfitText: '', editOutfitSelection: 'Không thay đổi', editPose: 'Không thay đổi', customEditPose: '', editAdditionalReqs: '', isEditing: false });

        } catch (e) {
             const message = e instanceof Error ? e.message : "Lỗi không xác định.";
             setError(message);
        } finally {
            setEditModalState(prev => ({ ...prev, isEditing: false }));
        }
    };
    
    return (
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">Tạo Lịch Nội dung</h2>
                <p className="text-gray-400 mt-1">Xác định các thông số cho chiến dịch, AI sẽ tạo một lịch nội dung chi tiết cho cả tháng.</p>
            </div>
            
            <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <CustomizableSelect label="Chủ đề chính" selectedValue={topic} onSelectChange={e => setTopic(e.target.value)} customValue={customTopic} onCustomChange={e => setCustomTopic(e.target.value)} options={calendarTopicOptions[audienceType]} />
                     <CustomizableSelect label="Giọng văn (Tone)" selectedValue={tone} onSelectChange={e => setTone(e.target.value)} customValue={customTone} onCustomChange={e => setCustomTone(e.target.value)} options={captionToneOptions} />
                     <CustomizableSelect label="Thời tiết chủ đạo" selectedValue={weather} onSelectChange={e => setWeather(e.target.value)} customValue={customWeather} onCustomChange={e => setCustomWeather(e.target.value)} options={weatherOptions} />
                     <CustomizableSelect label="Vóc dáng KOL" selectedValue={bodyType} onSelectChange={e => setBodyType(e.target.value)} customValue={customBodyType} onCustomChange={e => setCustomBodyType(e.target.value)} options={bodyTypeOptions[audienceType]} />
                     <CustomizableSelect label="Phong cách hình ảnh" selectedValue={style} onSelectChange={e => setStyle(e.target.value)} customValue={customStyle} onCustomChange={e => setCustomStyle(e.target.value)} options={contentOptions[audienceType].styles} />
                </div>
            </div>
            <button onClick={handleGenerateCalendar} disabled={isLoading} className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500">{isLoading ? loadingMessage : 'Tạo Lịch Nội dung'}</button>
            {error && <div className="mt-4 bg-red-900 text-red-300 px-4 py-3 rounded-md">{error}</div>}
            
            {calendarRows.length > 0 && (
                <div className="pt-4 border-t border-gray-700 space-y-4">
                    <h3 className="font-bold text-xl text-center">Lịch Nội dung Đề xuất</h3>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {calendarRows.map((row, index) => (
                            <div key={index} className="bg-gray-700 p-3 rounded-md space-y-3">
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                    <div className="font-semibold">{row.day}</div>
                                    <div className="col-span-1">{row.contentType}</div>
                                    <div className="col-span-2">{row.description}</div>
                                </div>
                                <p className="text-xs text-indigo-300 bg-gray-800 p-2 rounded"><strong>Gợi ý ảnh:</strong> {row.imagePromptSuggestion}</p>
                                <div className="flex gap-2 items-center flex-wrap"><button onClick={() => handleGeneratePostForRow(index)} disabled={row.isGeneratingPost} className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded disabled:bg-gray-500">{row.isGeneratingPost ? "Đang viết..." : "Viết bài"}</button><button onClick={() => handleGenerateImagesForRow(index)} disabled={row.isGeneratingImages || !lockedFace} className="text-xs bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded disabled:bg-gray-500">{row.isGeneratingImages ? "Đang vẽ..." : "Tạo ảnh"}</button></div>
                                {row.generatedPost && <div className="bg-gray-800 p-2 rounded-md text-sm w-full"><strong className="block">{row.generatedPost.title}</strong><p className="whitespace-pre-wrap mt-1">{row.generatedPost.caption}</p></div>}
                                
                                <div className="pt-2 border-t border-gray-600 space-y-2">
                                    <details>
                                        <summary className="cursor-pointer text-xs text-gray-400">Tùy chỉnh ảnh...</summary>
                                        <div className="p-2 mt-2 bg-gray-800/50 rounded-lg space-y-2">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                <CustomizableSelect label="" selectedValue={row.style || ''} onSelectChange={e => setCalendarRows(p => p.map((r, i) => i === index ? {...r, style: e.target.value} : r))} customValue={row.customStyle || ''} onCustomChange={e => setCalendarRows(p => p.map((r, i) => i === index ? {...r, customStyle: e.target.value} : r))} options={contentOptions[audienceType].styles} />
                                                <CustomizableSelect label="" selectedValue={row.pose || ''} onSelectChange={e => setCalendarRows(p => p.map((r, i) => i === index ? {...r, pose: e.target.value} : r))} customValue={row.customPose || ''} onCustomChange={e => setCalendarRows(p => p.map((r, i) => i === index ? {...r, customPose: e.target.value} : r))} options={poseOptions[audienceType]} />
                                                <CustomizableSelect label="" selectedValue={row.cameraAngle || ''} onSelectChange={e => setCalendarRows(p => p.map((r, i) => i === index ? {...r, cameraAngle: e.target.value} : r))} customValue={row.customCameraAngle || ''} onCustomChange={e => setCalendarRows(p => p.map((r, i) => i === index ? {...r, customCameraAngle: e.target.value} : r))} options={cameraAngleOptions} />
                                                <CustomizableSelect label="" selectedValue={row.aspectRatio || ''} onSelectChange={e => setCalendarRows(p => p.map((r, i) => i === index ? {...r, aspectRatio: e.target.value} : r))} customValue={row.customAspectRatio || ''} onCustomChange={e => setCalendarRows(p => p.map((r, i) => i === index ? {...r, customAspectRatio: e.target.value} : r))} options={aspectRatioOptions} />
                                            </div>
                                             <input type="text" placeholder="Yêu cầu phụ..." value={row.additionalRequirements} onChange={e => setCalendarRows(p => p.map((r, i) => i === index ? {...r, additionalRequirements: e.target.value} : r))} className="w-full bg-gray-700 border-gray-600 rounded p-1 text-sm" />
                                        </div>
                                    </details>
                                </div>
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
                                        <label className="text-sm font-medium text-gray-300">Số lượng ảnh</label>
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
                                {row.isGeneratingImages && <div className="text-center text-sm text-gray-400">Đang tạo ảnh...</div>}
                                {row.generatedAssets && row.generatedAssets.length > 0 && (
                                    <><div className="flex justify-end my-2 gap-2">
                                        <button onClick={() => row.generatedAssets?.forEach(handleSaveToLibrary)} className="text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded flex items-center gap-1"><SaveIcon className="h-3 w-3" />Lưu tất cả</button>
                                        <button onClick={() => handleDownloadAllForRow(row.generatedAssets!)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded flex items-center gap-1"><DownloadIcon className="h-3 w-3" />Tải tất cả</button>
                                    </div>
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
                                 {row.variationResult && (
                                    <div className="mt-2 space-y-2">
                                        <h5 className="text-sm font-semibold">Biến thể:</h5>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {row.variationResult.variations.map(vAsset => (
                                                <div key={vAsset.id} className="relative group bg-gray-800 rounded-md overflow-hidden">
                                                    <img src={vAsset.src} alt="Generated variation" className="aspect-square object-cover w-full h-full" />
                                                    <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                                         <div className="flex flex-wrap gap-1 justify-center">
                                                            <button onClick={() => setLightboxImageSrc(vAsset.src)} title="Xem lớn" className="bg-gray-500 p-2 rounded-md"><SearchIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => handleDownloadImage(vAsset.src, `KOL_variation_${vAsset.id}.png`)} title="Tải về" className="bg-blue-500 p-2 rounded-md"><DownloadIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => handleSaveToLibrary(vAsset)} title="Lưu" className="bg-green-500 p-2 rounded-md"><SaveIcon className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
             {editModalState.isOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                             <h2 className="text-2xl font-bold text-white">Sửa nhanh</h2>
                             <button onClick={() => setEditModalState(p => ({...p, isOpen: false}))} className="text-gray-400 hover:text-white"><XMarkIcon className="h-8 w-8" /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <img src={editModalState.image?.src} alt="Image to edit" className="rounded-lg w-full max-w-sm mx-auto" />
                             <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">1. Đổi màu trang phục</label>
                                <input type="text" placeholder="VD: màu xanh navy..." value={editModalState.editColor} onChange={(e) => setEditModalState(p => ({...p, editColor: e.target.value}))} disabled={editModalState.isEditing} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"/>
                            </div>
                            <div className="text-center text-gray-400 text-sm">hoặc</div>
                            <CustomizableSelect label="2. Thay đổi trang phục" selectedValue={editModalState.editOutfitSelection} onSelectChange={e => setEditModalState(p => ({...p, editOutfitSelection: e.target.value}))} customValue={editModalState.editOutfitText} onCustomChange={e => setEditModalState(p => ({...p, editOutfitText: e.target.value}))} options={contentOptions[audienceType].clothing} disabled={editModalState.isEditing} />
                            <div className="text-center text-gray-400 text-sm">hoặc</div>
                             <CustomizableSelect label="3. Thay đổi tư thế" selectedValue={editModalState.editPose} onSelectChange={e => setEditModalState(p => ({...p, editPose: e.target.value}))} customValue={editModalState.customEditPose} onCustomChange={e => setEditModalState(p => ({...p, customEditPose: e.target.value}))} options={poseOptions[audienceType]} disabled={editModalState.isEditing} />
                            <div className="text-center text-gray-400 text-sm">hoặc</div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">4. Yêu cầu tùy chỉnh khác</label>
                                <textarea placeholder="VD: thêm một chiếc kính râm..." value={editModalState.editAdditionalReqs} onChange={e => setEditModalState(p => ({...p, editAdditionalReqs: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white" rows={2} disabled={editModalState.isEditing}/>
                            </div>
                            <button onClick={handleQuickEdit} disabled={editModalState.isEditing} className="w-full bg-teal-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-500">{editModalState.isEditing ? 'Đang chỉnh sửa...' : 'Thực hiện'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarTab;
