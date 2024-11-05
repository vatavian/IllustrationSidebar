const PromptFromFullTextAPI_URL = "https://text.pollinations.ai/openai"

async function fetchPromptFromFullText(fullText, styleText) {
    console.log("Illustrator: fetching prompt with style", styleText);
    var sysPrompt = "Each user prompt is a story that needs an illustration. You reply with a prompt for an image generator that will create the illustration";
    if (styleText?.length > 1)
        sysPrompt += ". Include the following style hints in the prompt: " + styleText;

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
    return fetch(PromptFromFullTextAPI_URL, options)
        .then(response => {
            if(response.ok)
                return response.json()
            else
                return response.text().then(text => {throw text})})
        .then(json => {
            var promptText = ""
            if (json.choices) {
                // console.log('Illustrator: choices', json.choices);
                const tagEndText = "**";
                promptText = json.choices[0].message.content
                const unnecessaryTagEnd = promptText.lastIndexOf(tagEndText);
                if (unnecessaryTagEnd > 0 && unnecessaryTagEnd < 80)
                    promptText = promptText.substring(unnecessaryTagEnd + tagEndText.length).trim();
            } else {
                promptText = JSON.stringify(json);
            }
            chrome.storage.local.set({ promptText: promptText }); 
        })
        .catch(error => {
            console.log('Illustrator: fetch:', error);
        });
}

// async function fetchImageFromPrompt(promptText) {
//     console.log(imgURL,"toString:", imgURL.toString());
//     chrome.storage.local.set({ illustrationSrc: imgURL }); 
// }

export async function aiStorageListener(changes, area) {
    if (area === 'local') {
        console.log('aiStorageListener', JSON.stringify(changes).substring(0,80));
        var fullText = changes?.fullText?.newValue;
        var styleText = changes?.styleText?.newValue;
        // console.log('aiStorageListener:fullTextChange', fullText?.substring(0,40));
        // console.log('aiStorageListener:styleTextChange:', styleText?.substring(0,40));
        if (fullText || styleText) {
            if (!fullText) fullText = (await chrome.storage.local.get({fullText: null}))?.fullText || null;
            if (!styleText) styleText = (await chrome.storage.local.get({styleText: ""}))?.styleText || "";
            // console.log('aiStorageListener:fullText2:', fullText?.substring(0,40));
            // console.log('aiStorageListener:styleText2:', styleText?.substring(0,40));    
            if (fullText) fetchPromptFromFullText(fullText, styleText);
        }
        // if (changes?.promptText?.newValue) {
        //     fetchImageFromPrompt(changes.promptText.newValue);
        // }
    }
};
