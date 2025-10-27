// Get the two elements we'll be changing
const statusMessage = document.getElementById('status-message');
const disableButton = document.getElementById('disable-button');

// Function to update the button and text based on stored data
function updatePopup() {
  // Ask Chrome's storage for the 'blocking_disabled_until' value
  chrome.storage.local.get(['blocking_disabled_until'], (result) => {
    const endTime = result.blocking_disabled_until || 0;
    const now = Date.now();

    if (endTime > now) {
      // If the end time is in the future, it's disabled
      const remainingMinutes = Math.round((endTime - now) / 60000);
      statusMessage.textContent = `Blocking disabled for ${remainingMinutes} more minute(s).`;
      disableButton.disabled = true; // Disable the button
      disableButton.textContent = 'Disabled';
    } else {
      // Otherwise, it's enabled
      statusMessage.textContent = 'Blocking is active.';
      disableButton.disabled = false; // Enable the button
      disableButton.textContent = 'Disable for 10 minutes';
    }
  });
}

// Add a click event listener to the button
disableButton.addEventListener('click', () => {
  // Send a message to our background.js script (the "guard")
  chrome.runtime.sendMessage({ action: 'disable_blocking' }, () => {
    // After sending the message, update the popup immediately
    statusMessage.textContent = 'Blocking disabled for 10 minutes.';
    disableButton.disabled = true;
    disableButton.textContent = 'Disabled';
  });
});

// Run the update function as soon as the popup opens
updatePopup();
