// functions/api/diagnosis-records.js
export async function onRequestGet(context) {
    const { env } = context;
    const DB = env.DB;

    if (!DB) {
        return new Response(JSON.stringify({ error: 'Cloudflare D1 "DB" 바인딩이 설정되지 않았습니다.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // 최근 10개의 진단 기록을 가져옵니다. 필요에 따라 제한 수를 조절할 수 있습니다.
        const { results } = await DB.prepare(
            `SELECT id, timestamp, crop_name, pest_name, control_info 
             FROM analysis_records 
             ORDER BY timestamp DESC 
             LIMIT 10`
        ).all();

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('D1 데이터베이스에서 진단 기록을 가져오는 중 오류 발생:', error);
        return new Response(JSON.stringify({ error: '진단 기록을 불러오는 데 실패했습니다.', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
