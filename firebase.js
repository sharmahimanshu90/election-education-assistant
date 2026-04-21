// firebase.js
// Handles Firebase Authentication and Firestore operations.
// Includes mock functionality if Firebase is not configured.

let auth;
let db;
let isFirebaseConfigured = false;
let currentUser = null;

// Initialize Firebase if keys are present
if (typeof CONFIG !== 'undefined' && CONFIG.FIREBASE && CONFIG.FIREBASE.apiKey !== "YOUR_FIREBASE_API_KEY") {
    try {
        firebase.initializeApp(CONFIG.FIREBASE);
        auth = firebase.auth();
        db = firebase.firestore();
        isFirebaseConfigured = true;
        console.log("Firebase initialized successfully.");
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
} else {
    console.warn("Firebase config not found or using default keys. Using Mock Authentication.");
}

const FirebaseAuth = {
    signIn: async () => {
        if (isFirebaseConfigured) {
            const provider = new firebase.auth.GoogleAuthProvider();
            try {
                const result = await auth.signInWithPopup(provider);
                currentUser = result.user;
                return currentUser;
            } catch (error) {
                console.error("Sign in failed", error);
                throw error;
            }
        } else {
            // Mock Sign In for demo purposes
            return new Promise(resolve => {
                setTimeout(() => {
                    currentUser = {
                        uid: "mock-user-123",
                        displayName: "Citizen Voter",
                        email: "voter@example.com"
                    };
                    resolve(currentUser);
                }, 500); // simulate network delay
            });
        }
    },

    signOut: async () => {
        if (isFirebaseConfigured) {
            await auth.signOut();
            currentUser = null;
        } else {
            currentUser = null;
            return Promise.resolve();
        }
    },

    onAuthStateChanged: (callback) => {
        if (isFirebaseConfigured) {
            auth.onAuthStateChanged(user => {
                currentUser = user;
                callback(user);
            });
        } else {
            // Trigger initially with null
            callback(null);
            
            // In mock mode, we manually trigger UI updates in app.js
        }
    },
    
    getCurrentUser: () => currentUser
};

const FirebaseDB = {
    saveUserProgress: async (progressData) => {
        if (!currentUser) return;

        if (isFirebaseConfigured) {
            try {
                await db.collection("users").doc(currentUser.uid).set({
                    checklist: progressData,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error("Error saving progress", error);
            }
        } else {
            // Mock saving to local storage
            localStorage.setItem(`election_progress_${currentUser.uid}`, JSON.stringify(progressData));
            console.log("Progress saved locally (Mock Firebase).");
        }
    },

    getUserProgress: async () => {
        if (!currentUser) return null;

        if (isFirebaseConfigured) {
            try {
                const doc = await db.collection("users").doc(currentUser.uid).get();
                if (doc.exists) {
                    return doc.data().checklist;
                }
                return null;
            } catch (error) {
                console.error("Error getting progress", error);
                return null;
            }
        } else {
            // Mock getting from local storage
            const data = localStorage.getItem(`election_progress_${currentUser.uid}`);
            return data ? JSON.parse(data) : null;
        }
    }
};

window.FirebaseAuth = FirebaseAuth;
window.FirebaseDB = FirebaseDB;
