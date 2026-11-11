const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
(async () => {
  const source = fs.readFileSync('r2-proxy/worker.js', 'utf8');
  const worker = (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))).default;
  const data = new Map();
  const object = (etag, body, type = 'image/png') => ({ etag, httpEtag: `"${etag}"`, body, size: Buffer.byteLength(body), httpMetadata: { contentType: type } });
  let reads = 0;
  const env = { BUCKET: {
    head: async key => { reads++; return data.get(key) || null; },
    get: async key => { reads++; return data.get(key) || null; },
    put: async (key, body, options) => { const entry = object('uploaded', body, options.httpMetadata.contentType); data.set(key, entry); return entry; },
    delete: async key => data.delete(key),
    list: async options => { assert.equal(options.delimiter, '/'); return { objects: [], truncated: true, cursor: 'next' }; },
  } };
  const edge = new Map();
  global.caches = { default: {
    delete: async key => edge.delete(key.url),
    match: async key => edge.get(key.url)?.clone(),
    put: async (key, response) => edge.set(key.url, response.clone()),
  } };
  const call = (path, options) => worker.fetch(new Request('https://images.test' + path, options), env);
  data.set('A.png', object('one', 'original'));
  let r = await call('/thumb/A.png?w=800&v=1');
  assert.equal(r.headers.get('X-Image-Variant'), 'original'); assert.equal(r.headers.get('Cache-Control'), 'no-store');
  data.set('_optimized/v1/one/w800.webp', object('small', 'webp', 'image/webp'));
  r = await call('/thumb/A.png?w=800&v=1'); assert.equal(await r.text(), 'webp'); assert.match(r.headers.get('Cache-Control'), /immutable/);
  assert.equal(r.headers.get('Content-Length'), '4');
  assert.equal((await call('/thumb/A.png?w=800&v=1', { headers: { 'If-None-Match': '"small"' } })).status, 304);
  assert.equal(await (await call('/thumb/A.png?w=800&v=1', { method: 'HEAD' })).text(), '');
  data.set('A.png', object('two', 'replacement'));
  assert.equal(await (await call('/thumb/A.png?w=800&v=2')).text(), 'replacement', 'old optimized image must not survive source replacement');
  data.delete('A.png'); assert.equal((await call('/thumb/A.png?w=800&v=2')).status, 404);
  assert.equal((await call('/thumb/A.png?w=500')).status, 400);
  r = await call('/upload/B.png', { method: 'PUT', body: 'new' }); assert.equal((await r.json()).etag, 'uploaded');
  assert.equal((await (await call('/list')).json()).cursor, 'next');


  data.set('C.png', object('c1', 'large'));
  data.set('_optimized/v1/c1/w400.webp', object('cw1', 'small-one', 'image/webp'));
  r = await call('/thumb/C.png?w=400&v=direct1-1');
  assert.equal(await r.text(), 'small-one');
  const beforeHit = reads;
  r = await call('/thumb/C.png?w=400&v=direct1-1');
  assert.equal(r.headers.get('X-Image-Cache'), 'HIT');
  assert.equal(await r.text(), 'small-one');
  assert.equal(reads, beforeHit, 'warm versioned thumbnail must perform zero R2 reads');
  assert.equal((await call('/thumb/C.png?w=400&v=direct1-1', { headers: { 'If-None-Match': '"cw1"' } })).status, 304);
  assert.equal(await (await call('/thumb/C.png?w=400&v=direct1-1', { method: 'HEAD' })).text(), '');
  assert.equal(reads, beforeHit, 'warm HEAD/304 must also skip R2');
  data.set('C.png', object('c2', 'large-two'));
  data.set('_optimized/v1/c2/w400.webp', object('cw2', 'small-two', 'image/webp'));
  assert.equal(await (await call('/thumb/C.png?w=400&v=direct1-2')).text(), 'small-two', 'new version must bypass previous cache');
  r = await call('/thumb/C.png?w=400');
  assert.equal(await r.text(), 'small-two'); assert.equal(r.headers.get('Cache-Control'), 'no-store');
  data.delete('C.png');
  assert.equal((await call('/thumb/C.png?w=400&v=direct1-3')).status, 404);
  assert.equal((await call('/thumb/C.png?w=400')).status, 404);

  const uploads = [], sizes = []; let closed = 0;
  const context = { R2_WORKER_URL: 'https://images.test', console,
    createImageBitmap: async () => ({ width: 2000, height: 4000, close: () => closed++ }),
    document: { createElement: () => { const canvas = { getContext: () => ({ drawImage: () => {} }), toBlob: fn => { sizes.push([canvas.width, canvas.height]); fn({ type: 'image/webp' }); } }; return canvas; } },
    fetch: async (url, options) => { uploads.push({ url, options }); return { ok: true, json: async () => ({ success: true }) }; },
  };
  vm.runInNewContext(fs.readFileSync('optimized-images.js', 'utf8'), context);
  await context.prepareOptimizedImages({}, 'abc123', false);
  assert.equal(uploads.length, 2); assert.deepEqual(sizes, [[400, 800], [800, 1600]]); assert.equal(closed, 1);
  uploads.length = 0; await context.prepareOptimizedImages({}, 'abc123', true); assert.equal(uploads.length, 1);
  uploads.length = 0; await context.prepareOptimizedImages({}, '', true); assert.equal(uploads.length, 0);
  const html = fs.readFileSync('index.html', 'utf8');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\bsrc=|application\/ld\+json/.test(match[1])) new vm.Script(match[2]);
  }
  assert.ok(html.includes('prepareOptimizedImages(file, result.etag, false)'));
  assert.ok(html.includes('prepareOptimizedImages(file, result.etag, true)'));
  console.log('PASS: direct WebP, original fallback, replacement/delete freshness, 304/HEAD, upload ETag, pagination, ERP sizes/quality, syntax');
})().catch(error => { console.error(error); process.exitCode = 1; });
