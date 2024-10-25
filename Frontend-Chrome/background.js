var websites = [];

const setWebsitesFromString = ((str) => {
    if (str) websites = str.split(/[\n,\s+]/)
});

chrome.runtime.onInstalled.addListener(({reason}) => {
    if (reason === 'install') {
    chrome.tabs.create({
        url: "popup.html"
    });
}
});

const injectContent = (async (tab) => {
    if (tab?.url?.startsWith("http") && websites.some(host => tab.url.includes(host)))
        try {
            console.log("Injecting in tab", tab.url);
            const target = { tabId: tab.id };
            await chrome.scripting.executeScript({
                target,
                injectImmediately: true,
                files: ['Readability.js']
            });
            chrome.scripting.executeScript({
                target,
                files: ["contentScript.js"]
            })
        } catch(e1) {
            console.log('Illustrator: Unable to inject in', tab, e1);
        }
});

const injectInActiveTab = (() => {
    chrome.tabs.query({
        "currentWindow": true,
        "status": "complete",
        "active": true,
        "windowType": "normal"
    }, (tabs) => {
        injectContent(tabs[0]);
    })
})

async function storageChangeListener(changes, area) {
    if (area === 'local') {
        // console.log('storage.onChanged', JSON.stringify(changes));
        if (changes?.websites?.newValue) {
            setWebsitesFromString(changes?.websites?.newValue);
            injectInActiveTab();
        }
        if (changes?.activeTab?.newValue) {
            injectInActiveTab();
            chrome.storage.local.set({ activeTab: false }); 
        }
    }
};

chrome.storage.onChanged.addListener(storageChangeListener);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("tabs.onUpdated", JSON.stringify(changeInfo));
    injectInActiveTab();
});
// chrome.tabs.onCreated.addListener((tab) => {
//     console.log("tabs.onCreated");
//     injectInActiveTab();
// });

async function initWebsitesFromStorage() {
    return chrome.storage.local.get("websites", (result) => {
        setWebsitesFromString(result.websites);
    });
};

initWebsitesFromStorage();
