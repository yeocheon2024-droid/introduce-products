// ERP 업로드 시 미리 만든 WebP만 추가한다. 실패해도 원본 업로드는 유지한다.
async function prepareOptimizedImages(file, etag, label) {
    if (!etag || !/^[a-zA-Z0-9-]+$/.test(etag)) return;
    let bitmap;
    try {
        bitmap = await createImageBitmap(file);
        const widths = label ? [800] : [400, 800];
        for (const width of widths) {
            const ratio = Math.min(1, width / bitmap.width, 16000 / bitmap.height);
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
            canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
            canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', label ? 0.92 : 0.84));
            if (!blob || blob.type !== 'image/webp') throw new Error('WebP 변환 미지원');
            const key = '_optimized/v1/' + etag + '/w' + width + '.webp';
            const response = await fetch(R2_WORKER_URL + '/upload/' + encodeURIComponent(key), {
                method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: blob
            });
            if (!response.ok || !(await response.json()).success) throw new Error('최적화 이미지 저장 실패');
        }
    } catch (error) {
        console.warn('작은 이미지 준비 실패 — 원본으로 표시됩니다:', error.message);
    } finally {
        if (bitmap) bitmap.close();
    }
}
