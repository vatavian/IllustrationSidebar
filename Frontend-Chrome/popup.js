// const urlInput = document.getElementById("url-input-field");
// const testApiButton = document.getElementById("test-api");
const runButton = document.getElementById("run");
const websitesInput = document.getElementById("websites-input-field");
const addSiteButton = document.getElementById("addsite");

const styleInput = document.getElementById("style-field");
const fullTextInput = document.getElementById("fulltext-field");
const testFullTextButton = document.getElementById("test-fulltext");

const promptInput = document.getElementById("prompt-field");
const testPromptButton = document.getElementById("test-prompt");
const imgElement = document.getElementById("generated-image");

const hideButton = document.getElementById("hide");

hideButton.addEventListener("click",() => {
    Array.from(document.getElementsByClassName("settings-container"))
      .forEach((element) => element.classList.toggle('is-hidden'));
})

chrome.storage.local.get(["websites", "styleText"], (result) => {
    // urlInput.value = result.apiURL || "";
    styleInput.value = result.styleText || "";
    websitesInput.value = result.websites || "scribblehub.com/read/\n";
    const sitesArray = websitesInput.value.split("\n");
    websitesInput.rows = sitesArray.length + 1
    websitesInput.cols = sitesArray.reduce((len, str) => { return Math.max(len, str.length) }, 25);
    addSiteButton.style.display = "none"
    chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
        if (tabs[0]?.url?.startsWith("http")) {
            const hostname = new URL(tabs[0].url).hostname;
            if (hostname && !websitesInput.value.includes(hostname)) {
                addSiteButton.innerText = "Add " + hostname;
                addSiteButton.removeAttribute("style");
                addSiteButton.addEventListener("click",() => {
                    addSiteButton.style.display = "none"
                    if (websitesInput.value.length > 0 && !websitesInput.value.endsWith("\n"))
                        websitesInput.value += "\n";
                    websitesInput.value += hostname;
                    chrome.storage.local.set({websites: websitesInput.value.trim()});
                });
            }
        }
    });
});

// testApiButton.addEventListener("click",() => {
//     chrome.tabs.create({url: urlInput.value, selected: true, active: true});
//     chrome.storage.local.set({
//         apiURL: urlInput.value.trim()
//     }); 
// })

runButton.addEventListener("click",() => {
    console.log("Running...")
    chrome.storage.local.set({
        // apiURL: urlInput.value.trim(),
        websites: websitesInput.value.trim(),
        activeTab: true,
    }); 
})

testFullTextButton.addEventListener("click",() => {
    promptInput.value = ""
    chrome.storage.local.set({ fullText: fullTextInput.value, styleText: styleInput.value }); 
})

testPromptButton.addEventListener("click",() => {
    imgElement.src = "";
    chrome.storage.local.set({ promptText: null });
    chrome.storage.local.set({ promptText: promptInput.value.trim() });
})

const setImgFromPrompt = () => {
    const escapedText = encodeURIComponent(promptInput.value.replaceAll(' ','_'))
    const imgURL = new URL("https://image.pollinations.ai/prompt/" + escapedText);
    imgURL.searchParams.append("nologo", "true");
    // console.log(imgURL, "toString:", imgURL.toString());
    imgElement.src = imgURL;
    console.log("imgElement.src:", imgElement.src);
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
        console.log('popupStorageListener', JSON.stringify(changes).substring(0,80));
        if (changes?.fullText?.newValue) {
            imgElement.src = "";
            fullTextInput.value = changes.fullText.newValue;
        }
        if (changes?.promptText?.newValue) {
            promptInput.value = changes.promptText.newValue;
            setImgFromPrompt();
        }
    }
});

chrome.tabs.reload();
