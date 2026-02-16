// functions/api/delete-record.js
export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const DB = env.DB;

    if (!DB) {
        return new Response(JSON.stringify({ error: 'Cloudflare D1 "DB" 바인딩이 설정되지 않았습니다.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const recordId = params.id; // Assuming the ID is passed as a path parameter, e.g., /api/diagnosis-records/123

    if (!recordId) {
        return new Response(JSON.stringify({ error: '삭제할 기록 ID가 제공되지 않았습니다.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { success } = await DB.prepare(`DELETE FROM analysis_records WHERE id = ?`).bind(recordId).run();

        if (success) {
            return new Response(JSON.stringify({ message: `기록 (ID: ${recordId})이 성공적으로 삭제되었습니다.` }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ error: `기록 (ID: ${recordId})을 찾을 수 없거나 삭제에 실패했습니다.` }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error(`D1 데이터베이스에서 기록 (ID: ${recordId}) 삭제 중 오류 발생:`, error);
        return new Response(JSON.stringify({ error: '기록 삭제에 실패했습니다.', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
