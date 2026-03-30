// QuicRead popup.js: opens RSVP reader popup and extracts text from current page
const startBtn = document.getElementById('startBtn');
const wpmSlider = document.getElementById('wpmSlider');
const wpmValue = document.getElementById('wpmValue');
const settingsBtn = document.getElementById('settingsBtn');

wpmSlider.addEventListener('input', () => {
  wpmValue.textContent = wpmSlider.value;
  chrome.storage.local.set({ quicread_wpm: Number(wpmSlider.value) });
});

startBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        // Try to extract all visible text from the page
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
    // Open a new popup window for RSVP reader
    chrome.windows.create({
      url: chrome.runtime.getURL('reader.html'),
      type: 'popup',
      width: 600,
      height: 300
    });
  });
});

settingsBtn.addEventListener('click', () => {
  // TODO: Open settings modal in reader window
});

// Load WPM from storage
chrome.storage.local.get(['quicread_wpm'], (result) => {
  if (result.quicread_wpm) {
    wpmSlider.value = result.quicread_wpm;
    wpmValue.textContent = result.quicread_wpm;
  }
});
