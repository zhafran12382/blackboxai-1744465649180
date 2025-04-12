let socket;
let isAdmin = false;
let currentUsername = '';

// DOM Elements
const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const messagesContainer = document.getElementById('messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');

// Login handling
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username) {
        loginError.textContent = 'Please enter a username';
        return;
    }

    socket = io();

    socket.on('connect', () => {
        socket.emit('join', { 
            username: username,
            password: password,
            role: password === 'admin123' ? 'admin' : 'user'
        });
    });

    socket.on('error', (message) => {
        loginError.textContent = message;
        socket.disconnect();
        return;
    });

    socket.on('chat history', (messages) => {
        isAdmin = password === 'admin123';
        currentUsername = username;
        loginContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        messageInput.focus();

        messages.forEach(message => appendMessage(message));
        scrollToBottom();

        if (isAdmin) {
            // Show admin command help
            const helpMessage = {
                id: Date.now().toString(),
                sender: 'System',
                username: 'System',
                text: 'Admin Command: Use "!pass (new password) (confirm password)" to change user password',
                timestamp: Date.now(),
                type: 'system'
            };
            setTimeout(() => appendMessage(helpMessage), 1000);
        }
    });

    socket.on('chat message', (message) => {
        appendMessage(message);
        scrollToBottom();
    });

    socket.on('delete message', (messageId) => {
        const messageElement = document.getElementById(`message-${messageId}`);
        if (messageElement) {
            messageElement.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => messageElement.remove(), 300);
        }
    });

    socket.on('edit message', (data) => {
        const messageElement = document.getElementById(`message-${data.id}`);
        if (messageElement) {
            const textElement = messageElement.querySelector('.message-text');
            if (textElement) {
                textElement.style.animation = 'fadeIn 0.3s ease';
                textElement.textContent = data.text;
            }
        }
    });
});

// Send message
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chat message', {
            text: message,
            username: currentUsername
        });
        messageInput.value = '';
    }
});

// Append message to chat
function appendMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.id = `message-${message.id}`;
    messageDiv.className = `message ${message.sender.toLowerCase()}`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const username = document.createElement('div');
    username.className = 'message-username';
    username.textContent = message.username;
    messageContent.appendChild(username);

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = message.text;
    messageContent.appendChild(textDiv);

    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date(message.timestamp).toLocaleTimeString();
    messageContent.appendChild(timestamp);

    messageDiv.appendChild(messageContent);

    if (isAdmin && message.sender !== 'System') {
        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls';

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit message';
        editBtn.onclick = () => editMessage(message.id);
        adminControls.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete message';
        deleteBtn.onclick = () => deleteMessage(message.id);
        adminControls.appendChild(deleteBtn);

        messageDiv.appendChild(adminControls);
    }

    messagesContainer.appendChild(messageDiv);
}

// Admin functions
function deleteMessage(messageId) {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete this message?')) {
        socket.emit('delete message', messageId);
    }
}

function editMessage(messageId) {
    if (!isAdmin) return;
    const messageElement = document.getElementById(`message-${messageId}`);
    const textElement = messageElement.querySelector('.message-text');
    const currentText = textElement.textContent;
    
    const newText = prompt('Edit message:', currentText);
    if (newText !== null && newText.trim() !== '' && newText !== currentText) {
        socket.emit('edit message', {
            id: messageId,
            text: newText.trim()
        });
    }
}

// Utility functions
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle connection errors
window.addEventListener('unload', () => {
    if (socket) {
        socket.disconnect();
    }
});
