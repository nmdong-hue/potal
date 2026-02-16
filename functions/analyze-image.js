// functions/analyze-image.js
export async function onRequestPost(context) {
    const { request, env } = context;

    // Gemini API 키는 Cloudflare Pages/Functions 환경 변수로 설정됩니다.
    const GEMINI_API_KEY = env.GEMINI_API_KEY;
    // Cloudflare D1 Database 바인딩은 'DB'라는 이름으로 설정되어야 합니다.
    const DB = env.DB;

    if (!GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!DB) {
        return new Response(JSON.stringify({ error: 'Cloudflare D1 "DB" 바인딩이 설정되지 않았습니다. wrangler.toml 파일을 확인해주세요.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const requestBody = await request.json();
        const imageData = requestBody.imageData; // 프론트엔드에서 JSON 본문을 받음
        const cropName = requestBody.cropName; // 추가된 작물 이름

        if (!imageData) {
            return new Response(JSON.stringify({ error: '이미지 데이터가 제공되지 않았습니다.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!cropName) {
            return new Response(JSON.stringify({ error: '작물 이름이 제공되지 않았습니다.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const mimeTypeMatch = imageData.split(',')[0].split(':')[1].split(';')[0];
        const base64Data = imageData.split(',')[1];

        // Gemini 1.5 Flash Latest 모델을 직접 호출
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1alpha/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
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
                                    text: `이 ${cropName} 병해충 사진을 분석하고 병해충 이름과 방제 방법을 한국어로 설명해줘. 응답은 다음 형식으로 부탁해:\n\n병해충 이름: [병해충 이름 또는 '건강한 식물']\n방제 방법: [방제 방법 또는 '필요 없음']\n\n만약 건강한 식물이라면, 병해충 이름에는 '건강한 식물'을, 방제 방법에는 '필요 없음'이라고만 적어줘.`
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

        // Gemini 1.5 Flash Latest의 응답에서 '병해충 이름:'과 '방제 방법:'을 파싱
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

        // --- 분석 기록 저장 ---
        // D1 데이터베이스에 레코드 삽입
        // 이 코드를 실행하기 전에 Cloudflare D1 데이터베이스 'pest_diagnosis_db'를 생성하고
        // Cloudflare Function에 'DB'라는 이름으로 바인딩해야 합니다.
        // 또한, 'analysis_records' 테이블을 미리 생성해야 합니다:
        // CREATE TABLE analysis_records (
        //   id INTEGER PRIMARY KEY AUTOINCREMENT,
        //   timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        //   crop_name TEXT NOT NULL,
        //   image_data_preview TEXT, -- 이미지 데이터의 작은 미리보기 또는 참조 URL
        //   pest_name TEXT,
        //   control_info TEXT,
        //   full_gemini_response TEXT
        // );
        try {
            // 이미지 데이터 전체를 저장하는 것은 비효율적이므로, 짧은 미리보기 또는 URL 참조를 사용합니다.
            // 여기서는 간단하게 Base64 데이터의 처음 100자만 저장합니다.
            const imageDataPreview = base64Data.substring(0, 100); 

            await DB.prepare(
                `INSERT INTO analysis_records (crop_name, image_data_preview, pest_name, control_info, full_gemini_response)
                 VALUES (?, ?, ?, ?, ?)`
            ).bind(cropName, imageDataPreview, pestName, controlInfo, fullResponseText)
            .run();
            console.log('분석 기록이 D1에 성공적으로 저장되었습니다.');
        } catch (dbError) {
            console.error('D1 데이터베이스 저장 중 오류 발생:', dbError);
            // 데이터베이스 저장 오류가 진단 결과 반환을 막지는 않음
        }
        // --- 분석 기록 저장 끝 ---


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
