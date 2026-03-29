// ==UserScript==
// @name         Google Docs - Default to View Mode upon document open (Avoid clutter and accidental edits)
// @namespace    https://github.com/Myst1cX/gdocs-view-mode
// @version      1.1
// @description  Automatically switch Google Docs to View Mode ("Read or print final document") when entering any document in Google Docs.
// @author       Myst1cX
// @match        https://docs.google.com/document/*
// @run-at       document-idle
// @grant        none
// @homepageURL  https://github.com/Myst1cX/gdocs-view-mode
// @supportURL   https://github.com/Myst1cX/gdocs-view-mode/issues
// @updateURL    https://raw.githubusercontent.com/Myst1cX/gdocs-view-mode/main/gdocs-view-mode.js
// @downloadURL  https://raw.githubusercontent.com/Myst1cX/gdocs-view-mode/main/gdocs-view-mode.js
// ==/UserScript==

/* ATTRIBUTION

This project is a fork of [jabielecki/firefox-gdocs-view](https://github.com/jabielecki/firefox-gdocs-view),
originally created by its respective author(s), and is licensed under the  
[GNU Affero General Public License v3.0](https://github.com/Myst1cX/gdocs-view-mode/blob/main/LICENSE)

*/

/* MODIFICATION (2026-03-29)

1 - Browser extension converted to a userscript by [Myst1cX/gdocs-view-mode](https://github.com/Myst1cX/gdocs-view-mode):
2 - Addition of the Spanish aria-label regex for the View mode (due to Google Docs being set to spanish on my end)
3 - Users may fork the script to add the aria-label regex specific to their Google Docs default site language.

*/


(function() {
    'use strict';

    console.log("gdocs-view-mode (userscript) waiting for menus to render:", window.location.href);

    function getByAriaLabelRegex(regex) {
        return Array.from(document.querySelectorAll('span[aria-label]'))
            .find(el => regex.test(el.getAttribute('aria-label')));
    }

    function findViewModeElement() {
        // English: "Read or print final document"
        // Spanish: "Leer o imprimir el documento final"
        const englishRegex = /Read or print final document/;
        const spanishRegex = /Leer o imprimir el documento final/;

        return (
            getByAriaLabelRegex(englishRegex) ||
            getByAriaLabelRegex(spanishRegex)
        );
    }

    function simulateMouseEvents(elem) {
        if (!elem) return;
        console.log("gdocs-view-mode (userscript) simulate mouse event on element:", elem);

        elem.dispatchEvent(new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
        elem.dispatchEvent(new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
        elem.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    }

    function tryActivateViewMode(context) {
        const subMenu = findViewModeElement();
        if (subMenu) {
            console.log(`gdocs-view-mode (userscript): found view-mode span (${context})`);
            simulateMouseEvents(subMenu);
            return true;
        } else {
            console.log(`gdocs-view-mode (userscript): target span not found (${context})`);
            return false;
        }
    }

    // Initial attempt after a delay
    setTimeout(() => {
        tryActivateViewMode("initial timeout");
    }, 2000);

    // Retry loop in case the menu renders later
    let attempts = 0;
    const maxAttempts = 5;
    const intervalMs = 1500;

    const intervalId = setInterval(() => {
        attempts++;
        const success = tryActivateViewMode(`retry attempt ${attempts}`);
        if (success || attempts >= maxAttempts) {
            if (!success) {
                console.log("gdocs-view-mode (userscript): giving up after", attempts, "attempts");
            }
            clearInterval(intervalId);
        }
    }, intervalMs);
})();
