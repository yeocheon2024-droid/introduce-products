const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
(async () => {
  const source = fs.readFileSync('r2-proxy/worker.js', 'utf8');
  const worker = (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))).default;
  const data = new Map();
  const object = (etag, body, type = 'image/png') => ({ etag, httpEtag: `"${etag}"`, body, httpMetadata: { contentType: type } });
  const env = { BUCKET: {
    head: async key => data.get(key) || null,
    get: async key => data.get(key) || null,
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
  assert.equal((await call('/thumb/A.png?w=800&v=1', { headers: { 'If-None-Match': '"small"' } })).status, 304);
  assert.equal(await (await call('/thumb/A.png?w=800&v=1', { method: 'HEAD' })).text(), '');
  data.set('A.png', object('two', 'replacement'));
  assert.equal(await (await call('/thumb/A.png?w=800&v=2')).text(), 'replacement', 'old optimized image must not survive source replacement');
  data.delete('A.png'); assert.equal((await call('/thumb/A.png?w=800&v=2')).status, 404);
  assert.equal((await call('/thumb/A.png?w=500')).status, 400);
  r = await call('/upload/B.png', { method: 'PUT', body: 'new' }); assert.equal((await r.json()).etag, 'uploaded');
  assert.equal((await (await call('/list')).json()).cursor, 'next');


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
