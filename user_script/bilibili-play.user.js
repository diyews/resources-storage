// ==UserScript==
// @name         Bilibili play
// @namespace    http://tampermonkey.net/
// @version      2026-06-19
// @description  try to take over the world!
// @author       You
// @match        https://*.bilibili.com/*
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
    .right-entry > .right-entry-item:first-child, .login-tip {
        display: none !important;
    }

`

    var styleSheet = document.createElement("style")
    styleSheet.textContent = styles
        document.head.appendChild(styleSheet)
    }

    let recentPlayTime = Date.now()
    function a() {
        const close = document.querySelector('.bili-mini-close-icon')
        const video = document.querySelector('#bilibili-player video')
        //
        document.querySelector('.bpx-player-toast-cancel')?.click()
        // 画质提醒
        document.querySelector('.login-guide .close-btn')?.click()
        if (close) {
            close.click()
            if (video?.paused) {
                // 5秒内暂停的，就自动播放，否则无视
                if (Date.now() - recentPlayTime < 5e3) {
                    video.play()
                }
            }
        }

        if (!video?.paused) {
            recentPlayTime = Date.now()
        }

    }

    setInterval(() => a(), 100)
    insertCss()
    // Your code here...
})();
