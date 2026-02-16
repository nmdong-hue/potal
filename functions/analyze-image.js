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
        return new Response(JSON.stringify({ error: 'Cloudflare D1 "DB" 바인딩이 설정되지 않았습니다.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const requestBody = await request.json();
        const imageData = requestBody.imageData; // 프론트엔드에서 JSON 본문을 받음
        const cropName = requestBody.cropName; // 추가된 작물 이름
        const mimeTypeFromFrontend = requestBody.mimeType; // 프론트엔드에서 받은 MIME 타입

        if (!imageData) {
            return new Response(JSON.stringify({ error: '이미지 데이터가 제공되지 않았습니다.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!cropName) {
            return new Response(JSON.stringify({ error: '작물 이름이 제공되지 않습니다.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 프론트엔드에서 이미 base64로 변환된 resizedImageBase64가 imageData로 넘어옴
        // mimeTypeFromFrontend를 사용하거나, imageData에서 다시 추출 (resizeImage가 jpeg로 변환하므로)
        const mimeTypeToStore = mimeTypeFromFrontend || 'image/jpeg';
        const base64DataStripped = imageData.split(',')[1]; // 'data:image/jpeg;base64,' 부분 제거

        // Gemini 2.5 Flash Image 모델을 직접 호출
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
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
                                    text: `다음은 ${cropName}의 병해충 이미지입니다. 이 이미지를 분석하여 다음 JSON 형식으로 자세한 진단 정보를 제공해주세요.
                                    - "pestName": 진단된 병해충 이름 (또는 '건강한 식물')
                                    - "confidence": 진단 신뢰도 (예: "85%", "높은", "낮은")
                                    - "recommendations": 권장 조치 및 방제 방법
                                    - "notes": 추가 참고사항

                                    예시 응답:
                                    {
                                      "pestName": "고온장해 또는 화상병",
                                      "confidence": "85% (높음)",
                                      "recommendations": "병든 고추를 즉시 수거하고, 발생한 부위를 제거한 후, 예방적인 약제를 사용하여 잎과 줄기를 치료하십시오. 또한, 관수량 조절과 통풍이 잘 되도록 하여 생육 환경을 개선해야 합니다.",
                                      "notes": "고온이나 습도 변화로 인한 고온장해가 의심됩니다. 건강한 식물로 유지하기 위해 주의 깊은 관리가 필요합니다."
                                    }

                                    만약 건강한 식물이라면 "pestName"에 '건강한 식물'을, "confidence"에 '100% (매우 높음)', "recommendations"에 '필요 없음', "notes"에 '특이사항 없음'이라고만 적어주세요.
                                    응답은 반드시 JSON 객체만 포함해야 하며, 마크다운(\`\`\`json)으로 래핑하지 마세요.
                                    `
                                },
                                {
                                    inline_data: {
                                        mime_type: mimeTypeToStore || "image/jpeg", // 동적으로 mime_type 설정
                                        data: base64DataStripped
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

        let fullResponseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('Raw Gemini fullResponseText:', fullResponseText); // Raw response for debugging
        
        // Gemini의 응답이 마크다운 코드 블록으로 래핑되어 있을 경우, JSON만 추출 (더 견고하게)
        let jsonPayload = fullResponseText;
        const jsonStart = fullResponseText.indexOf('```json');
        const jsonEnd = fullResponseText.lastIndexOf('```');

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            jsonPayload = fullResponseText.substring(jsonStart + '```json'.length, jsonEnd).trim();
        }
        console.log('Extracted JSON payload:', jsonPayload); // Log extracted JSON

        let pestName = "정보 없음";
        let confidence = "정보 없음";
        let recommendations = "정보 없음";
        let notes = "정보 없음";
        let controlInfo = "정보 없음"; // 기존 controlInfo는 general recommendations로 사용

        // Gemini의 응답이 JSON 형식이라고 가정하고 파싱
        try {
            const parsedResult = JSON.parse(jsonPayload); // Extracted payload 사용
            pestName = parsedResult.pestName || pestName;
            confidence = parsedResult.confidence || confidence;
            recommendations = parsedResult.recommendations || recommendations;
            notes = parsedResult.notes || notes;
            controlInfo = recommendations; 
        } catch (jsonError) {
            console.error('Gemini 응답 JSON 파싱 오류:', jsonError);
            console.error('파싱 실패 원본 응답:', fullResponseText); // 원본 응답 로깅
            console.error('파싱 실패 시도된 JSON 페이로드:', jsonPayload); // 시도된 페이로드 로깅
            // JSON 파싱 실패 시, 원시 텍스트에서 기본 파싱 시도 (이전 로직)
            const pestNameMatch = fullResponseText.match(/병해충 이름:\s*(.*)/i);
            if (pestNameMatch && pestNameMatch[1]) {
                pestName = pestNameMatch[1].trim();
            }
            const controlInfoMatch = fullResponseText.match(/방제 방법:\s*(.*)/i);
            if (controlInfoMatch && controlInfoMatch[1]) {
                controlInfo = controlInfoMatch[1].trim();
            }
            // 상세 정보는 "정보 없음"으로 남겨둠
        }
        
        // "건강한 식물"의 경우 특별 처리 (JSON 파싱 후에도 적용)
        if (pestName.includes("건강한 식물")) {
            confidence = confidence.includes("필요 없음") || confidence.includes("정보 없음") ? "100% (매우 높음)" : confidence;
            recommendations = recommendations.includes("필요 없음") || recommendations.includes("정보 없음") ? "특별한 조치가 필요 없습니다." : recommendations;
            notes = notes.includes("특이사항 없음") || notes.includes("정보 없음") ? "특이사항 없음" : notes;
            controlInfo = recommendations; // 기존 controlInfo도 업데이트
        }

                                // --- 분석 기록 저장 ---

                                try {

                                    // resizedImageBase64에서 'data:image/jpeg;base64,' 부분을 제외한 순수 base64 데이터만 저장

                                    const imageDataPreview = base64DataStripped; 

                    

                                    await DB.prepare(

                                        `INSERT INTO analysis_records (crop_name, image_data_preview, mime_type, pest_name, confidence, recommendations, notes, control_info, full_gemini_response)

                                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

                                    ).bind(cropName, imageDataPreview, mimeTypeToStore, pestName, confidence, recommendations, notes, controlInfo, fullResponseText)

                                    .run();            console.log('분석 기록이 D1에 성공적으로 저장되었습니다.');
        } catch (dbError) {
            console.error('D1 데이터베이스 저장 중 오류 발생:', dbError);
            // 데이터베이스 저장 오류가 진단 결과 반환을 막지는 않음
        }
        // --- 분석 기록 저장 끝 ---


        return new Response(JSON.stringify({ pestName, confidence, recommendations, notes, controlInfo, fullResponse: fullResponseText }), {
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
