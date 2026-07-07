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

        // 업로드 후 엣지 캐시 즉시 무효화 (구버전 이미지 제거)
        const cacheUrl = new URL(request.url);
        cacheUrl.pathname = '/' + filename;
        await caches.default.delete(new Request(cacheUrl.toString()));

        return new Response(JSON.stringify({ success: true, filename }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 삭제: DELETE /delete/품목코드.png
      if (request.method === 'DELETE' && path.startsWith('/delete/')) {
        const filename = decodeURIComponent(path.replace('/delete/', ''));
        await env.BUCKET.delete(filename);

        // 캐시 무효화
        const cacheUrl = new URL(request.url);
        cacheUrl.pathname = '/' + filename;
        await caches.default.delete(new Request(cacheUrl.toString()));

        return new Response(JSON.stringify({ success: true, deleted: filename }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Rename: POST /rename/옛이름.png/새이름.png
      // ERP 에서 품목 코드를 변경할 때 R2 이미지를 그대로 이전 (GET → PUT → DELETE 조합).
      // 예전엔 옛 파일만 지우고 새 파일명으로 이전 안 해서 코드 변경 시 이미지가 사라졌음.
      if (request.method === 'POST' && path.startsWith('/rename/')) {
        const rest = path.replace('/rename/', '');
        const slashIdx = rest.indexOf('/');
        if (slashIdx <= 0) {
          return new Response(JSON.stringify({ error: 'invalid rename path' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const from = decodeURIComponent(rest.slice(0, slashIdx));
        const to = decodeURIComponent(rest.slice(slashIdx + 1));
        const source = await env.BUCKET.get(from);
        if (!source) {
          return new Response(JSON.stringify({ error: 'source not found', from }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        await env.BUCKET.put(to, source.body, {
          httpMetadata: source.httpMetadata,
        });
        await env.BUCKET.delete(from);
        // 양쪽 URL 캐시 무효화
        const url1 = new URL(request.url); url1.pathname = '/' + from;
        const url2 = new URL(request.url); url2.pathname = '/' + to;
        await caches.default.delete(new Request(url1.toString()));
        await caches.default.delete(new Request(url2.toString()));
        return new Response(JSON.stringify({ success: true, from, to }), {
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
            'Cache-Control': 'public, max-age=31536000',
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
