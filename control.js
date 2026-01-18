// ==UserScript==
// @name         Otofast Havale Kripto Yönlendirme
// @namespace    Violentmonkey Scripts
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const KRIPTO_KELIMELER = ["xpay", "kripto", "crypto", "usdt", "btc", "eth"];

    // Hedef span elementi
    const warningSpan = document.querySelector(
        'body > div:nth-child(1) > div:nth-child(11) > div > div > div:nth-child(4) > div > div:nth-child(1) > span'
    );

    // Yönlendirme butonu
    const redirectButton = document.querySelector(
        'body > div:nth-child(1) > div:nth-child(11) > div > div > div:nth-child(4) > div > div:nth-child(2) > div > div:nth-child(3) > form > div:nth-child(3) > button'
    );

    if (!warningSpan || !redirectButton) {
        console.log("Hedef span veya buton bulunamadı");
        return;
    }

    const spanText = warningSpan.textContent.toLowerCase();

    // Kelimelerden herhangi biri var mı?
    const containsKripto = KRIPTO_KELIMELER.some(kelime => spanText.includes(kelime));

    if (containsKripto) {
        console.log("Kripto/Xpay içeriği tespit edildi → yönlendirme aktif");

        // Orijinal tıklama davranışını engelleyip yönlendirme yapıyoruz
        redirectButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // İstersen kısa bir gecikme de koyabilirsin
            // setTimeout(() => {
            window.location.href = "https://otofasthavale.pro";
            // }, 300);
        }, true);
    }

})();
