// ==UserScript==
// @name         Mark stubborn FB notifications as read
// @namespace    all
// @version      2024-10-13
// @description  Mark stubborn FB notifications as read
// @downloadURL  https://github.com/InNoobWeTrust/dotfiles/raw/master/.innoobwetrust/life_hacks/fb/fb_gradually_mark_read.user.js
// @updateURL    https://github.com/InNoobWeTrust/dotfiles/raw/master/.innoobwetrust/life_hacks/fb/fb_gradually_mark_read.user.js
// @match        https://*.facebook.com/notifications
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

const mark_read = async () => {
  let cnt = 0
  let lst = [...document.querySelectorAll('div[aria-label=Notifications] div[role=row] div[role=button]')]
  while (lst.length - cnt > 1) {
    const e = lst[cnt]
    scrollTo(e)
    await new Promise(res => setTimeout(res, 1000))
    e.click()
    await new Promise(res => setTimeout(res, 1500))
    const btn = document.querySelector('div[role=menu] div[role=menuitem]')
    if (btn.textContent.includes('Mark as read')) {
      btn.click()
      await new Promise(res => setTimeout(res, 1000))
    } else {
      e.click()
      await new Promise(res => setTimeout(res, 500))
    }
    cnt++
    if (cnt % 10 === 0) {
      if (window.hasOwnProperty('scrollByPages')) {
        window.scrollByPages(2)
      } else if (window.hasOwnProperty('scrollBy')) {
        window.scrollBy(0, 1080)
      }
    }
    lst = [...document.querySelectorAll('div[aria-label=Notifications] div[role=row] div[role=button]')]
  }
};

// Create button to mark read with a click
const button = document.createElement("button");
button.classList.add("fb-gradually-mark-read.btn");
Object.assign(button.style, {
  position: "absolute",
  top: "6em",
  left: "50%",
  transform: "translateX(-50%)",
  "z-index": 99999,
});
button.innerHTML = "Mark all as read";
button.onclick = () => {
  Promise.resolve()
    .then(mark_read)
    .catch((e) => {
      alert(e);
    })
};

(() => {
  // Append button
  document.body.appendChild(button);
})();