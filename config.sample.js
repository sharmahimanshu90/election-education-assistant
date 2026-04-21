// config.sample.js
// Rename this file to config.js and add your actual API keys.
// Make sure to NEVER commit config.js to public version control.

const CONFIG = {
  // Firebase Configuration
  // Get this from your Firebase Project Settings
  FIREBASE: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  },

  // Google Maps Platform
  // Needs Maps JavaScript API, Places API, and Directions API enabled
  GOOGLE_MAPS_API_KEY: "YOUR_GOOGLE_MAPS_API_KEY",

  // Google Cloud Translation API (if using dynamic translate via API rather than simple widget)
  // Needs Cloud Translation API enabled
  GOOGLE_TRANSLATE_API_KEY: "YOUR_GOOGLE_TRANSLATE_API_KEY",

  // Dialogflow CX/ES Client Token (if integrating via client, or backend endpoint URL)
  // For production, use a backend endpoint to securely proxy Dialogflow requests.
  DIALOGFLOW: {
    projectId: "YOUR_DIALOGFLOW_PROJECT_ID",
    // Example endpoint if using a Cloud Function to handle Dialogflow requests
    backendEndpoint: "https://your-region-your-project.cloudfunctions.net/dialogflowGateway"
  }
};

// Export for module usage (if not using CDN global injection)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}
