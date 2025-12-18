
import { GoogleGenAI, GenerateContentResponse, Type, Modality, Operation, Schema } from "@google/genai";
import { LockedFace, LibraryAsset, CalendarRow, StrategyItem } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

// Models
const MODEL_TEXT_FAST = 'gemini-2.5-flash';
const MODEL_TEXT_PRO = 'gemini-3-pro-preview';
export const MODEL_IMAGE_FLASH = 'gemini-2.5-flash-image';
export const MODEL_IMAGE_PRO = 'gemini-3-pro-image-preview';
const MODEL_VIDEO = 'veo-3.1-fast-generate-preview';

const SAFETY_GUIDANCE_FOR_SENSITIVE_CONTENT = `
**QUY TẮC AN TOÀN NỘI DUNG NHẠY CẢM (ƯU TIÊN TUYỆT ĐỐI) - V2**
[... giữ nguyên nội dung quy tắc an toàn ...]
`;

// Helper to get fresh AI instance (important for dynamic API keys)
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const ensurePaidApiKey = async () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.aistudio) {
         // @ts-ignore
        if (window.aistudio.hasSelectedApiKey && !(await window.aistudio.hasSelectedApiKey())) {
             // @ts-ignore
            await window.aistudio.openSelectKey();
            // Wait a bit for the key to propagate
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

const withRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 2, initialDelay = 2000): Promise<T> => {
    let retries = 0;
    let delay = initialDelay;
    while (true) {
        try {
            return await apiCall();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '';
            if ((errorMessage.includes('503') || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) && retries < maxRetries) {
                console.warn(`Retrying... (${retries + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retries++;
                delay *= 2;
            } else {
                throw error;
            }
        }
    }
};

// --- TEXT GENERATION SERVICES ---

export const generateSuggestion = async (prompt: string): Promise<string> => {
    const ai = getAI();
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_FAST, // Keep fast model for simple suggestions
        contents: prompt,
    }));
    return response.text?.trim() || "";
};

export const generateKOLName = async (audienceType: string): Promise<string> => {
    const ai = getAI();
    const prompt = `Tạo một tên KOL ${audienceType === 'female' ? 'nữ' : audienceType === 'male' ? 'nam' : 'nhí'} độc đáo, dễ nhớ, phù hợp với thị trường Việt Nam. Chỉ trả về 1 cái tên duy nhất.`;
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_FAST,
        contents: prompt,
    }));
    return response.text?.trim() || "KOL";
};

export const getLandmarksForLocation = async (location: string): Promise<string[]> => {
    const ai = getAI();
    const prompt = `Liệt kê 5 địa danh nổi tiếng nhất để chụp ảnh check-in tại ${location}. Trả về dưới dạng danh sách JSON array string (["Địa điểm 1", "Địa điểm 2",...]).`;
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_FAST,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    }));
    try {
        return JSON.parse(response.text || "[]");
    } catch {
        return [];
    }
};

export const generateRichPrompt = async (basePrompt: string): Promise<string> => {
    const ai = getAI();
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_FAST, // Keep fast for quick iteration
        contents: `Hãy đóng vai một nhiếp ảnh gia chuyên nghiệp. Viết lại prompt sau chi tiết hơn, mô tả ánh sáng, góc máy, mood ảnh để tạo ra bức ảnh đẹp nhất: "${basePrompt}"`,
    }));
    return response.text?.trim() || basePrompt;
};

// UPGRADED TO PRO 3.0
export const generateCaptions = async (image: LockedFace | null, topic: string, length: string, kolName: string, tone: string | null, cta: string): Promise<any> => {
    const ai = getAI();
    let prompt = `Bạn là một chuyên gia Social Media. Hãy viết nội dung cho KOL ${kolName || 'này'}.
    - Chủ đề: ${topic}
    - Độ dài: ${length === 'short' ? 'Ngắn gọn, súc tích' : length === 'medium' ? 'Vừa phải, đủ ý' : 'Dài, sâu sắc, kể chuyện'}
    - Giọng văn: ${tone || 'Tự nhiên, thu hút'}
    - CTA: ${cta || 'Không có'}
    
    Yêu cầu output JSON:
    {
        "captions": [
            { "vietnamese": "Caption tiếng Việt 1", "english": "English caption 1" },
            { "vietnamese": "Caption tiếng Việt 2", "english": "English caption 2" },
            { "vietnamese": "Caption tiếng Việt 3", "english": "English caption 3" }
        ],
        "hashtagBank": ["#tag1", "#tag2", ...],
        "imagePromptSuggestion": "Gợi ý prompt để tạo ảnh phù hợp với caption này (chi tiết, nghệ thuật)"
    }`;

    const parts: any[] = [{ text: prompt }];
    if (image) {
        parts.push({ inlineData: { data: image.base64, mimeType: image.mimeType } });
    }

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_PRO, // Upgraded
        contents: { parts },
        config: { responseMimeType: 'application/json' }
    }));
    return JSON.parse(response.text || "{}");
};

export const generateContentCalendar = async (prompt: string): Promise<CalendarRow[]> => {
    const ai = getAI();
    const systemInstruction = `Bạn là chuyên gia lập kế hoạch nội dung. Tạo lịch 4 tuần (28 ngày) dưới dạng JSON.`;
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_PRO, // Upgraded
        contents: prompt + `\nOutput JSON format: [{ "day": "Tuần 1 - Thứ 2", "contentType": "Reels/Photo", "description": "Mô tả nội dung", "imagePromptSuggestion": "Prompt tạo ảnh chi tiết", "captionTheme": "Chủ đề caption" }, ...]`,
        config: { responseMimeType: 'application/json', systemInstruction }
    }));
    return JSON.parse(response.text || "[]");
};

export const generatePostForCalendarRow = async (row: any, audienceType: string, kolName: string, length: string = 'long', settings?: any): Promise<{title: string, caption: string}> => {
    const ai = getAI();
    const prompt = `Viết bài đăng mạng xã hội cho KOL ${kolName} (${audienceType}).
    - Chủ đề: ${row.description || row.task}
    - Định dạng: ${row.contentType || 'Bài viết'}
    - Tone: ${settings?.tone || 'Tự nhiên'}
    - Style: ${settings?.style || 'Đời thường'}
    
    Output JSON: { "title": "Tiêu đề bắt mắt", "caption": "Nội dung bài viết đầy đủ (có icon, tách đoạn)" }`;
    
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_PRO, // Upgraded
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    }));
    return JSON.parse(response.text || "{}");
};

// Strategy Functions (Upgraded to Pro)
export const generateChannelStrategy = async (goal: string, platform: string, niche: string, kolName: string): Promise<StrategyItem[]> => {
    const ai = getAI();
    const prompt = `Lập chiến lược xây kênh ${platform} cho KOL ${kolName} trong lĩnh vực ${niche} để đạt mục tiêu ${goal}.
    Output JSON list of steps: [{ "stage": "Giai đoạn 1: Xây nền", "task": "Tên đầu việc", "description": "Mô tả chi tiết cách làm", "imagePromptSuggestion": "Gợi ý ảnh minh họa" }, ...]`;
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_PRO,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    }));
    return JSON.parse(response.text || "[]");
};

export const generateFunnelDesign = async (product: string, audience: string, goal: string, kolName: string): Promise<StrategyItem[]> => {
    const ai = getAI();
    const prompt = `Thiết kế phễu marketing cho sản phẩm ${product} nhắm tới ${audience} của KOL ${kolName}. Mục tiêu: ${goal}.
    Output JSON list steps.`;
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_PRO,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    }));
    return JSON.parse(response.text || "[]");
};

export const generateOfferStack = async (product: string, price: string, problem: string, kolName: string): Promise<StrategyItem[]> => {
    const ai = getAI();
    const prompt = `Xây dựng Offer Stack (Combo ưu đãi) cho sản phẩm ${product} (Giá: ${price}) giải quyết vấn đề ${problem} của KOL ${kolName}.
    Output JSON list items.`;
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_PRO,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    }));
    return JSON.parse(response.text || "[]");
};

export const generateLandingPageCopy = async (product: string, audience: string, cta: string, kolName: string): Promise<StrategyItem[]> => {
    const ai = getAI();
    const prompt = `Viết nội dung (Copywriting) cho Landing Page bán ${product} cho ${audience}, CTA: ${cta}.
    Output JSON list sections (Headline, Problem, Solution, Benefits, Social Proof, CTA).`;
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_PRO,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    }));
    return JSON.parse(response.text || "[]");
};

export const generateAffiliateCampaignStrategy = async (name: string, desc: string, link: string, target: string, usp: string, offer: string, goal: string, kolName: string): Promise<StrategyItem[]> => {
    const ai = getAI();
    const prompt = `Lập chiến dịch Affiliate Marketing cho KOL ${kolName}.
    - Sản phẩm: ${name}
    - Mô tả: ${desc}
    - USP: ${usp}
    - Target: ${target}
    - Offer: ${offer}
    - Goal: ${goal}
    Output JSON list of content plan items.`;
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_PRO,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    }));
    return JSON.parse(response.text || "[]");
};

export const generatePostFromTopic = async (topic: string, audienceType: string, kolName: string, options: any): Promise<{title: string, content: string}> => {
    const ai = getAI();
    const prompt = `Viết một bài đăng ngắn (khoảng 150 từ) cho KOL ${kolName} (${audienceType}) về chủ đề: "${topic}".
    Bối cảnh: ${options.context || 'Tự do'}. Tâm trạng: Tích cực.
    Output JSON: { "title": "Tiêu đề", "content": "Nội dung" }`;
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_PRO,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    }));
    return JSON.parse(response.text || "{}");
};

export const generateImagePromptFromTopic = async (topic: string, audienceType: string, options: any): Promise<string> => {
    const ai = getAI();
    const prompt = `Tạo một prompt tạo ảnh chi tiết (tiếng Anh và tiếng Việt) cho chủ đề: "${topic}" của KOL ${audienceType}.
    Bối cảnh: ${options.context || 'Tự do'}. Trang phục: ${options.clothing || 'Phù hợp'}.
    Trả về chỉ nội dung prompt text.`;
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_PRO,
        contents: prompt,
    }));
    return response.text?.trim() || "";
};

// --- IMAGE GENERATION & EDITING SERVICES ---

export const generateContent = async (
    options: any, 
    images: LockedFace[], 
    count: number = 1, 
    aspectRatio: string = "1:1", 
    signal?: AbortSignal,
    modelName: string = MODEL_IMAGE_FLASH // Default to Flash for speed and multiple images
): Promise<string[]> => {
    
    // Only enforce paid key check if using Pro model
    if (modelName === MODEL_IMAGE_PRO) {
        await ensurePaidApiKey();
    }
    
    const ai = getAI();

    let finalPrompt = typeof options === 'string' ? options : buildPromptFromOptions(options);
    
    // Add safety guidance
    finalPrompt = SAFETY_GUIDANCE_FOR_SENSITIVE_CONTENT + "\n\n" + finalPrompt;

    const parts: any[] = [{ text: finalPrompt }];
    images.forEach(img => {
        parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } });
    });

    // Gemini 3.0 Pro Image preview currently has constraints, often defaulting to 1 image.
    // If Pro model is selected, we might want to limit count to 1 or let the API decide.
    // For this implementation, we pass the count, but UI handles restricting it if needed.
    const effectiveCount = modelName === MODEL_IMAGE_PRO ? 1 : count;

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
            imageConfig: {
                count: effectiveCount,
                aspectRatio: mapAspectRatio(aspectRatio)
            }
        }
    }, { signal }));

    if (!response.candidates?.[0]?.content?.parts) {
        throw new Error("Không nhận được phản hồi hình ảnh từ AI.");
    }

    const generatedImages: string[] = [];
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
            generatedImages.push(`data:image/png;base64,${part.inlineData.data}`);
        }
    }

    if (generatedImages.length === 0) {
        throw new Error("AI không trả về hình ảnh nào. Có thể do vi phạm chính sách nội dung.");
    }

    return generatedImages;
};

export const editImage = async (instruction: string, image: LockedFace): Promise<string> => {
    // Editing uses Pro for better instruction following
    await ensurePaidApiKey();
    const ai = getAI();
    const prompt = SAFETY_GUIDANCE_FOR_SENSITIVE_CONTENT + `\n\n${instruction}`;
    
    const parts = [
        { text: prompt },
        { inlineData: { data: image.base64, mimeType: image.mimeType } }
    ];

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_IMAGE_PRO, 
        contents: { parts },
        config: { imageConfig: { count: 1 } }
    }));

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part || !part.inlineData?.data) {
        throw new Error("Không thể chỉnh sửa ảnh.");
    }
    return `data:image/png;base64,${part.inlineData.data}`;
};

export const generateCreativeVariationPrompts = async (originalPrompt: string, image: LockedFace): Promise<string[]> => {
    const ai = getAI();
    const prompt = `Phân tích hình ảnh và prompt gốc: "${originalPrompt}".
    Hãy tạo ra 4 ý tưởng biến thể sáng tạo khác nhau cho hình ảnh này (Thay đổi về ánh sáng, góc chụp, hoặc bối cảnh tinh tế, nhưng giữ nguyên nhân vật).
    Trả về dưới dạng JSON array of strings.`;
    
    const parts = [
        { text: prompt },
        { inlineData: { data: image.base64, mimeType: image.mimeType } }
    ];

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_PRO, // Upgraded for better analysis
        contents: { parts },
        config: { responseMimeType: 'application/json' }
    }));
    
    try {
        return JSON.parse(response.text || "[]");
    } catch {
        return ["Biến thể ánh sáng", "Biến thể góc chụp", "Biến thể màu sắc", "Biến thể bối cảnh"];
    }
};

export const extractOutfitFromImage = async (image: LockedFace): Promise<LockedFace> => {
    await ensurePaidApiKey();
    const ai = getAI();
    const prompt = `Tách riêng bộ trang phục trong ảnh này và đặt trên nền trắng. Giữ nguyên chi tiết, chất liệu và màu sắc. Loại bỏ người mẫu và bối cảnh.`;
    const parts = [{ text: prompt }, { inlineData: { data: image.base64, mimeType: image.mimeType } }];
    
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_IMAGE_PRO,
        contents: { parts },
        config: { imageConfig: { count: 1 } }
    }));

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part || !part.inlineData?.data) throw new Error("Lỗi tách trang phục");
    
    return { base64: part.inlineData.data, mimeType: 'image/png' };
};

export const extractBackgroundFromImage = async (image: LockedFace): Promise<string> => {
    await ensurePaidApiKey();
    const ai = getAI();
    const prompt = `Loại bỏ nhân vật khỏi bức ảnh này. Giữ nguyên bối cảnh và lấp đầy khoảng trống một cách tự nhiên (inpainting/background removal).`;
    const parts = [{ text: prompt }, { inlineData: { data: image.base64, mimeType: image.mimeType } }];
    
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_IMAGE_PRO,
        contents: { parts },
        config: { imageConfig: { count: 1 } }
    }));

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part || !part.inlineData?.data) throw new Error("Lỗi tách nền");
    return `data:image/png;base64,${part.inlineData.data}`;
};

export const generatePromptFromImage = async (image: LockedFace, copyHairColor: boolean, copyHairStyle: boolean, removeTattoo: boolean): Promise<string> => {
    const ai = getAI();
    let prompt = `Mô tả chi tiết bức ảnh này để dùng làm prompt tạo ảnh (image generation prompt). Tập trung vào ánh sáng, phong cách nhiếp ảnh, tư thế, và trang phục.`;
    if (copyHairColor) prompt += ` Ghi chú rõ màu tóc.`;
    if (copyHairStyle) prompt += ` Ghi chú rõ kiểu tóc.`;
    if (removeTattoo) prompt += ` Lưu ý: Nếu nhân vật có hình xăm, hãy bỏ qua chi tiết đó trong mô tả.`;

    const parts = [{ text: prompt }, { inlineData: { data: image.base64, mimeType: image.mimeType } }];
    
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_TEXT_PRO, // Multimodal analysis
        contents: { parts },
    }));
    return response.text?.trim() || "";
};

// --- VIDEO GENERATION (VEO) ---

export const generateVideo = async (prompt: string, image: LockedFace, config: { aspectRatio: '16:9' | '9:16', resolution: '720p' | '1080p', negativePrompt?: string }): Promise<string> => {
    // Veo check is usually done in UI, but good to have here too
    await ensurePaidApiKey();
    const ai = getAI();

    // Note: Veo model name in SDK might differ slightly, using what was provided or standard live API
    // Using `generateVideos` method from new SDK if available, else standard generateContent with video model?
    // The provided instruction says: use `ai.models.generateVideos`
    
    let operation = await ai.models.generateVideos({
        model: MODEL_VIDEO,
        prompt: prompt,
        image: {
            imageBytes: image.base64,
            mimeType: image.mimeType
        },
        config: {
            numberOfVideos: 1,
            aspectRatio: config.aspectRatio,
            resolution: config.resolution,
        }
    });

    // Polling
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Không tạo được video.");
    
    // Fetch the video content
    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

// --- HELPER FUNCTIONS ---

const mapAspectRatio = (aspectRatioString?: string): "1:1" | "9:16" | "16:9" | "4:3" | "3:4" | undefined => {
    if (!aspectRatioString) return "1:1";
    const match = aspectRatioString.match(/\(([^)]+)\)/);
    const ratio = match ? match[1] : aspectRatioString;
    const validRatios = ["1:1", "9:16", "16:9", "4:3", "3:4"];
    return validRatios.includes(ratio) ? ratio as any : "1:1";
};

// Reconstruct prompt builder helper
const buildPromptFromOptions = (options: any): string => {
    const {
        prompt, audienceType, skinTone, bodyType, context, style, clothing, pose, cameraAngle, isCreatingKOL, additionalRequirements
    } = options;

    if (isCreatingKOL) return prompt;

    const parts = [];
    parts.push(`**Creative Brief:** ${prompt || 'Chân dung nghệ thuật'}`);
    
    let subjectDesc = 'Một người mẫu Việt Nam';
    if (audienceType === 'girl' || audienceType === 'boy') subjectDesc += ' là trẻ em';
    if (skinTone) subjectDesc += `, tông da ${skinTone}`;
    parts.push(`**Chủ thể:** ${subjectDesc}.`);
    
    if (options.isCreatingKOL === false) { // Assuming locked face implies this context
         parts.push("**YÊU CẦU BẮT BUỘC (GƯƠNG MẶT):** Giữ nguyên 100% đặc điểm gương mặt từ ảnh tham khảo đầu tiên.");
    }

    if (bodyType) parts.push(`**Vóc dáng:** ${bodyType}.`);
    if (context) parts.push(`**Bối cảnh:** ${context}.`);
    if (clothing) parts.push(`**Trang phục:** ${clothing}.`);
    if (style) parts.push(`**Phong cách:** ${style}.`);
    if (pose) parts.push(`**Tư thế:** ${pose}.`);
    if (cameraAngle) parts.push(`**Góc máy:** ${cameraAngle}.`);
    if (additionalRequirements) parts.push(`**Yêu cầu thêm:** ${additionalRequirements}.`);

    return parts.join('\n');
};
