/**
 * R2 이미지 프록시 Worker
 * - PUT /upload/:filename → R2에 이미지 업로드
 * - DELETE /delete/:filename → R2에서 이미지 삭제
 * - GET /list → R2 버킷 파일 목록
 * - GET /:filename → R2에서 이미지 조회
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 헤더
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 업로드: PUT /upload/품목코드.png
      if (request.method === 'PUT' && path.startsWith('/upload/')) {
        const filename = decodeURIComponent(path.replace('/upload/', ''));
        const body = await request.arrayBuffer();
        const contentType = request.headers.get('Content-Type') || 'image/png';

        await env.BUCKET.put(filename, body, {
          httpMetadata: { contentType },
        });

        return new Response(JSON.stringify({ success: true, filename }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 삭제: DELETE /delete/품목코드.png
      if (request.method === 'DELETE' && path.startsWith('/delete/')) {
        const filename = decodeURIComponent(path.replace('/delete/', ''));
        await env.BUCKET.delete(filename);

        return new Response(JSON.stringify({ success: true, deleted: filename }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 목록: GET /list
      if (request.method === 'GET' && path === '/list') {
        const listed = await env.BUCKET.list({ limit: 1000 });
        const files = listed.objects.map(obj => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
        }));

        return new Response(JSON.stringify({ files, count: files.length }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 이미지 조회: GET /품목코드.png
      if (request.method === 'GET' && path !== '/') {
        const filename = decodeURIComponent(path.slice(1));
        const object = await env.BUCKET.get(filename);

        if (!object) {
          return new Response('Not Found', { status: 404, headers: corsHeaders });
        }

        return new Response(object.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': object.httpMetadata?.contentType || 'image/png',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }

      return new Response('R2 Image Proxy', { headers: corsHeaders });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
