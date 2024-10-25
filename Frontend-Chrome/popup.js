const urlInput = document.getElementById("url-input-field");
const runButton = document.getElementById("run");
const testApiButton = document.getElementById("test-api");
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

chrome.storage.local.get(["apiURL", "websites"], (result) => {
    urlInput.value = result.apiURL || "";
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

testApiButton.addEventListener("click",() => {
    chrome.tabs.create({url: urlInput.value, selected: true, active: true});
    chrome.storage.local.set({
        apiURL: urlInput.value.trim()
    }); 
})

runButton.addEventListener("click",() => {
    chrome.storage.local.set({
        apiURL: urlInput.value.trim(),
        websites: websitesInput.value.trim(),
        activeTab: true,
    }); 
})

testFullTextButton.addEventListener("click",() => {
    fetchPromptFromFullText("https://text.pollinations.ai/openai", fullTextInput.value);
})

testPromptButton.addEventListener("click",() => {
    fetchImageFromPrompt();
})

async function fetchImageFromPrompt() {
    imgElement.src = "";
    const imgURL = new URL("https://image.pollinations.ai/prompt/" + encodeURIComponent(promptInput.value.replace(' ','_')));
    imgURL.searchParams.append("nologo", "true");
    imgElement.src = imgURL;
}

async function storageChangeListener(changes, area) {
    console.log('storage.onChanged', JSON.stringify(changes));
    if (area === 'local') {
        if (changes?.pageText?.newValue) {
            fullTextInput.value = changes.pageText.newValue.trim();
            fetchPromptFromFullText("https://text.pollinations.ai/openai", changes.pageText.newValue);
        }
    }
};

chrome.storage.onChanged.addListener(storageChangeListener);

async function fetchPromptFromFullText(url, fullText) {
    promptInput.value = "fetching..."
    console.log("Illustrator: fetching prompt:", url);
    var sysPrompt = "Each user prompt is a story that needs an illustration. You reply with a prompt for an image generator that will create the illustration";
    if (styleInput?.value?.length > 1)
        sysPrompt += ". Include the following style hints in the prompt: " + styleInput.value;

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "messages": [
            {
                "role": "system",
                "content": sysPrompt
            },
            {
                "role": "user",
                "content": fullText
            }
            ]
        })
    };
    console.log(options);
    return fetch(url, options)
        .then(response => {
            if(!response.ok)
                return response.text().then(text => {throw text})
            else
                return response.json()})
        .then(json => {
            if (json.choices) {
                console.log('Illustrator: choices', json.choices);
                const tagEndText = "**\n\n";
                const promptText = json.choices[0].message.content
                const unnecessaryTagEnd = promptText.indexOf(tagEndText);
                if (unnecessaryTagEnd > 0 && unnecessaryTagEnd < 80)
                    promptInput.value = promptText.substring(unnecessaryTagEnd + tagEndText.length);
                else
                    promptInput.value = promptText;
                fetchImageFromPrompt();
            } else {
                promptInput.value = JSON.stringify(json);
            }
        })
        .catch(error => {
            console.log('Illustrator: fetch:', error);
        });
}
