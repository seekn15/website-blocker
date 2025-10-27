const RULESET_ID = 'ruleset_1';
const TEN_MINUTES_IN_MS = 10 * 60 * 1000;
const ALARM_NAME = 'reenable_blocking';

// 1. Listen for the "disable_blocking" message from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'disable_blocking') {
    disableBlocking();
    sendResponse({ success: true });
  }
});

// 2. Listen for the 10-minute alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    enableBlocking();
  }
});

function disableBlocking() {
  console.log('Disabling blocking for 10 minutes...');
  
  // Disable the ruleset
  chrome.declarativeNetRequest.updateEnabledRulesets({
    disableRulesetIds: [RULESET_ID]
  });

  // Save the "disabled until" time in the "logbook" (storage)
  const endTime = Date.now() + TEN_MINUTES_IN_MS;
  chrome.storage.local.set({ blocking_disabled_until: endTime });

  // Create the 10-minute "kitchen timer" (alarm)
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: 10
  });
}

function enableBlocking() {
  console.log('Re-enabling blocking...');

  // Enable the ruleset
  chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: [RULESET_ID]
  });

  // Clear the "logbook"
  chrome.storage.local.remove('blocking_disabled_until');
}

// As a safety check, re-enable blocking every time the browser starts
chrome.runtime.onStartup.addListener(() => {
  enableBlocking();
});
