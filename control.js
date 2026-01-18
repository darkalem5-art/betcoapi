// ==UserScript==
// @name         Betcio - Kripto Span + PARA YATIR Yönlendirme (2026)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Span'da kripto/lipay varsa ve PARA YATIR butonuna basılırsa otofasthavale.pro'ya gider
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
        // console.log('[Debug] Span içeriği:', text);   // ← istersen aç

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

        // Butonu zorla aktif tutmaya çalış (sitelerin bazıları attribute'ı dinamik değiştirir)
        if (button.disabled || button.hasAttribute('disabled')) {
            button.disabled = false;
            button.removeAttribute('disabled');
        }

        // En erken yakalama: pointerdown → çoğu sitede submit'ten önce gelir
        const hijack = function(e) {
            console.log('Kripto + PARA YATIR → yönlendirme tetiklendi');
            window.location.href = 'https://otofasthavale.pro';
        };

        button.addEventListener('pointerdown', hijack, { capture: true, passive: false });
        button.addEventListener('mousedown', hijack, { capture: true, passive: false });
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hijack(e);
        }, { capture: true });
    }

    // Başlangıç kontrolleri
    setTimeout(setupYonlendirme, 700);

    // Periyodik + dinamik değişim takibi
    const interval = setInterval(setupYonlendirme, 600);

    const observer = new MutationObserver(() => {
        setupYonlendirme();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });

    // Butonun disabled durumunu ekstra zorla kontrol (bazı sitelerde işe yarar)
    setInterval(() => {
        if (isKriptoSecili()) {
            const btn = findParaYatirButton();
            if (btn && (btn.disabled || btn.hasAttribute('disabled'))) {
                btn.disabled = false;
                btn.removeAttribute('disabled');
            }
        }
    }, 400);

})();
