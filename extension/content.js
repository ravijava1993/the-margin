// Content script for The Margin Clipper
// This file is kept minimal - main extraction happens via executeScript in popup.js
// This allows the extension to work without needing content script permissions on all sites

;(() => {
  // Listen for messages from popup if needed
  const chrome = window.chrome // Declare the chrome variable
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "ping") {
        sendResponse({ status: "ok" })
      }
      return true
    })
  }
})()
