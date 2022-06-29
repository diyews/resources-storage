// ==UserScript==
// @name         Douyu video rate
// @namespace    https://github.com/diyews
// @version      0.1
// @description  Number pad to control play rate. (1) -> rate 1, (2) -> rate 2, (5,8) -> - and + 0.5, (7,9) -> - and + 0.1, (4,6) -> backward and forward
// @author       diyews
// @match        https://v.douyu.com/show/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @require      https://cdn.jsdelivr.net/npm/toastify-js
// @resource     tostifyCSS https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css
// @updateURL    https://raw.githubusercontent.com/diyews/resources-storage/master/user_script/douyu_video_rate.user.js
// @downloadURL  https://raw.githubusercontent.com/diyews/resources-storage/master/user_script/douyu_video_rate.user.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==
var newCSS = GM_getResourceText ("tostifyCSS");
GM_addStyle (newCSS);

(function() {
    'use strict';
    var backgroundMap = {
        '0.5': '',
        '1': 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
        '1.5': 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
        '2': 'linear-gradient(to right, #fa709a 0%, #fee140 100%)',
    }

    window.addEventListener('keydown', function(keybaord) {
        var video = document.querySelector('#__video');
        // var needNotification = true;
        var playbackRate = video.playbackRate;
        switch(keybaord.key) {
            case '*':
            case '1':
                playbackRate = 1;
                break;
            case '2':
                playbackRate = 2;
                break;
            case '8':
            case '+':
                playbackRate += 0.5;
                break;
            case '5':
            case '-':
                playbackRate -= 0.5;
                break;
            case '7':
                playbackRate -= 0.1;
                break;
            case '9':
                playbackRate += 0.1;
                break;
            case '4':
            case '6':
                var _map = {
                    '4': 37,
                    '6': 39
                };
                var keyboardEvent = new KeyboardEvent('keydown', {bubbles:true});
                Object.defineProperty(keyboardEvent, 'keyCode', {get:function(){return this.keyCodeVal;}});
                keyboardEvent.keyCodeVal = _map[keybaord.key];
                var abp = document.querySelector('.abp');
                abp.dispatchEvent(keyboardEvent);
                return;
            default:
                return;
        }
        playbackRate = +playbackRate.toFixed(2);
        video.playbackRate = playbackRate;
        window.Toastify({
            text: "Current playback rate: " + playbackRate,
            duration: 3e3,
            newWindow: false,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: 'right', // `left`, `center` or `right`
            backgroundColor: backgroundMap[playbackRate],
            stopOnFocus: true, // Prevents dismissing of toast on hover
            onClick: function(){} // Callback after click
        }).showToast();
    })
})();
