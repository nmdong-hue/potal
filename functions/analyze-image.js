// functions/analyze-image.js
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

    try {
        const requestBody = await request.json();
        const imageData = requestBody.imageData; // 프론트엔드에서 JSON 본문을 받음

        if (!imageData) {
            return new Response(JSON.stringify({ error: '이미지 데이터가 제공되지 않았습니다.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const mimeTypeMatch = imageData.split(',')[0].split(':')[1].split(';')[0];
        const base64Data = imageData.split(',')[1];

        // Gemini 1.5 Pro 모델을 직접 호출
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: "이 병해충 사진을 분석하고 병해충 이름과 방제 방법을 한국어로 설명해줘. 응답은 다음 형식으로 부탁해:\n\n병해충 이름: [병해충 이름 또는 '건강한 식물']\n방제 방법: [방제 방법 또는 '필요 없음']\n\n만약 건강한 식물이라면, 병해충 이름에는 '건강한 식물'을, 방제 방법에는 '필요 없음'이라고만 적어줘."
                                },
                                {
                                    inline_data: {
                                        mime_type: mimeTypeMatch || "image/jpeg", // 동적으로 mime_type 설정, 없으면 jpeg 기본
                                        data: base64Data
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.2, // 좀 더 일관된 답변을 위해 낮춤
                    },
                })
            }
        );

        const geminiData = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error('Gemini API Error Response:', geminiData);
            return new Response(JSON.stringify({ 
                error: 'Gemini API 호출에 실패했습니다.', 
                details: geminiData.error?.message || '알 수 없는 Gemini API 오류' 
            }), {
                status: geminiResponse.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const fullResponseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        let pestName = "알 수 없음";
        let controlInfo = "정보 없음";

        // Gemini 1.5 Pro의 응답에서 '병해충 이름:'과 '방제 방법:'을 파싱
        const pestNameMatch = fullResponseText.match(/병해충 이름:\s*(.*)/i);
        if (pestNameMatch && pestNameMatch[1]) {
            pestName = pestNameMatch[1].trim();
        }

        const controlInfoMatch = fullResponseText.match(/방제 방법:\s*(.*)/i);
        if (controlInfoMatch && controlInfoMatch[1]) {
            controlInfo = controlInfoMatch[1].trim();
        }
        
        // "건강한 식물"의 경우 특별 처리
        if (pestName.toLowerCase() === "건강한 식물") {
            if (controlInfo.toLowerCase() === "필요 없음") {
                // 이미 적절히 설정됨
            } else {
                // 혹시 모를 경우를 대비
                controlInfo = "특별한 조치가 필요 없습니다.";
            }
        }


        return new Response(JSON.stringify({ pestName, controlInfo, fullResponse: fullResponseText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('이미지 분석 중 오류 발생:', error);
        return new Response(JSON.stringify({ error: '이미지 분석에 실패했습니다.', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
