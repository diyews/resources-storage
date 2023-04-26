// ==UserScript==
// @name         Douyu
// @namespace    https://github.com/diyews/
// @version      0.1
// @description  1. Send daily gift
// @author       diyews
// @match        https://www.douyu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=douyu.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    (() => {
        fetch("https://www.douyu.com/japi/prop/backpack/web/v1?rid=5551871", {
            "headers": {
                "accept": "application/json, text/plain, */*",
            },
            "body": null,
            "method": "GET",
        }).then(res => res.json())
            .then(res => {
            const dailyGift = res?.data?.list?.find(o => o.id === 268);

            console.log(dailyGift);
            const hasChangedToday = detectChangedToday(dailyGift?.count || 0);
            if (!dailyGift && hasChangedToday) { return; }

            const isTodayExpired = datesAreOnSameDay(new Date((dailyGift?.met || 0) * 1000 - 1000), new Date());

            const btn = document.createElement('div');
            // btn.classList = 'BackpackButton';
            btn.style.cssText = `position: fixed;top: 20px;right: 100px;z-index: 10000;background: ${isTodayExpired ? 'red;' : '#3898ff;'}
            color: #fff;
    text-align: center;
    width: 54px;
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    border-radius: 10px;
            `;
            btn.innerHTML = `<span>${ dailyGift?.count ? dailyGift.count : '礼物' }</span>` + (hasChangedToday ? '<span style="width: 8px;height: 8px;border: 2px solid #fff;background: #ff5d23;position: absolute;right: 0;top: 0;border-radius: 8px;""></span>' : '');
            btn.onclick = () => {
                const sendGift = (roomId, count, giftId = 268) => {
                    return fetch("https://www.douyu.com/japi/prop/donate/mainsite/v1", {
                        "headers": {
                            "accept": "application/json, text/plain, */*",
                            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                            "content-type": "application/x-www-form-urlencoded",
                        },
                        "body": `propId=${giftId}&propCount=${count}&roomId=${roomId}&bizExt=%7B%22yzxq%22%3A%7B%7D%7D`,
                        "method": "POST",
                    })
                };

                localStorage.setItem('last_daily_gift_count', 0);
                const every = Math.floor(dailyGift.count / 7);
                sendGift(0, every);
                sendGift(0, every);
                sendGift(0, every);
                sendGift(0, dailyGift.count - every * 3);
                btn.remove();
            }

            document.body.appendChild(btn);
        })
    })();

    function detectChangedToday(newCount) {
        const lastCheckDate = +localStorage.getItem('last_daily_gift_check_date') || 0;
        if (datesAreOnSameDay(new Date(lastCheckDate), new Date())) { return true; }

        const lastCount = +localStorage.getItem('last_daily_gift_count') || 0;
        // const todayCount = +localStorage.getItem('today_gift_count') || 0;
        localStorage.setItem('last_daily_gift_count', newCount);

        const changed = lastCount !== newCount;
        if (changed) {
            localStorage.setItem('last_daily_gift_check_date', Date.now());
        }

        return changed;
    }

    function datesAreOnSameDay(first, second) {
        return first.getFullYear() === second.getFullYear() &&
            first.getMonth() === second.getMonth() &&
            first.getDate() === second.getDate();
    }
})();
