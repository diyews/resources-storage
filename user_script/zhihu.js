// ==UserScript==
// @name         Zhihu
// @namespace    https://github.com/diyews
// @version      0.1
// @description  
// @author       diyews
// @match        https://www.zhihu.com/question/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @updateURL    https://raw.githubusercontent.com/diyews/resources-storage/master/user_script/zhihu.user.js
// @downloadURL  https://raw.githubusercontent.com/diyews/resources-storage/master/user_script/zhihu.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var intervaler = setInterval(function() {
        var el = document.querySelector(`.SignContainer-content`)
        if (el) {
            var parent = el.parentNode;
            var child = el;
            while (parent !== document.body) {
                child = parent;
                parent = parent.parentNode;
            }
            document.body.removeChild(child);
            document.documentElement.style.overflow = ''
            clearInterval(intervaler);
        }
    }, 500);

    setTimeout(function() {
        clearInterval(intervaler);
    }, 5e3)
})();
