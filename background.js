// Background Service Worker (Manifest V3)
// Manages inactivity timer and screen locking

let inactivityTimer;
const DEFAULT_LOCK_TIME = 5; // Minutes until auto-lock

// ======================
// Core Functions
// ======================

async function lockAllTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      // Skip Chrome internal pages
      if (tab.url?.startsWith('chrome://')) continue;

      try {
        // Inject the lock screen UI and logic
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Create lock screen container
            const lockScreen = document.createElement('div');
            lockScreen.className = 'lock-screen';
            lockScreen.innerHTML = `
              <h1>🔒 Session Locked</h1>
              <input type="password" id="passwordInput" placeholder="Enter Password">
              <button id="unlockButton">Unlock</button>
              <p id="errorMsg" class="error"></p>
            `;

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
              .lock-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999999;
                font-family: Arial, sans-serif;
              }
              .lock-screen input, .lock-screen button {
                padding: 12px;
                margin: 10px;
                width: 250px;
                border: none;
                border-radius: 4px;
              }
              .lock-screen button {
                background: #007bff;
                color: white;
                cursor: pointer;
              }
              .lock-screen .error {
                color: #ff4444;
                font-size: 14px;
              }
            `;

            document.head.appendChild(style);
            document.body.appendChild(lockScreen);

            // Add unlock functionality
            const unlockButton = document.getElementById('unlockButton');
            unlockButton.addEventListener('click', () => {
              const password = document.getElementById('passwordInput').value;
              chrome.storage.local.get(['userPassword'], (result) => {
                const errorMsg = document.getElementById('errorMsg');
                if (password === result.userPassword) {
                  lockScreen.remove();
                  style.remove();
                } else {
                  errorMsg.textContent = 'Incorrect password!';
                }
              });
            });

            // Activity detection
            document.addEventListener('mousemove', () => {
              chrome.runtime.sendMessage({ type: 'userActivity' });
            });
          }
        });
      } catch (error) {
        console.error(`Tab ${tab.id} error:`, error.message);
      }
    }
  } catch (error) {
    console.error('Locking failed:', error.message);
  }
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(lockAllTabs, DEFAULT_LOCK_TIME * 60 * 1000);
}

// ======================
// Event Listeners
// ======================

// Manual lock trigger from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'lockNow') {
    lockAllTabs();
    resetInactivityTimer(); // Restart timer after manual lock
  }
});

// User activity detection
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'userActivity') {
    resetInactivityTimer();
  }
});

// ======================
// Service Worker Management
// ======================

// Keep service worker alive
chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(() => {});

// Initial setup
chrome.runtime.onStartup.addListener(() => {
  resetInactivityTimer();
});

// Start timer when extension loads
resetInactivityTimer();