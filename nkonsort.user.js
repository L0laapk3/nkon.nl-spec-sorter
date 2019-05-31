// ==UserScript==
// @name         nkon.nl spec sorter
// @namespace    https://github.com/L0laapk3/nkon.nl-spec-sorter
// @version      2.0.0
// @author       L0laapk3
// @match        *://*.nkon.nl/*
// @updateURL    https://rawgit.com/L0laapk3/nkon.nl-spec-sorter/master/nkonsort.user.js
// @downloadURL  https://rawgit.com/L0laapk3/nkon.nl-spec-sorter/master/nkonsort.user.js
// @grant        none
// ==/UserScript==

(function() {

    function update() {
        var products = [];
        document.querySelectorAll('.products-grid .item').forEach(function(e) {
            var title = e.querySelector('.product-name').innerText;
            products.push({
                price: parseFloat(e.querySelector('.regular-price > .price, .special-price > .price, .price-from > .price').innerText.match(/[\d,.]+/)[0].replace(',','.')),
                capacity: /(?<=^| )[\d,.]+mAh(?=$| )/i.test(title) && parseFloat(title.match(/(?<=^| )[\d,.]+mAh(?=$| )/i)[0].replace(',','.')) / 1000 || NaN,
                current: /(?<=^| )[\d,.]+A(?=$| )/i.test(title) && parseFloat(title.match(/(?<=^| )[\d,.]+A(?=$| )/i)[0].replace(',','.')) || NaN,
                url: e.querySelector('.product-name a').href,
                el: e,
                refurbished: e.querySelector('.product-name a').innerText.toLowerCase().includes("refurbish")
            });
        });

        products = products.filter(function(a) { return (localStorage.includeRefurbished === "true" || !a.refurbished) && a.capacity && a.price; })
                           .sort(function(a, b) { return b.capacity / b.price - a.capacity / a.price; })
                           .concat(products.filter(function(a) { return !a.capacity || !a.price; }));

        var minScore = 0;
        var str = [], css = [], evenRow = false, longestUrl = products.reduce((r, a) => a.url ? Math.max(a.url.length, r) : r, 0);
        products.forEach(function(a) {
            let thisScore = a.current * a.capacity;
            if (a.capacity < 2.4)
                thisScore *= 0.25;
            str.push("%c" + pad(a.capacity + "Ah", 10) + pad(a.current + "A", 8) + pad(a.price + '€', 10) + pad(Math.round(a.price / a.capacity * 100, 0) / 100 + "€/Ah", 13+5) + (a.url ? pad(a.url, longestUrl) : ""));
            css.push((minScore <thisScore ? "color: #000" : (minScore * 0.9 <= thisScore ? "color: #555" : "color: #aaa")) + ";background-color: " + ((evenRow = !evenRow) ? "white" : "#f5f5f5"));
            if (minScore < thisScore)
                minScore = thisScore;
        });
        str.push("");
        str.push("%clocalStorage.includeRefurbished = " + (localStorage.includeRefurbished === "true" ? "true" : "false"));
        css.push("font-weight: bold");
        str.push("");
        str.push("");

        //console.clear();
        console.log.apply(console, [str.join('\n')].concat(css));
    }


    update();
    window.onpopstate = history.onpushstate = history.onreplacestate = function() {
        console.clear();
        function test() {
            if (document.getElementById("m-wait") && document.getElementById("m-wait").style.display != "none")
                setTimeout(test, 50);
            else
                update();
        }
        test();
    }

    function pad(str, len) {
        len = len || 10;
        if (Array.isArray(str)) return str.map(a => pad(a, len));
        return str + " ".repeat(len - str.length);
    }
})();