// ==UserScript==
// @name         Twich PIP
// @namespace    https://github.com/diyews
// @version      0.1
// @description  Add a button to enter PIP mode
// @author       diyews
// @match        https://www.twitch.tv/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.tv
// @updateURL    https://raw.githubusercontent.com/diyews/resources-storage/master/twitch-PIP.user.js
// @downloadURL  https://raw.githubusercontent.com/diyews/resources-storage/master/twitch-PIP.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var intervaler = setInterval(function() {
        const controlGroup = document.querySelector('.video-ref .player-controls__right-control-group')
        if (controlGroup) {

            const buttonDiv = document.createElement("div");
            const button = document.createElement('button')
            button.className = controlGroup.querySelector('button').className
            button.textContent = 'P'
            button.onclick = () => {
                const video = document.querySelector('.video-ref video');
                video.requestPictureInPicture()
            }
            buttonDiv.appendChild(button)
            const childFirstDiv = controlGroup.querySelector('div')
            controlGroup.insertBefore(buttonDiv, childFirstDiv)
            clearInterval(intervaler);
        }
    }, 500);

    setTimeout(function() {
        clearInterval(intervaler);
    }, 5e3)
})();
