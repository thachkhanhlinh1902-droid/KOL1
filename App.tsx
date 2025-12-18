

import React, { useState, useCallback, FC, SVGProps } from 'react';
import JSZip from 'jszip';
import { generateContent, generateVideo, generateKOLName, generateCreativeVariationPrompts, editImage } from './services/geminiService';
import { LockedFace, LibraryAsset, VeoModalState, QuickEditModalState, AudienceType } from './types';
import { BookOpenIcon, XMarkIcon, SearchIcon, RefreshIcon, VideoCameraIcon, DownloadIcon, TrashIcon, SparklesIcon, WandIcon } from './components/icons';
import { contentOptions, poseOptions } from './data/contentOptions';


// Tab Components
import CreativeTab, { Controls as CreativeTabControls } from './components/CreativeTab';
import SuggestionTab from './components/SuggestionTab';
import CaptionsTab from './components/CaptionsTab';
import CalendarTab from './components/CalendarTab';
import StrategyTab from './components/StrategyTab';
import AffiliateTab from './components/AffiliateTab';

// Helper component
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


// UTILS
const handleDownloadImage = (imageSrc: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// MAIN APP COMPONENT
const App: FC = () => {
    // STATE MANAGEMENT
    const [activeTab, setActiveTab] = useState<string>('creative');
    const [kolName, setKolName] = useState('');
    const [audienceType, setAudienceType] = useState<AudienceType>('female');
    const [lockedFace, setLockedFace] = useState<LockedFace | null>(null);
    const [skinTone, setSkinTone] = useState<string>('Tự động (AI Quyết định)');
    const [resetKey, setResetKey] = useState(0);
    
    const [library, setLibrary] = useState<LibraryAsset[]>([]);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [selectedLibraryAsset, setSelectedLibraryAsset] = useState<LibraryAsset | null>(null);
    const [lightboxImageSrc, setLightboxImageSrc] = useState<string | null>(null);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [generatingVariationId, setGeneratingVariationId] = useState<string | null>(null);
    const [libraryFilter, setLibraryFilter] = useState<'all' | 'kol_video' | 'outfit' | 'background'>('all');
    const [libraryVariationResults, setLibraryVariationResults] = useState<{ source: LibraryAsset, variations: LibraryAsset[] } | null>(null);

    // Video state
    const [veoModalState, setVeoModalState] = useState<VeoModalState>({
        isOpen: false, image: null, prompts: [], idea: '', isGeneratingVideo: false, generatedVideoSrc: null, generatedVideoPrompt: null, error: null, aspectRatio: '16:9', resolution: '1080p', negativePrompt: ''
    });
    
    // Library Quick Edit State
    const [libraryQuickEditModalState, setLibraryQuickEditModalState] = useState<QuickEditModalState>({
        isOpen: false, image: null, editColor: '', editOutfitText: '',
        editOutfitSelection: 'Không thay đổi',
        editPose: 'Không thay đổi', customEditPose: '', 
        editAdditionalReqs: '', isEditing: false
    });

    // HANDLERS
    const handleAudienceChange = useCallback((newAudience: AudienceType) => {
        setAudienceType(newAudience);
        // Reset quick edit modal state to use correct clothing options
        setLibraryQuickEditModalState(prev => ({ ...prev, editOutfitSelection: 'Không thay đổi' }));
    }, []);

    const handleSkinToneChange = useCallback((newTone: string) => {
        setSkinTone(newTone);
    }, []);

    const handleSaveToLibrary = (asset: LibraryAsset) => {
        setLibrary(prev => [asset, ...prev.filter(item => item.id !== asset.id)]);
    };

    const handleDeleteFromLibrary = (id: string) => {
        setLibrary(prev => prev.filter(item => item.id !== id));
        if (selectedLibraryAsset?.id === id) {
            setSelectedLibraryAsset(null);
        }
    };
    
    const handleImportLibrary = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const importedLibrary = JSON.parse(text);
                    if (Array.isArray(importedLibrary) && importedLibrary.every(item => typeof item === 'object' && item !== null && 'id' in item && 'src' in item && 'prompt' in item)) {
                        const merged = [...importedLibrary, ...library];
                        const unique = merged.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
                        setLibrary(unique);
                        alert(`Đã nhập thành công ${importedLibrary.length} mục.`);
                    } else {
                        throw new Error("Tệp không hợp lệ.");
                    }
                } catch (importError: unknown) {
                    const message = importError instanceof Error ? importError.message : "Đã xảy ra lỗi không xác định.";
                    alert(`Lỗi khi nhập thư viện: ${message}`);
                }
            };
            reader.readAsText(file);
        }
    };

    const handleExportLibrary = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(library, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "kol-builder-library.json";
        link.click();
    };

    const handleGenerateKOLName = async () => {
        // This function is passed to the Controls component, which will manage its own loading state.
        const name = await generateKOLName(audienceType);
        setKolName(name);
    };

    const handleOpenVeoModal = (image: LibraryAsset) => {
        setVeoModalState({ 
            isOpen: true, 
            image: image, 
            prompts: [], 
            idea: '',
            isGeneratingVideo: false, 
            generatedVideoSrc: null,
            generatedVideoPrompt: null,
            error: null,
            aspectRatio: '16:9',
            resolution: '1080p',
            negativePrompt: ''
        });
    };

    const handleCloseVeoModal = () => {
        if (veoModalState.generatedVideoSrc && veoModalState.generatedVideoSrc.startsWith('blob:')) {
            URL.revokeObjectURL(veoModalState.generatedVideoSrc);
        }
        setVeoModalState(prev => ({ ...prev, isOpen: false, image: null, generatedVideoSrc: null, aspectRatio: '16:9', resolution: '1080p', negativePrompt: '' }));
    };

    const handleGenerateVeoPrompts = () => {
        if (!veoModalState.image) return;
        const { idea } = veoModalState;
        const baseRule = "\n- **LUẬT BẮT BUỘC - KHÔNG NGOẠI LỆ:** Giữ nguyên 100% nhân vật (bao gồm gương mặt, kiểu tóc), trang phục, và bối cảnh từ ảnh gốc. Video được tạo ra TUYỆT ĐỐI KHÔNG được chứa bất kỳ loại văn bản, chữ, logo, watermark, hay âm thanh lời thoại nào.";
        const prompts = [
            { title: "Gợi ý 1: Khoảnh khắc Tĩnh lặng (Cinemagraph)", prompt: `Tạo một video cinemagraph 8K siêu thực từ ảnh tĩnh. Chuyển động phải cực kỳ tinh tế, gần như không thể nhận thấy, tạo cảm giác một khoảnh khắc sống động bị đóng băng trong thời gian.\n- **Ý tưởng:** ${idea || 'Nhân vật chớp mắt cực chậm, một vài sợi tóc bay nhẹ trong gió thoảng, ánh sáng thay đổi một cách mềm mại trên da, hậu cảnh có chuyển động siêu nhỏ (lá cây rung rinh, gợn sóng lăn tăn). Toàn bộ video phải là một vòng lặp hoàn hảo.'}\n- **Yêu cầu:** Cinematic, hyperrealistic, subtle motion, seamless loop.` },
            { title: "Gợi ý 2: Chân dung Cảm xúc (Emotional Portrait)", prompt: `Tạo một video cận cảnh (close-up) 4K, mang đậm phong cách điện ảnh, tập trung vào biểu cảm vi tế và cảm xúc nội tâm. Sử dụng ống kính 85mm f/1.4 để tạo độ sâu trường ảnh nông.\n- **Ý tưởng:** ${idea || 'Nhân vật từ từ ngẩng đầu, ánh mắt chuyển từ suy tư, xa xăm sang nhìn thẳng vào ống kính với một nụ cười ấm áp, gần gũi. Ánh sáng mềm mại chiếu vào một bên mặt, tạo khối.'}\n- **Yêu cầu:** Chuyển động siêu chậm (extreme slow-motion), lấy nét vào mắt, ánh sáng dịu (soft lighting), bokeh đẹp.` },
            { title: "Gợi ý 3: Khoảnh khắc Tự nhiên (Candid Moment)", prompt: `Tạo một video góc máy trung bình (medium shot) ghi lại một khoảnh khắc tự nhiên, chân thật như một thước phim tài liệu được quay bằng máy quay cầm tay (handheld style).\n- **Ý tưởng:** ${idea || 'Nhân vật nhẹ nhàng vuốt tóc, sau đó cầm tách cà phê lên, thổi nhẹ cho nguội rồi nhấp một ngụm, ánh mắt nhìn ra xa với vẻ thư thái, bình yên.'}\n- **Yêu cầu:** Chuyển động mượt mà, không gượng ép, rung máy nhẹ tự nhiên, tông màu chân thực.` },
            { title: "Gợi ý 4: Cảnh quay Điện ảnh (Cinematic Scene)", prompt: `Tạo một cảnh quay điện ảnh ngắn, đầy kịch tính với chuyển động máy quay chuyên nghiệp. Sử dụng tông màu phim (film color grading).\n- **Ý tưởng:** ${idea || 'Máy quay tiến vào rất chậm (dolly-in) về phía nhân vật đang đứng yên, tạo cảm giác tập trung và hồi hộp. Có thể có hiệu ứng ánh đèn đường phản chiếu trên vũng nước mưa, hoặc ánh nắng xuyên qua cửa sổ tạo luồng sáng (god rays).'}\n- **Yêu cầu:** Sử dụng ánh sáng tương phản cao (chiaroscuro) để tạo chiều sâu, chuyển động máy quay mượt mà, tông màu điện ảnh (teal and orange, vintage look, etc.).` }
        ];
        setVeoModalState(prev => ({ ...prev, prompts: prompts.map(p => ({ ...p, prompt: p.prompt + baseRule })) }));
    };

    const handleGenerateVeoVideo = async (prompt: string) => {
        if (!veoModalState.image) return;

        try {
            // @ts-ignore
            if (!(await window.aistudio.hasSelectedApiKey())) {
                // @ts-ignore
                await window.aistudio.openSelectKey();
                // Optimistically assume success
            }
            
            setVeoModalState(prev => ({...prev, isGeneratingVideo: true, error: null, generatedVideoSrc: null, generatedVideoPrompt: prompt }));

            const imagePart: LockedFace = {
                base64: veoModalState.image.src.split(',')[1],
                mimeType: veoModalState.image.src.match(/data:(image\/[^;]+);/)?.[1] || 'image/png'
            };
            const videoUrl = await generateVideo(prompt, imagePart, {
                aspectRatio: veoModalState.aspectRatio,
                resolution: veoModalState.resolution,
                negativePrompt: veoModalState.negativePrompt
            });
            setVeoModalState(prev => ({...prev, generatedVideoSrc: videoUrl}));
        } catch (e) {
            const message = e instanceof Error ? e.message : "Lỗi không xác định.";
            if (message.includes("Requested entity was not found")) {
                alert("API key không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
            }
            setVeoModalState(prev => ({...prev, error: message}));
        } finally {
            setVeoModalState(prev => ({...prev, isGeneratingVideo: false}));
        }
    };
    
    const handleSaveVideoToLibrary = (videoSrc: string, prompt: string, imageSrc: string) => {
        if (!videoSrc) return;
        const newAsset: LibraryAsset = {
            id: `vid_${Date.now()}`,
            src: imageSrc,
            videoSrc: videoSrc,
            prompt: prompt,
            type: 'video',
        };
        setLibrary(prev => [newAsset, ...prev]);
        setVeoModalState(prev => ({...prev, generatedVideoSrc: null, generatedVideoPrompt: null}));
    };
    
    const handleResetApp = useCallback(() => {
        if (window.confirm("Bạn có chắc chắn muốn bắt đầu lại? Mọi cài đặt và KOL đã khóa sẽ được xóa bỏ, nhưng thư viện của bạn sẽ được giữ lại.")) {
            setActiveTab('creative');
            setKolName('');
            setAudienceType('female');
            setLockedFace(null);
            setSkinTone('Tự động (AI Quyết định)');
            // setLibrary([]); // Library is preserved as per user request
            setIsLibraryOpen(false);
            setSelectedLibraryAsset(null);
            setLightboxImageSrc(null);
            setLibraryVariationResults(null);
            setVeoModalState({
                isOpen: false, image: null, prompts: [], idea: '', isGeneratingVideo: false, generatedVideoSrc: null, generatedVideoPrompt: null, error: null, aspectRatio: '16:9', resolution: '1080p', negativePrompt: ''
            });
            setLibraryQuickEditModalState({
                 isOpen: false, image: null, editColor: '', editOutfitText: '',
                editOutfitSelection: 'Không thay đổi',
                editPose: 'Không thay đổi', customEditPose: '', 
                editAdditionalReqs: '', isEditing: false
            });
            // Also clear any session storage artifacts
            sessionStorage.removeItem('suggestionPrompt');
            sessionStorage.removeItem('backgroundToUse');
            sessionStorage.removeItem('outfitToUse');
            setResetKey(prevKey => prevKey + 1);
        }
    }, []);

    const handleSelectAsset = useCallback((asset: LibraryAsset) => {
        setSelectedLibraryAsset(asset);
    }, []);

    const renderNavButton = (tabId: string, icon: React.ReactElement<SVGProps<SVGSVGElement>>, text: string) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`flex flex-col items-center justify-center space-y-2 px-3 py-2 rounded-lg transition-all duration-200 ${activeTab === tabId ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
        >
            {React.cloneElement(icon, { className: "w-6 h-6"})}
            <span className="text-xs font-medium">{text}</span>
        </button>
    );

    const renderLibraryModal = () => {
        const localHandleRegenerate = async (image: LibraryAsset) => {
            setRegeneratingId(image.id);
            try {
                const sourceImagePart: LockedFace = {
                    base64: image.src.split(',')[1],
                    mimeType: image.src.match(/data:(image\/[^;]+);/)?.[1] || 'image/png'
                };
                
                const imagesToUse = image.inputImages ? [...image.inputImages] : [sourceImagePart];
                
                if (lockedFace) {
                     const existingFaceIndex = imagesToUse.findIndex(img => img.base64 === lockedFace.base64);
                     if (existingFaceIndex > 0) {
                        const [face] = imagesToUse.splice(existingFaceIndex, 1);
                        imagesToUse.unshift(face);
                     } else if (existingFaceIndex === -1) {
                        imagesToUse.unshift(lockedFace);
                     }
                }

                const results = await generateContent({ prompt: image.prompt }, imagesToUse, 1);
                const newImage = { ...image, src: results[0] };
                setLibrary(prev => prev.map(img => img.id === image.id ? newImage : img));
                if(selectedLibraryAsset?.id === image.id) {
                    setSelectedLibraryAsset(newImage);
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : "Đã xảy ra lỗi không xác định.";
                alert(`Lỗi khi tạo lại ảnh: ${message}`);
            } finally {
                setRegeneratingId(null);
            }
        };
        
        const localHandleGenerateVariation = async (sourceImage: LibraryAsset) => {
            if (!lockedFace) {
                alert("Vui lòng khóa gương mặt KOL trước khi tạo biến thể để đảm bảo tính nhất quán.");
                return;
            }
            setGeneratingVariationId(sourceImage.id);
            
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
                
                setLibraryVariationResults({ source: sourceImage, variations: newImages });

            } catch (e) {
                const message = e instanceof Error ? e.message : "Lỗi không xác định.";
                alert(`Lỗi khi tạo biến thể: ${message}`);
            } finally {
                setGeneratingVariationId(null);
            }
        };
        
        const handleUseAssetFromLibrary = (asset: LibraryAsset) => {
            const assetAsLockedFace: LockedFace = {
                base64: asset.src.split(',')[1],
                mimeType: asset.src.match(/data:(image\/[^;]+);/)?.[1] || 'image/png'
            };
            if (asset.type === 'background') {
                sessionStorage.setItem('backgroundToUse', JSON.stringify(assetAsLockedFace));
            } else if (asset.type === 'outfit') {
                sessionStorage.setItem('outfitToUse', JSON.stringify(assetAsLockedFace));
            }
            setIsLibraryOpen(false);
        };

        const filteredLibrary = library.filter(asset => {
            const assetType = asset.type || (asset.videoSrc ? 'video' : 'kol');
            switch (libraryFilter) {
                case 'kol_video': return assetType === 'kol' || assetType === 'video';
                case 'outfit': return assetType === 'outfit';
                case 'background': return assetType === 'background';
                case 'all':
                default:
                    return true;
            }
        });

        const handleSaveVariationsToLibrary = () => {
            if (!libraryVariationResults) return;
            const imagesToSave = libraryVariationResults.variations;
            setLibrary(prev => {
                const savedImageIds = new Set(imagesToSave.map(img => img.id));
                const uniquePrevious = prev.filter(p => !savedImageIds.has(p.id));
                return [...imagesToSave, ...uniquePrevious];
            });
            alert(`Đã lưu ${imagesToSave.length} biến thể vào thư viện.`);
            setLibraryVariationResults(null);
        };

        const renderVariationResultsView = () => (
            <>
                <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Kết quả Biến thể</h2>
                    <div className='flex items-center gap-2'>
                        <button onClick={handleSaveVariationsToLibrary} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">Lưu tất cả vào Thư viện</button>
                        <button onClick={() => setLibraryVariationResults(null)} className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Quay lại Thư viện</button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    <div>
                        <h4 className="text-md font-semibold text-indigo-400 mb-2">Ảnh Gốc</h4>
                        <img src={libraryVariationResults!.source.src} alt="Source for variation" className="rounded-lg w-48" />
                    </div>
                    <div>
                        <h4 className="text-md font-semibold text-indigo-400 mb-2">Các Biến Thể Mới</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {libraryVariationResults!.variations.map(image => (
                                <div key={image.id} className="relative group bg-gray-800 rounded-lg overflow-hidden">
                                    <img src={image.src} alt="Generated variation" className="aspect-square object-cover w-full h-full" />
                                    <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                         <button onClick={() => setLightboxImageSrc(image.src)} title="Xem lớn" className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md"><SearchIcon className="h-4 w-4" /></button>
                                         <button onClick={() => handleDownloadImage(image.src, `KOL_variation_${image.id}.png`)} title="Tải về" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"><DownloadIcon className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );

        const renderDefaultLibraryView = () => (
            <>
                <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                     <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-white mr-4">Thư viện Sáng tạo</h2>
                        <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-lg">
                            <button onClick={() => setLibraryFilter('all')} className={`px-3 py-1 text-sm rounded-md ${libraryFilter === 'all' ? 'bg-indigo-600' : ''}`}>Tất cả</button>
                            <button onClick={() => setLibraryFilter('kol_video')} className={`px-3 py-1 text-sm rounded-md ${libraryFilter === 'kol_video' ? 'bg-indigo-600' : ''}`}>KOL & Video</button>
                            <button onClick={() => setLibraryFilter('outfit')} className={`px-3 py-1 text-sm rounded-md ${libraryFilter === 'outfit' ? 'bg-indigo-600' : ''}`}>Trang phục</button>
                            <button onClick={() => setLibraryFilter('background')} className={`px-3 py-1 text-sm rounded-md ${libraryFilter === 'background' ? 'bg-indigo-600' : ''}`}>Bối cảnh</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label htmlFor="import-library" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 cursor-pointer">Nhập</label>
                        <input type="file" id="import-library" accept=".json" className="hidden" onChange={handleImportLibrary} />
                        <button onClick={handleExportLibrary} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">Xuất</button>
                        <button onClick={() => setIsLibraryOpen(false)} className="text-gray-400 hover:text-white"><XMarkIcon className="h-8 w-8" /></button>
                    </div>
                </div>
                <div className="flex-grow flex overflow-hidden">
                    <div className="w-1/3 xl:w-1/4 h-full overflow-y-auto p-4 bg-gray-800/50">
                        <div className={`grid gap-2 ${libraryFilter === 'outfit' || libraryFilter === 'background' ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-3'}`}>
                            {filteredLibrary.map(asset => (
                                <div key={asset.id} className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${selectedLibraryAsset?.id === asset.id ? 'border-indigo-500' : 'border-transparent'} ${asset.type === 'outfit' ? 'bg-white/10' : ''}`} onClick={(e) => { e.stopPropagation(); handleSelectAsset(asset); }}>
                                    <img src={asset.src} alt="Library asset" className={`aspect-square w-full h-full ${asset.type === 'outfit' ? 'object-contain p-1' : 'object-cover'}`} />
                                    {asset.videoSrc && <VideoCameraIcon className="absolute bottom-1 right-1 h-5 w-5 text-white bg-black/50 rounded" />}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-2/3 xl:w-3/4 h-full overflow-y-auto p-6 flex flex-col items-center justify-center">
                        {selectedLibraryAsset ? (
                            <div className="w-full max-w-2xl mx-auto">
                                <div className={`bg-gray-800 p-4 rounded-lg ${selectedLibraryAsset.type === 'outfit' ? 'bg-white/5' : ''}`}>
                                    {selectedLibraryAsset.videoSrc ? (
                                        <video controls src={selectedLibraryAsset.videoSrc} className="w-full rounded-md" />
                                    ) : (
                                        <img src={selectedLibraryAsset.src} alt="Selected asset" className={`w-full rounded-md ${selectedLibraryAsset.type === 'outfit' ? 'object-contain max-h-[40vh] p-2' : 'object-cover'}`} />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-800 rounded break-words">Prompt: {selectedLibraryAsset.prompt}</p>
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    {regeneratingId === selectedLibraryAsset.id ? (
                                        <div className="flex items-center justify-center bg-gray-700 text-white py-2 px-4 rounded-md">...Đang tạo lại...</div>
                                    ) : generatingVariationId === selectedLibraryAsset.id ? (
                                        <div className="flex items-center justify-center bg-gray-700 text-white py-2 px-4 rounded-md">...Đang tạo biến thể...</div>
                                    ) : (
                                        <>
                                            {(selectedLibraryAsset.type === 'background' || selectedLibraryAsset.type === 'outfit') && (
                                                <button onClick={() => handleUseAssetFromLibrary(selectedLibraryAsset)} className="text-sm bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md flex items-center gap-2">
                                                    {selectedLibraryAsset.type === 'background' ? 'Sử dụng Bối cảnh này' : 'Sử dụng Trang phục này'}
                                                </button>
                                            )}
                                            {!selectedLibraryAsset.videoSrc && <button onClick={() => setLightboxImageSrc(selectedLibraryAsset.src)} className="text-sm bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center gap-2"><SearchIcon className="h-4 w-4" /> Xem lớn</button>}
                                            {selectedLibraryAsset.type !== 'background' && selectedLibraryAsset.type !== 'outfit' && !selectedLibraryAsset.videoSrc && <button onClick={() => localHandleRegenerate(selectedLibraryAsset)} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center gap-2"><RefreshIcon className="h-4 w-4" /> Tạo lại</button>}
                                            {selectedLibraryAsset.type !== 'background' && selectedLibraryAsset.type !== 'outfit' && !selectedLibraryAsset.videoSrc && <button onClick={() => localHandleGenerateVariation(selectedLibraryAsset)} className="text-sm bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md flex items-center gap-2"><SparklesIcon className="h-4 w-4" /> Biến thể</button>}
                                            {selectedLibraryAsset.type !== 'background' && selectedLibraryAsset.type !== 'outfit' && !selectedLibraryAsset.videoSrc && <button onClick={() => setLibraryQuickEditModalState({ isOpen: true, image: selectedLibraryAsset, editColor: '', editOutfitText: '', editOutfitSelection: 'Không thay đổi', editPose: 'Không thay đổi', customEditPose: '', editAdditionalReqs: '', isEditing: false })} className="text-sm bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md flex items-center gap-2"><WandIcon className="h-4 w-4" /> Sửa nhanh</button>}
                                            <button onClick={() => handleDownloadImage(selectedLibraryAsset.videoSrc || selectedLibraryAsset.src, `KOL_asset_${selectedLibraryAsset.id}.${selectedLibraryAsset.videoSrc ? 'mp4' : 'png'}`)} className="text-sm bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md flex items-center gap-2"><DownloadIcon className="h-4 w-4" /> Tải về</button>
                                            <button onClick={() => handleDeleteFromLibrary(selectedLibraryAsset.id)} className="text-sm bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded-md flex items-center gap-2"><TrashIcon className="h-4 w-4" /> Xóa</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <BookOpenIcon className="h-24 w-24 mx-auto mb-4" />
                                <h3 className="text-xl">Chọn một mục để xem chi tiết</h3>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );

        return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setIsLibraryOpen(false)}>
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {libraryVariationResults ? renderVariationResultsView() : renderDefaultLibraryView()}
            </div>
        </div>
        )
    };
    
    const renderVeoModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
             <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-auto max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                     <h2 className="text-2xl font-bold text-white">Tạo Video từ Ảnh</h2>
                     <button onClick={handleCloseVeoModal} className="text-gray-400 hover:text-white"><XMarkIcon className="h-8 w-8" /></button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Ảnh gốc</h3>
                            <img src={veoModalState.image?.src} alt="Base for video" className="rounded-lg w-full" />
                        </div>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Tỷ lệ khung hình</label>
                                <select value={veoModalState.aspectRatio} onChange={e => setVeoModalState(p => ({...p, aspectRatio: e.target.value as any}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white">
                                    <option value="16:9">Ngang (16:9)</option>
                                    <option value="9:16">Dọc (9:16)</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Độ phân giải</label>
                                <select value={veoModalState.resolution} onChange={e => setVeoModalState(p => ({...p, resolution: e.target.value as any}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white">
                                    <option value="1080p">1080p (Chất lượng cao)</option>
                                    <option value="720p">720p (Nhanh hơn)</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Yêu cầu loại trừ (Negative Prompt)</label>
                                <textarea
                                    value={veoModalState.negativePrompt}
                                    onChange={(e) => setVeoModalState(prev => ({...prev, negativePrompt: e.target.value}))}
                                    rows={2}
                                    placeholder="VD: văn bản, logo, tay thừa..."
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
                                />
                            </div>
                            <div className="border-t border-gray-600 pt-4">
                                <label className="block text-sm font-medium text-gray-300 mb-1">1. Nhập ý tưởng (Tùy chọn)</label>
                                <textarea
                                    value={veoModalState.idea}
                                    onChange={(e) => setVeoModalState(prev => ({...prev, idea: e.target.value}))}
                                    rows={3}
                                    placeholder="VD: KOL đang suy tư nhìn ra cửa sổ..."
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
                                />
                            </div>
                             <button onClick={handleGenerateVeoPrompts} className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700">2. Tạo gợi ý Prompt</button>
                        </div>
                    </div>
                    {veoModalState.prompts.length > 0 && (
                        <div className="border-t border-gray-700 pt-4 space-y-4">
                           <h3 className="font-semibold text-lg">Gợi ý Prompt cho Video (Model: Veo)</h3>
                           {veoModalState.prompts.map((p, index) => (
                               <div key={index} className="bg-gray-800 p-3 rounded-lg">
                                   <p className="font-semibold text-indigo-400">{p.title}</p>
                                   <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap font-mono bg-gray-900 p-2 rounded">{p.prompt}</p>
                                   <button onClick={() => handleGenerateVeoVideo(p.prompt)} className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded" disabled={veoModalState.isGeneratingVideo}>
                                        {veoModalState.isGeneratingVideo && veoModalState.generatedVideoPrompt === p.prompt ? 'Đang tạo...' : 'Tạo Video này'}
                                   </button>
                               </div>
                           ))}
                        </div>
                    )}
                    {veoModalState.isGeneratingVideo && <div className="text-center p-4">Đang tạo video... Quá trình này có thể mất vài phút.</div>}
                    {veoModalState.error && <div className="text-center p-4 text-red-400">Lỗi: {veoModalState.error}</div>}
                    {veoModalState.generatedVideoSrc && (
                        <div className="border-t border-gray-700 pt-4 text-center">
                            <h3 className="font-semibold text-lg mb-2">Video đã tạo xong!</h3>
                            <video src={veoModalState.generatedVideoSrc} controls className="w-full max-w-md mx-auto rounded-lg"></video>
                             <div className="mt-4 flex justify-center gap-4">
                                <a href={veoModalState.generatedVideoSrc} download={`kol_video_${Date.now()}.mp4`} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">Tải về</a>
                                <button onClick={() => handleSaveVideoToLibrary(veoModalState.generatedVideoSrc!, veoModalState.generatedVideoPrompt!, veoModalState.image!.src)} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700">Lưu vào thư viện</button>
                            </div>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );

    const renderLightboxModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex items-center justify-center p-4" onClick={() => setLightboxImageSrc(null)}>
            <button onClick={() => setLightboxImageSrc(null)} className="absolute top-4 right-4 text-white hover:text-gray-300 z-[101]">
                <XMarkIcon className="h-10 w-10" />
            </button>
            <img 
                src={lightboxImageSrc!} 
                alt="Enlarged view" 
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
    
     const handleLibraryQuickEdit = async () => {
        const { image, editColor, editOutfitText, editOutfitSelection, editPose, customEditPose, editAdditionalReqs } = libraryQuickEditModalState;
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

        setLibraryQuickEditModalState(prev => ({ ...prev, isEditing: true }));
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
            
            setLibrary(prev => [newImage, ...prev.filter(i => i.id !== image.id)]);
            if (selectedLibraryAsset?.id === image.id) {
                setSelectedLibraryAsset(newImage);
            }
            setLibraryQuickEditModalState({ isOpen: false, image: null, editColor: '', editOutfitText: '', editOutfitSelection: 'Không thay đổi', editPose: 'Không thay đổi', customEditPose: '', editAdditionalReqs: '', isEditing: false });

        } catch (e) {
             const message = e instanceof Error ? e.message : "Lỗi không xác định.";
             alert(`Lỗi khi chỉnh sửa: ${message}`);
        } finally {
            setLibraryQuickEditModalState(prev => ({ ...prev, isEditing: false }));
        }
    };
    
    const renderLibraryQuickEditModal = () => {
        const { isOpen, image, isEditing, editColor, editOutfitSelection, editOutfitText, editPose, customEditPose, editAdditionalReqs } = libraryQuickEditModalState;
        if (!isOpen) return null;
        const currentPoseOptions = poseOptions[audienceType];
        const currentClothingOptions = contentOptions[audienceType].clothing;

        const hasColorEdit = editColor.trim() !== '';
        const hasOutfitEdit = editOutfitSelection !== 'Không thay đổi' || editOutfitText.trim() !== '';
        const hasPoseEdit = editPose !== 'Không thay đổi' || customEditPose.trim() !== '';
        const hasCustomReqEdit = editAdditionalReqs.trim() !== '';
        const isAnyEditActive = hasColorEdit || hasOutfitEdit || hasPoseEdit || hasCustomReqEdit;

        const resetAndClose = () => setLibraryQuickEditModalState({ 
            isOpen: false, image: null, editColor: '', editOutfitText: '', 
            editOutfitSelection: 'Không thay đổi', 
            editPose: 'Không thay đổi', customEditPose: '', 
            editAdditionalReqs: '', isEditing: false 
        });

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4">
                 <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                         <h2 className="text-2xl font-bold text-white">Sửa nhanh từ Thư viện</h2>
                         <button onClick={resetAndClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-8 w-8" /></button>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <img src={image?.src} alt="Image to edit" className="rounded-lg w-full max-w-sm mx-auto" />
                        
                        <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-300">1. Đổi màu trang phục</label>
                             <input 
                                type="text"
                                placeholder="VD: màu xanh navy, đỏ rượu vang..."
                                value={editColor}
                                onChange={(e) => setLibraryQuickEditModalState(p => ({...p, editColor: e.target.value}))}
                                disabled={isAnyEditActive && !hasColorEdit}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-700 disabled:cursor-not-allowed"
                             />
                        </div>

                        <div className="text-center text-gray-400 text-sm">hoặc</div>

                        <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-300">2. Thay đổi trang phục</label>
                             <select 
                                value={editOutfitSelection}
                                onChange={(e) => setLibraryQuickEditModalState(p => ({...p, editOutfitSelection: e.target.value}))}
                                disabled={isAnyEditActive && !hasOutfitEdit}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-700 disabled:cursor-not-allowed"
                            >
                                {["Không thay đổi", "Tự động (AI Quyết định)", "Tùy chỉnh...", ...currentClothingOptions].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            {editOutfitSelection === 'Tùy chỉnh...' && (
                                <input
                                    type="text"
                                    placeholder="Mô tả trang phục mới..."
                                    value={editOutfitText}
                                    onChange={(e) => setLibraryQuickEditModalState(p => ({...p, editOutfitText: e.target.value}))}
                                    disabled={isAnyEditActive && !hasOutfitEdit}
                                    className="mt-2 w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-700 disabled:cursor-not-allowed"
                                />
                            )}
                        </div>
                        
                        <div className="text-center text-gray-400 text-sm">hoặc</div>
                        <div className="space-y-2">
                            <CustomizableSelect 
                                label="3. Thay đổi tư thế"
                                selectedValue={editPose}
                                onSelectChange={(e) => setLibraryQuickEditModalState(p => ({...p, editPose: e.target.value}))}
                                customValue={customEditPose}
                                onCustomChange={(e) => setLibraryQuickEditModalState(p => ({...p, customEditPose: e.target.value}))}
                                options={currentPoseOptions}
                                disabled={isAnyEditActive && !hasPoseEdit}
                            />
                        </div>

                        <div className="text-center text-gray-400 text-sm">hoặc</div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">4. Yêu cầu tùy chỉnh khác</label>
                            <textarea 
                                placeholder="VD: thêm một chiếc kính râm, thay đổi biểu cảm thành mỉm cười..."
                                value={editAdditionalReqs}
                                onChange={(e) => setLibraryQuickEditModalState(p => ({...p, editAdditionalReqs: e.target.value}))}
                                disabled={isAnyEditActive && !hasCustomReqEdit}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-700 disabled:cursor-not-allowed"
                                rows={2}
                            />
                        </div>
                        
                        <button onClick={handleLibraryQuickEdit} disabled={isEditing} className="w-full bg-teal-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-500">
                            {isEditing ? 'Đang chỉnh sửa...' : 'Thực hiện'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderActiveTab = () => {
        const creativeTabs = ['creative', 'ads', 'outfit', 'pro', 'interpolation', 'multi-kol', 'pose', 'muse', 'background', 'travel', 'selfie', 'hair', 'transform'];
        if (creativeTabs.includes(activeTab)) {
            return (
                <CreativeTab
                    key={`creative-${resetKey}`}
                    activeTab={activeTab}
                    audienceType={audienceType}
                    kolName={kolName}
                    lockedFace={lockedFace}
                    skinTone={skinTone}
                    handleSaveToLibrary={handleSaveToLibrary}
                    handleOpenVeoModal={handleOpenVeoModal}
                    setLightboxImageSrc={setLightboxImageSrc}
                    setLibrary={setLibrary}
                    setLockedFace={setLockedFace}
                    setActiveTab={setActiveTab}
                    setIsLibraryOpen={setIsLibraryOpen}
                    setLibraryFilter={setLibraryFilter}
                />
            );
        }

        switch (activeTab) {
            case 'suggestion':
                return <SuggestionTab 
                            key={`suggestion-${resetKey}`} 
                            audienceType={audienceType} 
                            kolName={kolName} 
                            setActiveTab={setActiveTab}
                            lockedFace={lockedFace}
                            skinTone={skinTone}
                            handleSaveToLibrary={handleSaveToLibrary}
                            setLightboxImageSrc={setLightboxImageSrc}
                            handleOpenVeoModal={handleOpenVeoModal}
                        />;
            case 'captions':
                return <CaptionsTab key={`captions-${resetKey}`} kolName={kolName} setActiveTab={setActiveTab} />;
            case 'calendar':
                return <CalendarTab key={`calendar-${resetKey}`} audienceType={audienceType} kolName={kolName} lockedFace={lockedFace} handleSaveToLibrary={handleSaveToLibrary} setLightboxImageSrc={setLightboxImageSrc} handleOpenVeoModal={handleOpenVeoModal} skinTone={skinTone} />;
            case 'strategy':
                return <StrategyTab key={`strategy-${resetKey}`} audienceType={audienceType} kolName={kolName} lockedFace={lockedFace} handleSaveToLibrary={handleSaveToLibrary} setLightboxImageSrc={setLightboxImageSrc} handleOpenVeoModal={handleOpenVeoModal} skinTone={skinTone} />;
            case 'affiliate':
                return <AffiliateTab key={`affiliate-${resetKey}`} audienceType={audienceType} kolName={kolName} lockedFace={lockedFace} handleSaveToLibrary={handleSaveToLibrary} setLightboxImageSrc={setLightboxImageSrc} handleOpenVeoModal={handleOpenVeoModal} skinTone={skinTone} />;
            default:
                return null;
        }
    };

    return (
         <div className="min-h-screen bg-gray-900 text-gray-100">
            <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-40 shadow-lg">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        <span className="text-indigo-400">KOL</span> Builder
                    </h1>
                     <div className="flex items-center gap-4">
                        <button onClick={handleResetApp} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 flex items-center gap-2">
                            <RefreshIcon className="h-5 w-5" />
                            Bắt đầu lại
                        </button>
                        <button onClick={() => setIsLibraryOpen(true)} className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 flex items-center gap-2">
                            <BookOpenIcon className="h-5 w-5" />
                            Thư viện ({library.length})
                        </button>
                     </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Shared Controls */}
                    <CreativeTabControls
                        kolName={kolName}
                        setKolName={setKolName}
                        audienceType={audienceType}
                        handleAudienceChange={handleAudienceChange}
                        lockedFace={lockedFace}
                        setLockedFace={setLockedFace}
                        skinTone={skinTone}
                        handleSkinToneChange={handleSkinToneChange}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        handleGenerateKOLName={handleGenerateKOLName}
                        renderNavButton={renderNavButton}
                    />

                    {/* Right Panel: Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                       {renderActiveTab()}
                    </div>
                </div>

                {isLibraryOpen && renderLibraryModal()}
                {veoModalState.isOpen && renderVeoModal()}
                {lightboxImageSrc && renderLightboxModal()}
                {libraryQuickEditModalState.isOpen && renderLibraryQuickEditModal()}

            </main>
        </div>
    );
};

export default App;