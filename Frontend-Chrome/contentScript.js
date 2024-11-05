'use strict';
// Readability.js must be injected before this script will work
var observer = null;

const runEventHandler = (event=null) => {
    // if (event) console.log('Illustrator: runEventHandler called with event', event);
    try {
        var documentClone = document.cloneNode(true);
        var article = new Readability(documentClone).parse();
        const fullText = article.textContent?.trim();
        console.log('Illustrator: text', fullText?.substring(0,40), '...', fullText?.substring(fullText.length-40));
        chrome.storage.local.set({
            fullText: fullText
        }); 
    } catch (err) {
        const errStr = err.toString();
        if (errStr.includes("Readability is not defined")) {
            console.log("Illustrator: Readability must be injected before contentScript.");
        } else if (errStr.includes("Extension context invalidated")) {
            console.log("Illustrator: Extension reloaded, stopping old version");
            observer?.disconnect();
            window.injectedIllustrator = undefined;
        } else {
            console.error("Illustrator error:", errStr);
        }
    }
}

if (window.injectedIllustrator !== 1) {
    window.injectedIllustrator = 1;
    console.log('Illustrator: Starting context script.');

    observer = new MutationObserver(runEventHandler);
    observer.observe(document.querySelector("body"), { subtree: true, childList: true });
};

runEventHandler();
console.log('Illustrator: Started context script in', window.location.href);
