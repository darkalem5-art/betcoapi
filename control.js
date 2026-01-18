// ==UserScript==
// @name         Betcio - Kripto + Özel Buton → Otofast Yönlendirme
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Kripto ödeme sayfasıysa VE belirli XPath'teki butona basılırsa otofasthavale.pro'ya yönlendirir
// @match        *://*.betcio*/*
// @match        *://m.betcio*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ---------------- Kripto kontrol kelimeleri ----------------
    const KRIPTO_KELIMELER = [
        'kripto', 'kriptopay', 'crypto', 'usdt', 'btc', 'eth',
        'tron', 'tether', 'binance', 'solana', 'polygon'
    ].map(w => w.toLowerCase());

    const TARGET_XPATH = "/html/body/div[1]/div[11]/div/div/div[4]/div/div[2]/div/div[3]/form/div[2]/button";

    // ---------------- Kripto sayfası mı? ----------------
    function isKriptoSayfasi() {
        const url = window.location.href.toLowerCase();
        const bodyText = (document.body?.innerText || '').toLowerCase();

        // URL'de deposit/yatır sayfası olduğunu anlamak
        const depositIndicators = ['page=deposit', 'deposit', 'yatir', 'payment', 'para-yatir'];
        const isDepositPage = depositIndicators.some(ind => url.includes(ind));

        if (!isDepositPage) return false;

        // Kripto kelimelerinden herhangi biri geçiyor mu?
        return KRIPTO_KELIMELER.some(kelime => 
            url.includes(kelime) || bodyText.includes(kelime)
        );
    }

    // ---------------- XPath ile buton bulma ----------------
    function getButtonByXPath(xpath) {
        try {
            return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        } catch (e) {
            return null;
        }
    }

    // ---------------- Ana mantık ----------------
    function setupYonlendirme() {
        // Önce kripto sayfası mı kontrol et
        if (!isKriptoSayfasi()) {
            console.log("[Kripto Yönlendirme] Bu sayfa kripto ödeme sayfası değil → pasif");
            return;
        }

        console.log("[Kripto Yönlendirme] Kripto sayfası tespit edildi → buton izleniyor");

        const button = getButtonByXPath(TARGET_XPATH);

        if (button) {
            console.log("Hedef buton bulundu → tıklama ele geçiriliyor");

            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                console.log("Butona basıldı → yönlendirme yapılıyor!");
                window.location.href = "https://otofasthavale.pro";
            }, true);  // capture phase → diğer dinleyicilerden önce çalışır

            // Güvenlik için bir kez daha text kontrolü (ekstra)
            const btnText = (button.textContent || button.innerText || '').toLowerCase();
            if (btnText.includes('yatır') || btnText.includes('onay') || btnText.includes('gönder')) {
                console.log("Buton metni de onaylatıcı görünüyor");
            }
        } else {
            console.log("Buton henüz DOM'da yok, bekleniyor...");
        }
    }

    // İlk deneme (sayfa yüklendikten kısa süre sonra)
    setTimeout(setupYonlendirme, 600);

    // Dinamik yükleme için periyodik kontrol (çok yaygın durum)
    const intervalId = setInterval(() => {
        const btn = getButtonByXPath(TARGET_XPATH);
        if (btn) {
            setupYonlendirme();
            clearInterval(intervalId);  // bulduktan sonra interval'ı durdur
        }
    }, 500);

    // URL değişirse yeniden kontrol (SPA davranışı için)
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            setTimeout(setupYonlendirme, 400);
        }
    });
    urlObserver.observe(document, { subtree: true, childList: true });

})();
