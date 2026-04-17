// Background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureData') {
    sendToBackend(request.data);
  }
});

async function sendToBackend(data) {
  try {
    // Get user token from storage (assuming Firebase Auth)
    const token = await getUserToken();
    if (!token) return; // Not logged in

    const response = await fetch('http://localhost:5000/api/content/capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok && (result.category === 'harmful' || result.category === 'explicit')) {
      // Show browser notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png', // Add an icon
        title: 'Content Alert',
        message: `Detected ${result.category} content. Confidence: ${(result.confidence * 100).toFixed(0)}%`
      });
    }
  } catch (error) {
    console.error('Error sending data:', error);
  }
}

async function getUserToken() {
  // Assuming Firebase Auth, get token from chrome.storage
  return new Promise((resolve) => {
    chrome.storage.local.get(['userToken'], (result) => {
      resolve(result.userToken);
    });
  });
}