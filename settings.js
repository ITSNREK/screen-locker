document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.settings-form');
  const lockTimeInput = document.getElementById('lockTime');
  const passwordInput = document.getElementById('password');
  const saveButton = document.getElementById('saveSettings');
  const lockNowButton = document.getElementById('lockNow');

  // Create success indicator element
  const successIndicator = document.createElement('div');
  successIndicator.className = 'success-indicator';
  successIndicator.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
  form.appendChild(successIndicator);

  saveButton.addEventListener('click', () => {
    const lockTime = parseInt(lockTimeInput.value);
    const password = passwordInput.value;

    // Save settings to chrome.storage
    chrome.storage.local.set({
      lockTime: lockTime,
      userPassword: password
    }, () => {
      // Show success indicator
      successIndicator.classList.add('show');
      
      // Hide success indicator after animation
      setTimeout(() => {
        successIndicator.classList.remove('show');
      }, 2000);
    });
  });

  // Lock Now button functionality
  lockNowButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({type: 'lockNow'});
  });
});