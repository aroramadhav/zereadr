// QuicRead content script: detects PDFs and docs, injects overlay

(function () {
  const isPDF =
    window.location.pathname.toLowerCase().endsWith(".pdf") ||
    (function () {
      // Listen for request to extract text
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'quicread_text_request') {
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
    })();