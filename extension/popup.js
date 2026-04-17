// Popup script
document.addEventListener('DOMContentLoaded', () => {
  const lastCaptureEl = document.getElementById('lastCapture');
  const settingsBtn = document.getElementById('settings');

  // Get last capture time
  chrome.storage.local.get(['lastCapture'], (result) => {
    if (result.lastCapture) {
      lastCaptureEl.textContent = new Date(result.lastCapture).toLocaleString();
    }
  });

  settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/?id=' + chrome.runtime.id });
  });
});