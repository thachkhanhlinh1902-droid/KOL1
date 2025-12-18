

import React, { useState, FC } from 'react';
import { generateCaptions } from '../services/geminiService';
import { LockedFace } from '../types';
import { XMarkIcon } from './icons';
import { captionToneOptions } from '../data/contentOptions';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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


interface CaptionsTabProps {
    kolName: string;
    setActiveTab: (tab: string) => void;
}

const CaptionsTab: FC<CaptionsTabProps> = ({ kolName, setActiveTab }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [captionImage, setCaptionImage] = useState<LockedFace | null>(null);
    const [captionTopic, setCaptionTopic] = useState('');
    const [captionLength, setCaptionLength] = useState<'short' | 'medium' | 'long'>('medium');
    const [captionTone, setCaptionTone] = useState('Tự động (AI Quyết định)');
    const [customCaptionTone, setCustomCaptionTone] = useState('');
    const [captionCTA, setCaptionCTA] = useState('');
    const [generatedCaptionsData, setGeneratedCaptionsData] = useState<any>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, imageSetter: (image: LockedFace | null) => void) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = (await fileToBase64(file)).split(',')[1];
            imageSetter({ base64, mimeType: file.type });
        }
    };
    
    const handleGenerateCaptions = async () => {
        if (!captionImage && !captionTopic) {
            setError("Vui lòng tải ảnh lên hoặc nhập chủ đề để tạo caption.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedCaptionsData(null);
        try {
            const getEffectiveValue = (selectedValue: string, customValue: string) => {
                if (selectedValue === 'Tùy chỉnh...') return customValue.trim();
                if (selectedValue === 'Tự động (AI Quyết định)') return null;
                return selectedValue;
            };
            const effectiveTone = getEffectiveValue(captionTone, customCaptionTone);
            const result = await generateCaptions(captionImage, captionTopic, captionLength, kolName, effectiveTone, captionCTA.trim());
            setGeneratedCaptionsData(result);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Lỗi không xác định.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImageFromCaption = () => {
        if (generatedCaptionsData?.imagePromptSuggestion) {
            sessionStorage.setItem('suggestionPrompt', generatedCaptionsData.imagePromptSuggestion);
            setActiveTab('creative');
            window.scrollTo(0, 0);
        } else {
            alert("Không có gợi ý prompt ảnh cho caption này.");
        }
    };
    
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
                ) : ( <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
                <div className="flex text-sm text-gray-500 justify-center">
                    <label htmlFor={id} className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 px-2"><span>{text}</span><input id={id} name={id} type="file" className="sr-only" onChange={onFileChange} accept="image/png, image/jpeg, image/webp" /></label>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-white">Tạo Caption Hàng loạt</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tải ảnh (Tùy chọn)</label>
                <p className="text-xs text-gray-400 mb-2">Tải ảnh lên để AI tạo caption phù hợp với hình ảnh.</p>
                {renderImageUploader(
                    (e) => handleFileChange(e, setCaptionImage),
                    captionImage,
                    "Tải ảnh lên",
                    "caption-file-upload",
                    () => setCaptionImage(null)
                )}
            </div>

            <div className='space-y-4 pt-4 border-t border-gray-700'>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Chủ đề / Mục đích</label>
                    <input type="text" value={captionTopic} onChange={e => setCaptionTopic(e.target.value)} placeholder="VD: Caption truyền cảm hứng buổi sáng..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Độ dài Caption</label>
                        <select value={captionLength} onChange={e => setCaptionLength(e.target.value as any)} className="w-full bg-gray-700 border border-gray-600 p-2 rounded-md">
                            <option value="short">Ngắn</option>
                            <option value="medium">Vừa</option>
                            <option value="long">Dài</option>
                        </select>
                    </div>
                    <CustomizableSelect
                        label="Giọng văn (Tone of Voice)"
                        selectedValue={captionTone}
                        onSelectChange={e => setCaptionTone(e.target.value)}
                        customValue={customCaptionTone}
                        onCustomChange={e => setCustomCaptionTone(e.target.value)}
                        options={captionToneOptions}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Kêu gọi hành động (CTA - Tùy chọn)</label>
                    <input
                        type="text"
                        value={captionCTA}
                        onChange={e => setCaptionCTA(e.target.value)}
                        placeholder="VD: Hãy bình luận ý kiến của bạn nhé!"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                    />
                </div>
            </div>
            
            <button onClick={handleGenerateCaptions} disabled={isLoading || (!captionImage && !captionTopic)} className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500">Tạo Captions & Hashtags</button>
            {error && <div className="text-red-400">{error}</div>}
            {generatedCaptionsData && (
                <div className="space-y-4 pt-4 border-t border-gray-700 max-h-96 overflow-y-auto">
                    {!captionImage && generatedCaptionsData.imagePromptSuggestion && (
                        <div className='space-y-2'>
                            <h3 className='font-bold'>Gợi ý ảnh:</h3>
                            <p className="text-xs text-indigo-300 bg-gray-900 p-2 rounded">{generatedCaptionsData.imagePromptSuggestion}</p>
                            <button onClick={handleGenerateImageFromCaption} className="w-full text-sm bg-purple-600 hover:bg-purple-700 text-white py-2 px-2 rounded disabled:bg-gray-500">Tạo ảnh từ Caption này</button>
                        </div>
                    )}
                    <h3 className="font-bold">Hashtag gợi ý:</h3>
                    <p className="text-sm text-indigo-300">{generatedCaptionsData.hashtagBank?.join(' ')}</p>
                    <h3 className="font-bold mt-4">Captions:</h3>
                    {generatedCaptionsData.captions?.map((cap: any, index: number) => (
                        <div key={index} className="bg-gray-700 p-3 rounded-md">
                            <p><strong className="text-green-400">VI:</strong> {cap.vietnamese}</p>
                            <p className="mt-1"><strong className="text-blue-400">EN:</strong> {cap.english}</p>
                        </div>
                    ))}
                </div>
            )}
         </div>
    );
};

export default CaptionsTab;