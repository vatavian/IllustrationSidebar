import { aiStorageListener } from './ai.js';
var websites = [];

const setWebsitesFromString = ((str) => {
    if (str) websites = str.split(/[\n,\s+]/)
});

chrome.storage.local.get("websites", (result) => {
    setWebsitesFromString(result.websites);
});

chrome.runtime.onInstalled.addListener(({reason}) => {
    if (reason === 'install') {
        chrome.tabs.create({ url: "popup.html" });
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
    else
        console.log("Not injecting in tab", tab.url, "websites:", websites);
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

async function backgroundStorageListener(changes, area) {
    if (area === 'local') {
        // console.log('backgroundStorageListener', JSON.stringify(changes));
        if (changes?.websites?.newValue) {
            setWebsitesFromString(changes?.websites?.newValue);
            injectInActiveTab();
        }
        if (changes?.activeTab?.newValue) {
            console.log('backgroundStorageListener: activeTab');
            injectInActiveTab();
            chrome.storage.local.set({ activeTab: false }); 
        }
    }
};

chrome.storage.onChanged.addListener(backgroundStorageListener);
chrome.storage.onChanged.addListener(aiStorageListener);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("tabs.onUpdated", JSON.stringify(changeInfo));
    injectInActiveTab();
});
// chrome.tabs.onCreated.addListener((tab) => {
//     console.log("tabs.onCreated");
//     injectInActiveTab();
// });

// Open the side panel when extension toolbar icon is clicked
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
