// Content script to capture page data
function capturePageData() {
  const url = window.location.href;
  const title = document.title;
  const visibleText = getVisibleText();

  const data = {
    url: url,
    title: title,
    text: visibleText.substring(0, 1000), // Limit to 1000 chars for privacy
    timestamp: new Date().toISOString()
  };

  // Send to background script
  chrome.runtime.sendMessage({ action: 'captureData', data: data });
}

function getVisibleText() {
  // Get text from visible elements
  const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
  let text = '';
  for (let el of elements) {
    if (isElementVisible(el)) {
      text += el.textContent.trim() + ' ';
    }
  }
  return text;
}

function isElementVisible(el) {
  const rect = el.getBoundingClientRect();
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
}

// Capture on page load
capturePageData();

// Also capture on navigation (for SPAs)
let lastUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    capturePageData();
  }
}, 5000); // Check every 5 seconds