// Wrap in IIFE to prevent redeclaration errors
(function() {
  const observer = new MutationObserver(() => {
    const unlockButton = document.getElementById('unlockButton');
    if (unlockButton) {
      observer.disconnect();
      
      unlockButton.addEventListener('click', () => {
        const password = document.getElementById('passwordInput').value;
        chrome.storage.local.get(['userPassword'], (result) => {
          const errorMsg = document.getElementById('errorMsg');
          if (password === result.userPassword) {
            document.querySelector('.lock-screen').remove();
          } else {
            errorMsg.textContent = 'Incorrect password!';
          }
        });
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Activity detection
  document.addEventListener('mousemove', () => {
    chrome.runtime.sendMessage({ type: 'userActivity' });
  });
})();