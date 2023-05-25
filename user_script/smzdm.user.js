// ==UserScript==
// @name         smzdm
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://search.smzdm.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=smzdm.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


    const list = document.querySelectorAll('.feed-row-wide')
    console.log(list)

    list.forEach(el => {
        const count = el.querySelector('.z-icon-zhi-o-thin + span')?.innerText;
        console.log(count)

        if (count >= 10) {
        } else {
            el.style.display = 'none'
        }
    })
    // Your code here...
})();
