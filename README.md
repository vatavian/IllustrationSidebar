# Illustration Sidebar Browser Extension
AI-generated illustrations appear in the web browser sidebar based on the web page you are reading.

I read a lot of stories on the web.
I enjoy having illustrations when I read, but most stories do not have any.
With this browser extension, I will always have an illustration to accompany any web page.

Briefly, this works in these steps:
1. Get the important text from the active tab (with Readability.textContent.)
2. Send to the text chat AI this system prompt:
   "Each user prompt is a story that needs an illustration. You reply with a prompt for an image generator that will create the illustration"
   (and, if specified, "Include the following style hints in the prompt: ...".)
   The active tab text is sent as the user prompt.
3. An image generator prompt is returned and is submitted to the image generator API.
4. The returned image is displayed in the sidebar.

This project uses Readability.js from https://github.com/mozilla/readability/
See the LICENSE file for more information.
I welcome any help with how to reference Readability at runtime from within a browser extension instead of redistributing it.

The AI used is https://pollinations.ai/ which is easy and free and does not need API keys.
Adding support for other sites is not my top priority. Please feel free to make a PR.

This is an early version I am still testing. It is not released or packaged yet.
If you are comfortable with "Load Unpacked" feel free to try it out.
I am testing on Chrome (and Brave which uses Chrome extensions.) Adapting it to Firefox or Safari will not be hard.

I welcome any suggestions in Issues.
