const chatInput = document.getElementById('chat-input');
const chatForm = document.getElementById('chat-form');
const chatContainer = document.querySelector('.chat-container');
const themeButton = document.getElementById('theme-btn');
const deleteButton = document.getElementById('delete-btn');

let isGenerating = false;
const API_KEY = 'API-KEY'; // Replace with your actual API key

const defaultHTML = `
    <div class="default-text">
        <h1>Chat GPT Clone</h1>
        <p>Start a conversation with your AI assistant<br>Your chat history will appear here</p>
    </div>`;

// Initialize app
const init = () => {
    // Store initial default HTML
    if (!localStorage.getItem('chats')) {
        chatContainer.innerHTML = defaultHTML;
    }
    loadHistory();
    setupEventListeners();
    adjustInputHeight();
};

// Load chat history from localStorage
const loadHistory = () => {
    const theme = localStorage.getItem('theme') || 'dark';
    const chats = localStorage.getItem('chats');
    
    document.body.classList.toggle('light-mode', theme === 'light');
    themeButton.querySelector('span').textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
    
    if (chats) {
        chatContainer.innerHTML = chats;
        scrollToBottom();
    }
};

// Event listeners setup
const setupEventListeners = () => {
    chatForm.addEventListener('submit', handleSubmit);
    deleteButton.addEventListener('click', confirmClearHistory);
    themeButton.addEventListener('click', toggleTheme);
    chatInput.addEventListener('input', adjustInputHeight);
    chatInput.addEventListener('keydown', handleKeyDown);
};

// Handle form submission
const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGenerating || !chatInput.value.trim()) return;
    
    const userMessage = chatInput.value.trim();
    chatInput.value = '';
    adjustInputHeight();
    
    appendMessage(userMessage, 'outgoing');
    showTypingIndicator();
    
    try {
        isGenerating = true;
        const response = await generateResponse(userMessage);
        removeTypingIndicator();
        appendMessage(response, 'incoming');
    } catch (error) {
        removeTypingIndicator();
        showError(error.message);
    } finally {
        isGenerating = false;
        saveHistory();
    }
};

// Generate AI response
const generateResponse = async (prompt) => {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
};

// Append new message to chat
const appendMessage = (content, type) => {
    const message = document.createElement('div');
    message.className = `chat ${type}`;
    message.innerHTML = `
        <div class="chat-content">
            <div class="chat-details">
                <img src="img/${type === 'outgoing' ? 'user' : 'chatbot'}.jpg" alt="${type} avatar">
                <p>${content}</p>
                ${type === 'incoming' ? 
                    `<span class="material-symbols-rounded copy-btn" onclick="copyText(this)">content_copy</span>` : ''}
            </div>
        </div>
    `;
    
    chatContainer.querySelector('.default-text')?.remove();
    chatContainer.appendChild(message);
    scrollToBottom();
};

// Show typing indicator
const showTypingIndicator = () => {
    const typing = document.createElement('div');
    typing.className = 'chat incoming';
    typing.innerHTML = `
        <div class="chat-content">
            <div class="chat-details">
                <img src="img/chatbot.jpg" alt="Typing indicator">
                <div class="typing-animation">
                    <div class="typing-dot"></div>
                    <div class="typing-dot" style="animation-delay: 0.2s"></div>
                    <div class="typing-dot" style="animation-delay: 0.4s"></div>
                </div>
            </div>
        </div>
    `;
    chatContainer.appendChild(typing);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    setTimeout(scrollToBottom, 50);
};

// Remove typing indicator
const removeTypingIndicator = () => {
    const typingIndicators = document.querySelectorAll('.chat.incoming .typing-animation');
    typingIndicators.forEach(indicator => indicator.parentElement.remove());
};

// Error handling
const showError = (message) => {
    const error = document.createElement('div');
    error.className = 'chat incoming error';
    error.innerHTML = `
        <div class="chat-content">
            <div class="chat-details">
                <img src="img/chatbot.jpg" alt="Error indicator">
                <p>⚠️ ${message}</p>
            </div>
        </div>
    `;
    chatContainer.appendChild(error);
    scrollToBottom();
};

// Scroll management
const scrollToBottom = () => {
    // Use multiple methods for maximum compatibility
    requestAnimationFrame(() => {
        // Method 1: Native scrollTo
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });
        
        // Method 2: Scroll to last element
        const lastMessage = chatContainer.lastElementChild;
        if (lastMessage) {
            lastMessage.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
        
        // Method 3: Direct scroll assignment
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
};

// Utility functions
const adjustInputHeight = () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 200)}px`;
};

const toggleTheme = () => {
    document.body.classList.toggle('light-mode');
    const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    themeButton.querySelector('span').textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
    localStorage.setItem('theme', theme);
};

const confirmClearHistory = () => {
    if (confirm('Clear all chat history?')) {
        localStorage.removeItem('chats');
        chatContainer.innerHTML = defaultHTML;
        scrollToBottom();
        // Optional: Force reload to reset all states
        // window.location.reload();
    }
};

const saveHistory = () => {
    localStorage.setItem('chats', chatContainer.innerHTML);
};

const copyText = (button) => {
    const text = button.previousElementSibling.textContent;
    navigator.clipboard.writeText(text).then(() => {
        button.textContent = 'done';
        setTimeout(() => button.textContent = 'content_copy', 2000);
    });
};

const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.requestSubmit();
    }
};

// Initialize the application
init();

