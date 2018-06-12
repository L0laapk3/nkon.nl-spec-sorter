// ==UserScript==
// @name         nkon.nl spec sorter
// @namespace    https://github.com/L0laapk3/nkon.nl-spec-sorter
// @version      1.0.0
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
                price: parseFloat(e.querySelector('.regular-price, .special-price, .price').innerText.match(/[\d,.]+/)[0].replace(',','.')),
                capacity: /(?<=^| )[\d,.]+mAh(?=$| )/i.test(title) && parseFloat(title.match(/(?<=^| )[\d,.]+mAh(?=$| )/i)[0].replace(',','.')) / 1000 || NaN,
                current: /(?<=^| )[\d,.]+A(?=$| )/i.test(title) && parseFloat(title.match(/(?<=^| )[\d,.]+A(?=$| )/i)[0].replace(',','.')) || NaN,
                url: e.querySelector('.product-name a').href,
                el: e
            });
        });

        products = products.filter(function(a) { return a.capacity && a.price; }).sort(function(a, b) { return b.capacity / b.price - a.capacity / a.price; }).concat(products.filter(function(a) { return !a.capacity || !a.price; }));

        var min = 0;
        var str = [], css = [];
        products.forEach(function(a) {
            str.push("%c" + pad(a.capacity + "Ah", 10) + pad(a.current + "A", 8) + pad(a.price + '€', 10) + pad(Math.round(a.price / a.capacity * 100, 0) / 100 + "€/Ah", 13+5) + a.url);
            css.push(min < a.current ? "color: black" : (min * 0.9 <= a.current ? "color: grey" : "color: lightgrey"));
            if (min < a.current)
                min = a.current;
        });

        console.clear();
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