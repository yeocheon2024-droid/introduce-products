(function () {
    'use strict';
    const codes = ["F297908","F298005","F298019","F298052","F298060","F298086","F298124","F298133","F298146","F298166","F298176","F298202","F298204","F298205","F298207","F298231","F298232","F298235","F298236","F298238","F298250","F298257","F298294","F298295","F298296","F298305","F298308","F298320","F298334","F298364","F298374","F298385","F298411","F298413","F298429","F298430","F298433","F298438","F298447","F298448","F298449","F298450","F298451","F298458","F298463","F298464","F298479","F298480","F298483","F298486","F298488","F298490","F298494","F298496","F298499","F298501","F298505","F298511","F298520","F298526","F298535","F298571","F298573","F298574","F298575","F298579","F298581","F298585","F298586","F298589","F298590","F298595","F298596","F298599","F298600","F298602","F298603","F298605","F298607","F298608","F298612","F298615","F298616","F298619","F298622","F298625","F298627","F298630","F298631","F298635","F298636","F298638","F298642","F298647","F298648","F298650","F298654","F298657","F298659","F298663","F298665","F298670","F298673","F298677","F298682","F298684","F298686","F298690","F298714","F298718","F298719","F298721","F298724","F298726","F298728","F298740","F298749","F298752","F298754","F298756","F298764","F298804","F298838","F298840","F298841","F298846","F298852","F298855","F298873","F298876","F298879","F298896","F298919","F298923","F298933","F298935","F298970","F300445","F300446","F300447","F300592","F300593","F300594","F300595","F300596","F300597","F300598","F300599","F300600","F300601","F300602","F300700","F300866","F301088","F301089","F301349","F301350","F301517","F301901","F301902","F301903","F302034","F302144","F302153","F303015","F303016","F303382","F303383","F303384","F303407","F303408","F303409","F305374","F305471","F305472","F305473","F305474","F305475","F305477","F305479","F305487","F305593","F306514","F306645","F306836","F308535","F308628","F308629","F308705","F308809","F309299","F310269","F311111","F311964","F311965","F312059","F312288","F312289","F312495","F312496","F312990","F314328","F315194","F315242","F315401","F315648","F316648","F316649","F316969","F316970","F317464","F318657","F318659","F319637","F320044","F320045","F320046","F320047","F320048","F320049","F320050","F320051","F320052","F320061","F320062","F320064","F320067","F320071","F320072","F320073","F320074","F320075","F320076","F320077","F320078","F320422","F320498","F321272","F321273","F321648","F321649","F321895","F321945","F321946","F322011","F323692","F323720","F323741","F323793","F323794","F323795","F323797","F324034","F324058","F324059","F324143","F324145","F324468","F324469","F324471","F324751","F324814","F325084","F325105","F325222","F325227","F325228","F325280","F325352","F326020","F326022","F326026","F326272","F326281","F326931","F327347","F327498","F327499","F327500","F327501","F327668","F327669","F327964","F328076","F328670","F328685","F328686","F328964","F329528","F329571","F329572","F329688","F329702","F329703","F329712","F330070","F330075","F330076","F330077","F330420","F331404","F331694","F331695","F331705","F331706","F332230","F332231","F332232","F333144","F333226","F334769","F334770","F334771","F334911","F335029","F335635","F335647","F335760","F335761","F335973","F335974","F336438","F336439","F336440","F337714","F338675","F338676","F338677","F338740","F338922","F339640","F340912","F341998","F342067","F342068","F342069","F342638","F342641","F342893","F342968","F342977","F343540","F343565","F343566","F343567","F343568","F343569","F343940","F344184","F344185","F344577","F344753","F344758","F344759","F344760","F344761","F344762","F344764","F345137","F345657","F345659","F345660","F345661","F345662","F345664","F345849","F345850","F345951","F345952","F346096","F346097","F346098","F346104","F346113","F346115","F346581","F346588","F346826","F347405","F347406","F347434","F347722","F348723","F348724","F349274","F350364","F350365","F350366","F350367","F350368","F350370","F350371","F350372","F350373","F350374","F350376","F350378","F350681","F351617","F351618","F352393","F353241","F353242","F353255","F355200","F355325","F355934","F355937","F355938","F356344","F356371","F356373","F357094","F357333","F357334","F357414","F357415","F357521","F357522","F357523","F357525","F357526","F357694","F357904","F358577","F358579","F358580","F358582","F358583","F358584","F358585","F358586","F358715","F358822","F358823","F358824","F358825","F358826","F359330","F359927","F360436","F360742","F360917","F360918","F361205","F361206","F361207","F361208","F361209","F361210","F361211","F361214","F361219","F361224","F361937","F362191","F362192","F362193","F362194","F362195","F362196","F362198","F362200","F362201","F362202","F362203","F362232","F362235","F362380","F362381","F362462","F362463","F362464","F363850","F363906","F364354","F365763","F365764","F367429","F367823","F368569","F368570","F370183","F370184","F370185","F370186","F370187","F370257","F370693","F370704","F370705","F370897","F371593","F371594","F371595","F371596","F298242","F298422","F298547","F298577","F298723","F325261","F325262","F325400","F325447","F328965","F328966","F330153","F330154","F330155","F330156","F333340","F335023","F335024","F336437","F340891","F350375","F350377","F350379","F354180","F354181","F354586","F354587","F360429","F367754","F370750","F371751"];
    const panel = document.createElement('div');
    panel.id = 'temporarySikjajaewangUnhide';
    panel.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:9999;background:white;border:2px solid #2d6a4f;border-radius:12px;padding:16px;box-shadow:0 4px 20px #0003;max-width:390px;font:14px sans-serif;color:#222';
    const title = document.createElement('strong');
    title.textContent = '식자재왕 이번 등록품목 숨김 해제';
    const status = document.createElement('p');
    status.style.cssText = 'margin:10px 0;line-height:1.5';
    status.textContent = '2026-10-16 검수 등록 목록만 적용합니다. 완료 후 이 버튼은 자동으로 사라집니다.';
    const button = document.createElement('button');
    button.textContent = '이번 식자재왕 품목만 숨김 해제';
    button.style.cssText = 'background:#2d6a4f;color:white;border:0;border-radius:7px;padding:12px;cursor:pointer;font-weight:bold';
    panel.append(title, status, button);
    document.body.appendChild(panel);

    function reflectConfirmed(confirmed) {
        const selected = new Set(confirmed);
        if (typeof products !== 'undefined') {
            products.forEach(p => { if (selected.has(p.code)) p.hidden = false; });
            try { localStorage.setItem('erp_products', JSON.stringify(products)); } catch (e) { console.warn('품목 캐시 갱신 실패', e.message); }
        }
        // Preserve every other baseline field, including prices, to avoid stale data writes.
        if (typeof syncBaseline !== 'undefined' && syncBaseline) {
            confirmed.forEach(code => {
                const raw = syncBaseline.get(code);
                if (!raw) return;
                try { const snapshot = JSON.parse(raw); snapshot.hidden = false; syncBaseline.set(code, JSON.stringify(snapshot)); } catch (e) { console.warn('숨김 기준값 갱신 실패', code); }
            });
        }
    }

    button.onclick = async function () {
        let changed = 0;
        button.disabled = true;
        try {
            if (typeof db === 'undefined' || !db) throw new Error('Supabase 연결이 준비되지 않았습니다.');
            const auth = await db.auth.getSession();
            if (auth.error || !auth.data?.session) throw new Error('관리자로 로그인한 다음 다시 눌러주세요.');
            const targets = [];
            for (let i = 0; i < codes.length; i += 50) {
                const result = await db.from('products').select('code,hidden,vendor_code').in('code', codes.slice(i, i + 50)).eq('vendor_code', 'SJ');
                if (result.error) throw new Error(result.error.message);
                if (!Array.isArray(result.data)) throw new Error('대상 품목 조회 응답이 올바르지 않습니다.');
                result.data.forEach(p => { if (p.hidden && codes.includes(p.code) && p.vendor_code === 'SJ') targets.push(p.code); });
            }
            status.textContent = `${targets.length}개 품목 숨김 해제 중…`;
            for (let i = 0; i < targets.length; i += 50) {
                const batch = targets.slice(i, i + 50);
                const result = await db.from('products').update({ hidden: false }).in('code', batch).eq('vendor_code', 'SJ').eq('hidden', true).select('code,hidden');
                if (result.error) throw new Error(result.error.message);
                const confirmed = (result.data || []).filter(p => batch.includes(p.code) && p.hidden === false).map(p => p.code);
                reflectConfirmed(confirmed);
                changed += confirmed.length;
                if (confirmed.length !== batch.length) throw new Error('일부 품목의 저장이 확인되지 않았습니다. 다시 누르면 남은 품목만 처리합니다.');
                status.textContent = `${changed} / ${targets.length}개 저장 완료…`;
            }
            let remaining = 0;
            for (let i = 0; i < codes.length; i += 50) {
                const result = await db.from('products').select('code,hidden,vendor_code').in('code', codes.slice(i, i + 50)).eq('vendor_code', 'SJ');
                if (result.error || !Array.isArray(result.data)) throw new Error('최종 상태 확인에 실패했습니다.');
                reflectConfirmed(result.data.filter(p => !p.hidden).map(p => p.code));
                remaining += result.data.filter(p => p.hidden).length;
            }
            if (remaining) throw new Error(`${remaining}개가 아직 숨김 상태입니다. 다시 눌러주세요.`);
            if (typeof renderProductList === 'function') renderProductList();
            if (typeof renderDashboard === 'function') renderDashboard();
            panel.remove();
            alert(`식자재왕 숨김 해제 완료: ${changed}개 변경.\n이번 등록 목록의 남은 숨김 품목 0개를 확인했습니다.`);
        } catch (error) {
            status.textContent = `${changed}개 변경 후 중단: ${error.message}`;
            button.disabled = false;
        }
    };
})();
