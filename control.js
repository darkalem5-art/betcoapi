// ==UserScript==
// @name         Betcio Kripto Deposit → Otofast Yönlendirme (Buton Bazlı)
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Deposit sayfasında kripto/LiPay/Xpay seçiliyse, herhangi bir onay butonuna basıldığında otofasthavale.pro'ya gider
// @author       You
// @match        *://*.betcio*/*
// @match        *://m.betcio*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const KRIPTO_INDICATORS = [
        'lipay', 'xpay', 'kripto', 'kriptopay', 'crypto', 'usdt', 'btc', 'eth', 'tron', 'tether'
    ].map(s => s.toLowerCase());

    function isLikelyKriptoDeposit() {
        const url = window.location.href.toLowerCase();
        const bodyText = document.body.innerText.toLowerCase();

        // 1. URL'de deposit sayfası olduğunu anlamak
        if (!url.includes('page=deposit') && !url.includes('yatir') && !url.includes('deposit')) {
            return false;
        }

        // 2. Sayfada kripto ile ilgili kelime geçiyor mu?
        return KRIPTO_INDICATORS.some(word => 
            bodyText.includes(word) || url.includes(word)
        );
    }

    function hijackAllPossibleButtons() {
        if (!isLikelyKriptoDeposit()) return;

        console.log('[Kripto Deposit Algılandı] → Onay butonları ele geçiriliyor...');

        const possibleSelectors = [
            'button', 
            '[type="submit"]', 
            '[type="button"]', 
            '.btn', 
            '[class*="confirm"]', 
            '[class*="submit"]', 
            '[class*="yatir"]', 
            '[class*="deposit"]', 
            '[class*="onay"]', 
            '[role="button"]'
        ];

        const buttons = document.querySelectorAll(possibleSelectors.join(','));

        buttons.forEach(btn => {
            // Mevcut event listener'ları korumak için capture phase'de dinliyoruz
            btn.addEventListener('click', function(e) {
                // Eğer butonun text'inde "onay", "yatır", "gönder", "submit" vs. varsa
                const btnText = (btn.innerText || btn.value || '').toLowerCase();
                if (btnText.includes('yatır') || btnText.includes('onay') || 
                    btnText.includes('gönder') || btnText.includes('tamam') ||
                    btnText.includes('devam') || btnText.includes('submit') ||
                    btn.className.toLowerCase().includes('confirm') ||
                    btn.className.toLowerCase().includes('deposit')) {

                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('Kripto onay butonu tıklandı → yönlendirme!');
                    window.location.href = 'https://otofasthavale.pro';
                }
            }, true); // capture phase → diğer listener'lardan önce çalışır
        });
    }

    // Sayfa ilk yüklendiğinde
    setTimeout(hijackAllPossibleButtons, 800);

    // Dinamik olarak eklenen butonlar için periyodik kontrol
    const observer = new MutationObserver(() => {
        hijackAllPossibleButtons();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Her 1.5 saniyede bir kontrol (ekstra güvenlik)
    setInterval(hijackAllPossibleButtons, 1500);

})();
