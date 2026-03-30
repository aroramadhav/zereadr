// Listen for keyboard shortcut command to open reader directly
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_quicread_reader') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      // Extract text from the current page
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          let text = '';
          if (document.contentType === 'application/pdf') {
            text = 'PDF extraction not supported in this MVP.';
          } else {
            text = Array.from(document.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, div'))
              .map(el => el.innerText)
              .filter(Boolean)
              .join(' ');
          }
          chrome.runtime.sendMessage({ action: 'quicread_text', text });
        }
      });
      // Open the RSVP reader popup window
      chrome.windows.create({
        url: chrome.runtime.getURL('reader.html'),
        type: 'popup',
        width: 600,
        height: 300
      });
    });
  }
});
// QuicRead background service worker
let lastExtractedText = '';

chrome.runtime.onInstalled.addListener(() => {
  // Future: setup, analytics, etc.
});

// Listen for extracted text from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'quicread_text') {
    lastExtractedText = msg.text;
  }
  if (msg.action === 'quicread_request_text') {
    chrome.runtime.sendMessage({ action: 'quicread_text', text: lastExtractedText });
  }
});
