'use strict';
// Readability.js must be injected before this script will work
if (window.injectedIllustrator !== 1) {
    window.injectedIllustrator = 1;
    console.log('Illustrator: Starting context script.');

    const runEventHandler = (event=null) => {
        // if (event) console.log('Illustrator: runEventHandler called with event', event);
        try {
            var documentClone = document.cloneNode(true);
            var article = new Readability(documentClone).parse();
            const pageText = article.textContent;
            console.log('Illustrator: text', pageText?.substring(0,40), '...', pageText?.substring(pageText.length-40));
            chrome.storage.local.set({
                pageText: pageText
            }); 
        } catch (err) {
            if (err.toString().includes("Extension context invalidated")) {
                console.log("Illustrator: Extension reloaded, stopping old version");
                window.injectedIllustrator = undefined;
                observer?.disconnect();
            } else {
                console.error("Illustrator:", err);
            }
        }
    }

    runEventHandler();

    const observer = new MutationObserver(runEventHandler);
    observer.observe(document.querySelector("body"), { subtree: true, childList: true });
};
