// functions/analyze-image.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function onRequestPost(context) {
    const { request, env } = context;

    // Gemini API 키는 Cloudflare Pages/Functions 환경 변수로 설정됩니다.
    const GEMINI_API_KEY = env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    try {
        const { imageData } = await request.json(); // 프론트엔드에서 JSON 본문을 받음

        if (!imageData) {
            return new Response(JSON.stringify({ error: '이미지 데이터가 제공되지 않았습니다.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        const prompt = "This is an image of a plant. Please identify any pests or diseases present in the image and suggest control measures. Provide the pest/disease name and control measures separately. If healthy, state 'Healthy plant'.";
        const image = {
            inlineData: {
                data: imageData.split(',')[1],
                mimeType: imageData.split(',')[0].split(':')[1].split(';')[0]
            },
        };

        const result = await model.generateContent([prompt, image]);
        const response = await result.response;
        const text = response.text();

        let pestName = "알 수 없음";
        let controlInfo = "정보 없음";

        // 간단한 파싱 로직 (실제 응답 형식에 따라 더 정교하게 파싱해야 함)
        if (text.includes("Pest/Disease Name:")) {
            const nameMatch = text.match(/Pest\/Disease Name:\s*(.*)/i);
            if (nameMatch && nameMatch[1]) {
                pestName = nameMatch[1].trim();
            }
        } else if (text.includes("Healthy plant")) {
            pestName = "건강한 식물";
            controlInfo = "특별한 조치가 필요 없습니다.";
        }
        
        if (text.includes("Control Measures:")) {
            const controlMatch = text.match(/Control Measures:\s*(.*)/i);
            if (controlMatch && controlMatch[1]) {
                controlInfo = controlMatch[1].trim();
            }
        } else if (text.includes("Suggested Control:")) { // 다른 키워드도 고려
            const controlMatch = text.match(/Suggested Control:\s*(.*)/i);
            if (controlMatch && controlMatch[1]) {
                controlInfo = controlMatch[1].trim();
            }
        }

        return new Response(JSON.stringify({ pestName, controlInfo, fullResponse: text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Gemini API 호출 중 오류 발생:', error);
        return new Response(JSON.stringify({ error: '이미지 분석에 실패했습니다.', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
