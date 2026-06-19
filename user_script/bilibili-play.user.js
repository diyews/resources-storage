// ==UserScript==
// @name         Bilibili play
// @namespace    http://tampermonkey.net/
// @version      2026-06-19
// @description  try to take over the world!
// @author       You
// @match        https://www.bilibili.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function insertCss() {
        var styles = `
    .bili-mini-mask {
        opacity: 0.1
    }

`

    var styleSheet = document.createElement("style")
    styleSheet.textContent = styles
        document.head.appendChild(styleSheet)
    }

    function a() {
        const close = document.querySelector('.bili-mini-close-icon')
        document.querySelector('.bpx-player-toast-cancel')?.click()
        if (close) {
            close.click()
            const video = document.querySelector('#bilibili-player video')
            if (video?.paused) {
                video.play()
            }
        }
    }

    setInterval(() => a(), 100)
    insertCss()
    // Your code here...
})();
