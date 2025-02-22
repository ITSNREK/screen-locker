document.getElementById('lockNow').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'lockNow' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
    }
  });
});

document.getElementById('savePassword').addEventListener('click', () => {
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const passwordMessage = document.getElementById('passwordMessage');

  chrome.storage.local.get(['userPassword'], (result) => {
    if (!result.userPassword && !oldPassword) {
      // First time setting password
      if (newPassword) {
        chrome.storage.local.set({ userPassword: newPassword }, () => {
          passwordMessage.style.color = '#4CAF50';
          passwordMessage.textContent = 'Password set successfully!';
          setTimeout(() => {
            passwordMessage.textContent = '';
          }, 3000);
        });
      }
    } else if (oldPassword === result.userPassword) {
      // Correct old password
      if (newPassword) {
        chrome.storage.local.set({ userPassword: newPassword }, () => {
          passwordMessage.style.color = '#4CAF50';
          passwordMessage.textContent = 'Password updated successfully!';
          setTimeout(() => {
            passwordMessage.textContent = '';
          }, 3000);
        });
      }
    } else {
      // Incorrect old password
      passwordMessage.style.color = '#ff4444';
      passwordMessage.textContent = 'Current password is incorrect!';
    }
  });
});