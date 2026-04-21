# CivicConnect - AI Election Assistant

CivicConnect is a production-grade, AI-powered Election Assistant web application designed to guide users step-by-step through the voting process.

## Features
- **Conversational Chatbot**: Intent-based NLP chatbot ready for Dialogflow integration.
- **Step-by-step Guidance**: Interactive checklist guiding users from registration to voting.
- **Polling Booth Finder**: Google Maps integration to locate polling booths and get directions.
- **Voting Reminder**: One-click Google Calendar event creation.
- **Multi-language Support**: Integration with Google Translate for inclusive access.
- **User Personalization**: Firebase Authentication and Firestore to save user progress.

## Architecture
The project is built using Vanilla Web Technologies (HTML, CSS, JavaScript) for maximum performance and minimum bundle size. It uses CDN imports for external libraries (Firebase, Google Maps).

- `index.html`: The semantic structure of the UI.
- `styles.css`: Material Design inspired CSS with CSS variables for theming.
- `app.js`: Core application logic, chatbot interactions, and multi-language support.
- `firebase.js`: Firebase initialization, Authentication, and Firestore interactions.
- `maps.js`: Google Maps API initialization and location-based features.
- `config.sample.js`: Template for environment variables and API keys.

## Setup Instructions

### 1. Configure API Keys
Copy `config.sample.js` to `config.js`.
```bash
cp config.sample.js config.js
```
Open `config.js` and add your API keys:
- **Firebase**: Create a project at [Firebase Console](https://console.firebase.google.com/), enable Authentication (Google Provider) and Firestore. Copy the web config.
- **Google Maps**: Go to [Google Cloud Console](https://console.cloud.google.com/), create a project, and enable:
  - Maps JavaScript API
  - Places API
  - Directions API
- **Google Translate (Optional)**: Enable Cloud Translation API if using dynamic translation.
- **Dialogflow (Optional)**: Set up a Dialogflow ES/CX agent for the chatbot backend.

### 2. Include Google Maps Script
In `index.html`, ensure the Google Maps script tag includes your API key from your config or backend. For local testing, you can inject it dynamically in `maps.js` or hardcode it locally (do not commit it).

### 3. Run Locally
Because this app uses ES modules or fetches external resources, you should run it through a local web server (opening the file directly via `file://` may cause CORS or module issues).

Using Python:
```bash
python -m http.server 8000
```
Or using Node.js (`serve`):
```bash
npx serve .
```

Visit `http://localhost:8000` or the provided local URL in your browser.

## Security Notes
- Never commit `config.js` with real API keys to a public repository.
- Use Firebase Security Rules to protect user data in Firestore.
- Restrict your Google Maps API key to your specific domain or IP address in the Google Cloud Console.
