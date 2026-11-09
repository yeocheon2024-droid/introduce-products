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
      'Access-Control-Allow-Methods': 'GET, HEAD, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Expose-Headers': 'ETag, X-Image-Variant',
    };

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 일괄 준비 전용. 사용자 이미지 조회에서는 실행하지 않는다.
      if (request.method === 'POST' && path.startsWith('/precompute/')) {
        if (!env.IMAGE_PRECOMPUTE_TOKEN || request.headers.get('Authorization') !== `Bearer ${env.IMAGE_PRECOMPUTE_TOKEN}`) return new Response('Unauthorized', { status: 401 });
        const filename = decodeURIComponent(path.slice('/precompute/'.length));
        if (filename.includes('/') || !/\.(png|jpe?g|webp)$/i.test(filename)) return new Response('Invalid image', { status: 400 });
        const source = await env.BUCKET.head(filename);
        if (!source) return new Response('Not Found', { status: 404 });
        const label = /_label\d*\.png$/i.test(filename);
        let created = 0;
        for (const width of label ? [800] : [400, 800]) {
          const key = `_optimized/v1/${source.etag}/w${width}.webp`;
          if (await env.BUCKET.head(key)) continue;
          const original = `https://pub-b2fb7e97bfae4e7f96db58f188aa1ce7.r2.dev/${encodeURIComponent(filename)}?source=${source.etag}`;
          const response = await fetch(`https://wsrv.nl/?url=${encodeURIComponent(original)}&w=${width}&h=16000&fit=inside&we&output=webp&q=${label ? 92 : 84}`, { signal: AbortSignal.timeout(25000) });
          if (!response.ok || !response.headers.get('Content-Type')?.startsWith('image/webp')) return new Response('Conversion unavailable: ' + response.status, { status: 502 });
          if ((await env.BUCKET.head(filename))?.etag !== source.etag) return new Response('Source changed', { status: 409 });
          await env.BUCKET.put(key, response.body, { httpMetadata: { contentType: 'image/webp' } });
          created++;
        }
        return new Response(JSON.stringify({ key: filename, status: created ? 'created' : 'existing', variants: created }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
      }
      // 업로드: PUT /upload/품목코드.png
      if (request.method === 'PUT' && path.startsWith('/upload/')) {
        const filename = decodeURIComponent(path.replace('/upload/', ''));
        const body = await request.arrayBuffer();
        const contentType = request.headers.get('Content-Type') || 'image/png';

        const uploaded = await env.BUCKET.put(filename, body, {
          httpMetadata: { contentType },
        });

        // 업로드 후 엣지 캐시 즉시 무효화 (구버전 이미지 제거)
        const cacheUrl = new URL(request.url);
        cacheUrl.pathname = '/' + filename;
        await caches.default.delete(new Request(cacheUrl.toString()));

        return new Response(JSON.stringify({ success: true, filename, etag: uploaded.etag }), {
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
        // 최적화 파일은 하위 폴더에 보관하여 ERP 원본 목록을 차지하지 않는다.
        const listed = await env.BUCKET.list({ limit: 1000, delimiter: '/', cursor: url.searchParams.get('cursor') || undefined });
        const files = listed.objects.map(obj => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
          etag: obj.etag,
        }));

        return new Response(JSON.stringify({ files, count: files.length, cursor: listed.truncated ? listed.cursor : null }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 원본 내용(ETag)으로 미리 만든 WebP를 선택한다. 교체/삭제/코드 변경 시
      // 이전 원본의 최적화 파일을 잘못 제공하지 않는다. 변환 서버 호출은 없다.
      if ((request.method === 'GET' || request.method === 'HEAD') && path.startsWith('/thumb/')) {
        const filename = decodeURIComponent(path.slice('/thumb/'.length));
        const width = Number(url.searchParams.get('w') || 400);
        if (![400, 800].includes(width) || !filename || filename.startsWith('_optimized/')) {
          return new Response('Invalid thumbnail', { status: 400, headers: corsHeaders });
        }
        const source = await env.BUCKET.head(filename);
        if (!source) return new Response('Not Found', { status: 404, headers: { ...corsHeaders, 'Cache-Control': 'no-store' } });
        const variant = await env.BUCKET.get(`_optimized/v1/${source.etag}/w${width}.webp`);
        const object = variant || await env.BUCKET.get(filename);
        if (!object) return new Response('Not Found', { status: 404, headers: { ...corsHeaders, 'Cache-Control': 'no-store' } });
        const headers = {
          ...corsHeaders,
          'Content-Type': variant ? 'image/webp' : object.httpMetadata?.contentType || 'image/png',
          'Cache-Control': variant && url.searchParams.has('v') ? 'public, max-age=31536000, immutable' : 'no-store',
          'ETag': object.httpEtag,
          'X-Image-Variant': variant ? 'webp' : 'original',
        };
        if (request.headers.get('If-None-Match') === object.httpEtag) return new Response(null, { status: 304, headers });
        return new Response(request.method === 'HEAD' ? null : object.body, { headers });
      }

      // 이미지 조회: GET /품목코드.png
      if ((request.method === 'GET' || request.method === 'HEAD') && path !== '/') {
        const filename = decodeURIComponent(path.slice(1));
        const object = await env.BUCKET[request.method === 'HEAD' ? 'head' : 'get'](filename);

        if (!object) {
          return new Response('Not Found', { status: 404, headers: corsHeaders });
        }

        return new Response(request.method === 'HEAD' ? null : object.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': object.httpMetadata?.contentType || 'image/png',
            'Cache-Control': 'public, max-age=31536000',
            'ETag': object.httpEtag,
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
