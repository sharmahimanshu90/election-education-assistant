// app.js
// Core Application Logic

document.addEventListener('DOMContentLoaded', () => {
    
    // --- UI Elements ---
    const authBtn = document.getElementById('auth-btn');
    const mainSignInBtn = document.getElementById('main-signin-btn');
    const welcomeSection = document.getElementById('welcome-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userGreeting = document.getElementById('user-greeting');
    const progressBar = document.getElementById('progress-bar');
    
    // Actions
    const actionMap = document.getElementById('action-map');
    const actionReminder = document.getElementById('action-reminder');
    const closeMapBtn = document.getElementById('close-map-btn');
    const mapSection = document.getElementById('map-section');
    
    // Chatbot
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatHeader = document.getElementById('chat-header');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');

    // --- Authentication Flow ---
    const updateAuthUI = (user) => {
        if (user) {
            welcomeSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            authBtn.textContent = 'Sign Out';
            userGreeting.textContent = `Hello, ${user.displayName || 'Voter'}!`;
            loadUserProgress();
        } else {
            welcomeSection.classList.remove('hidden');
            dashboardSection.classList.add('hidden');
            authBtn.textContent = 'Sign In';
            mapSection.classList.add('hidden');
            resetChecklist();
        }
    };

    const handleAuthClick = async () => {
        const user = window.FirebaseAuth.getCurrentUser();
        if (user) {
            await window.FirebaseAuth.signOut();
        } else {
            try {
                authBtn.disabled = true;
                if(mainSignInBtn) mainSignInBtn.disabled = true;
                await window.FirebaseAuth.signIn();
            } catch (error) {
                alert("Sign in failed. Please try again.");
            } finally {
                authBtn.disabled = false;
                if(mainSignInBtn) mainSignInBtn.disabled = false;
            }
        }
    };

    authBtn.addEventListener('click', handleAuthClick);
    if(mainSignInBtn) mainSignInBtn.addEventListener('click', handleAuthClick);

    // Initialize Auth Listener
    window.FirebaseAuth.onAuthStateChanged(updateAuthUI);

    // --- Checklist & Progress ---
    const checkboxes = document.querySelectorAll('.custom-checkbox input[type="checkbox"]');
    
    const updateProgress = () => {
        const total = checkboxes.length;
        const checked = document.querySelectorAll('.custom-checkbox input[type="checkbox"]:checked').length;
        const percentage = (checked / total) * 100;
        progressBar.style.width = `${percentage}%`;

        // Style completed items
        checkboxes.forEach(cb => {
            const item = cb.closest('.check-item');
            if (cb.checked) {
                item.classList.add('completed');
            } else {
                item.classList.remove('completed');
            }
        });

        // Save progress if logged in
        if (window.FirebaseAuth.getCurrentUser()) {
            const progressData = Array.from(checkboxes).map(cb => cb.checked);
            window.FirebaseDB.saveUserProgress(progressData);
        }
    };

    const loadUserProgress = async () => {
        const data = await window.FirebaseDB.getUserProgress();
        if (data && Array.isArray(data)) {
            checkboxes.forEach((cb, index) => {
                cb.checked = data[index] === true;
            });
            updateProgress();
        }
    };

    const resetChecklist = () => {
        checkboxes.forEach(cb => cb.checked = false);
        updateProgress();
    };

    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateProgress);
    });

    // Checklist Action Buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            if (action === 'check_eligibility') {
                openChatbot("Am I eligible to vote?");
            } else if (action === 'find_booth') {
                actionMap.click();
            }
        });
    });

    // --- Actions ---
    actionMap.addEventListener('click', () => {
        if (window.MapsManager) {
            window.MapsManager.findNearestBooth();
        } else {
            alert("Maps module not loaded.");
        }
    });

    closeMapBtn.addEventListener('click', () => {
        mapSection.classList.add('hidden');
    });

    actionReminder.addEventListener('click', () => {
        // Create Google Calendar Event Link
        // Assuming upcoming election date (mocked for demo)
        const eventTitle = encodeURIComponent("Election Day - Vote!");
        const eventDetails = encodeURIComponent("Don't forget to cast your vote today. Find your polling booth using CivicConnect.");
        const eventLocation = encodeURIComponent("Your Local Polling Booth");
        const startDate = "20241105T080000Z"; // Example date: Nov 5, 2024 8AM UTC
        const endDate = "20241105T180000Z";   // Example date: Nov 5, 2024 6PM UTC
        
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startDate}/${endDate}&details=${eventDetails}&location=${eventLocation}`;
        window.open(calendarUrl, '_blank');
    });


    // --- Chatbot Logic ---
    const toggleChatbot = () => {
        chatbotContainer.classList.toggle('closed');
        if (!chatbotContainer.classList.contains('closed')) {
            chatInput.focus();
        }
    };

    const openChatbot = (initialMessage = null) => {
        chatbotContainer.classList.remove('closed');
        if (initialMessage) {
            chatInput.value = initialMessage;
            handleSendMessage();
        } else {
            chatInput.focus();
        }
    };

    chatToggleBtn.addEventListener('click', toggleChatbot);
    chatHeader.addEventListener('click', (e) => {
        if (e.target !== chatToggleBtn && chatbotContainer.classList.contains('closed')) {
            toggleChatbot();
        }
    });

    const addMessage = (text, sender, isHtml = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message fade-in`;
        if (isHtml) {
            msgDiv.innerHTML = text;
        } else {
            msgDiv.textContent = text;
        }
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // --- Mock Dialogflow Responses ---
    // In production, this function would make a fetch() request to your backend endpoint,
    // which securely authenticates with Google Cloud and calls the Dialogflow API.
    const getBotResponse = async (userMessage) => {
        const lowerMsg = userMessage.toLowerCase();
        
        // Add artificial delay to simulate network request
        await new Promise(r => setTimeout(r, 600));

        if (lowerMsg.includes("eligible") || lowerMsg.includes("eligibility") || lowerMsg.includes("age")) {
            return `
                <p>To be eligible to vote, you generally must be:</p>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    <li>A citizen of the country.</li>
                    <li>At least 18 years old on the qualifying date.</li>
                    <li>Enrolled in the electoral roll.</li>
                </ul>
                <p style="margin-top: 10px;">Would you like me to help you find your polling booth?</p>
                <div class="quick-replies" style="margin-top:10px;">
                    <button class="quick-reply-btn" onclick="document.getElementById('chat-input').value='Find my booth'; document.getElementById('chat-send-btn').click();">Yes, find booth</button>
                </div>
            `;
        } else if (lowerMsg.includes("booth") || lowerMsg.includes("where") || lowerMsg.includes("location")) {
             // Directly trigger map action if they ask where to vote
             setTimeout(() => {
                 if(window.FirebaseAuth.getCurrentUser()){
                     actionMap.click();
                 } else {
                     alert("Please sign in to find your polling booth.");
                 }
             }, 1000);
             return "I can help with that! I'm opening the map to find your nearest polling booth based on your location.";
        } else if (lowerMsg.includes("register") || lowerMsg.includes("enroll")) {
            return "You can register to vote online through the National Voters' Service Portal or by filling out Form 6 at your local Electoral Registration Office. Have you registered yet?";
        } else if (lowerMsg.includes("thank")) {
            return "You're very welcome! Let me know if you need anything else. Don't forget to set a calendar reminder!";
        } else {
            return "I'm your AI Election Assistant. I can help you check your eligibility, find your polling booth, or learn how to register. What would you like to know?";
        }
    };

    const handleSendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // User message
        addMessage(message, 'user');
        chatInput.value = '';
        
        // Show typing indicator
        const typingId = 'typing-' + Date.now();
        const typingMsg = document.createElement('div');
        typingMsg.className = 'message bot-message';
        typingMsg.id = typingId;
        typingMsg.textContent = 'Typing...';
        chatMessages.appendChild(typingMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Get bot response
        const responseHtml = await getBotResponse(message);

        // Remove typing indicator and add real response
        document.getElementById(typingId).remove();
        addMessage(responseHtml, 'bot', true);
    };

    chatSendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });

    // Handle dynamically added quick reply buttons in chat
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-reply-btn') && e.target.hasAttribute('data-intent')) {
            chatInput.value = e.target.getAttribute('data-intent');
            handleSendMessage();
        }
    });

});

// Google Translate Initialization Callback (Called globally by Google's script)
window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,bn,te,mr,ta,ur,gu,kn,ml,pa', // Major regional languages
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
};
