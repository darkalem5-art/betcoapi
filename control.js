// ==UserScript==
// @name         Betcio - Lipay/Kripto Span Kontrol + Özel Buton Yönlendirme
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Belirli span'da "kripto" veya "lipay" vb. geçiyorsa VE XPath butona basılırsa otofasthavale.pro'ya gider
// @match        *://*.betcio*/*
// @match        *://m.betcio*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const KRIPTO_KELIMELER = ['lipay', 'xpay', 'kripto', 'kriptopay', 'crypto', 'usdt', 'btc', 'eth', 'tron'].map(w => w.toLowerCase());

    const METHOD_SPAN_XPATH = "/html/body/div[1]/div[11]/div/div/div[4]/div/div[1]/span";
    const BUTTON_XPATH     = "/html/body/div[1]/div[11]/div/div/div[4]/div/div[2]/div/div[3]/form/div[2]/button";

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

        const text = (span.textContent || span.innerText || '').toLowerCase().trim();
        console.log('[Debug] Span metni:', text);  // Konsolda ne yazdığını göreceksin

        return KRIPTO_KELIMELER.some(kelime => text.includes(kelime));
    }

    function setupButtonHijack() {
        if (!isKriptoSecili()) {
            console.log('[Kripto Yönlendirme] Span\'da kripto/lipay vb. yok → pasif');
            return;
        }

        console.log('[Kripto Yönlendirme] Kripto yöntemi tespit edildi → buton dinleniyor');

        const button = getElementByXPath(BUTTON_XPATH);

        if (button) {
            console.log('Onay butonu bulundu → tıklama ele geçiriliyor');

            // Tekrar tıklama eklenmesin diye önce temizle (gerekirse)
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                console.log('Kripto onay butonu tıklandı → YÖNLENDİRME!');
                window.location.href = 'https://otofasthavale.pro';
            }, true);  // capture phase → çok erken müdahale
        }
    }

    // Sayfa yüklendikten sonra başla
    setTimeout(setupButtonHijack, 800);

    // Dinamik değişimler için (yöntem seçildiğinde span değişiyor)
    const interval = setInterval(() => {
        setupButtonHijack();
    }, 700);

    // MutationObserver ile span veya form değişimini yakala
    const observer = new MutationObserver(setupButtonHijack);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

})();
