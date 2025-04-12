const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let messages = [];
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
let connectedUsers = 0;
const connectedUsernames = new Set();
let userPassword = "Ratubagus";
let adminPassword = "admin123";

// Clean up old messages periodically
setInterval(() => {
    const oneWeekAgo = Date.now() - WEEK_IN_MS;
    messages = messages.filter(msg => msg.timestamp > oneWeekAgo);
}, 60 * 60 * 1000); // Run every hour

io.on('connection', (socket) => {
    // Check if group is full
    if (connectedUsers >= 4) {
        socket.emit('error', 'Group is full (maximum 4 users)');
        socket.disconnect(true);
        return;
    }

    let userRole = '';
    let username = '';

    socket.on('join', (data) => {
        userRole = data.role;
        username = data.username;

        // Check if username is already taken
        if (connectedUsernames.has(username)) {
            socket.emit('error', 'Username is already taken');
            socket.disconnect(true);
            return;
        }

        // Validate password
        const password = data.password;
        if (password === adminPassword) {
            socket.isAdmin = true;
        } else if (password === userPassword) {
            socket.isAdmin = false;
        } else {
            socket.emit('error', 'Invalid password');
            socket.disconnect(true);
            return;
        }

        connectedUsers++;
        connectedUsernames.add(username);

        // Send recent messages
        const recentMessages = messages.filter(msg => Date.now() - msg.timestamp < WEEK_IN_MS);
        socket.emit('chat history', recentMessages);

        // Broadcast user joined message
        const joinMessage = {
            id: Date.now().toString(),
            sender: 'System',
            username: 'System',
            text: `${username} has joined the chat`,
            timestamp: Date.now(),
            type: 'system'
        };
        io.emit('chat message', joinMessage);
    });

    socket.on('chat message', (data) => {
        // Check for admin password change command
        if (socket.isAdmin && data.text.startsWith('!pass ')) {
            const parts = data.text.split(' ');
            if (parts.length === 3) {
                const [_, newPass, confirmPass] = parts;
                if (newPass === confirmPass) {
                    userPassword = newPass;
                    // Broadcast password change success message
                    io.emit('chat message', {
                        id: Date.now().toString(),
                        sender: 'System',
                        username: 'System',
                        text: 'User password has been changed successfully.',
                        timestamp: Date.now(),
                        type: 'system'
                    });
                } else {
                    socket.emit('chat message', {
                        id: Date.now().toString(),
                        sender: 'System',
                        username: 'System',
                        text: 'Password change failed: Passwords do not match.',
                        timestamp: Date.now(),
                        type: 'system'
                    });
                }
            } else {
                socket.emit('chat message', {
                    id: Date.now().toString(),
                    sender: 'System',
                    username: 'System',
                    text: 'Invalid command format. Use: !pass (new password) (confirm password)',
                    timestamp: Date.now(),
                    type: 'system'
                });
            }
            return;
        }

        const message = {
            id: Date.now().toString(),
            sender: socket.isAdmin ? 'Admin' : 'User',
            username: username,
            text: data.text,
            timestamp: Date.now()
        };
        messages.push(message);
        io.emit('chat message', message);
    });

    socket.on('delete message', (msgId) => {
        if (!socket.isAdmin) {
            socket.emit('error', 'Only admin can delete messages');
            return;
        }
        const index = messages.findIndex(msg => msg.id === msgId);
        if (index !== -1) {
            messages.splice(index, 1);
            io.emit('delete message', msgId);
        }
    });

    socket.on('edit message', (data) => {
        if (!socket.isAdmin) {
            socket.emit('error', 'Only admin can edit messages');
            return;
        }
        const message = messages.find(msg => msg.id === data.id);
        if (message) {
            message.text = data.text;
            message.edited = true;
            io.emit('edit message', { id: data.id, text: data.text });
        }
    });

    socket.on('disconnect', () => {
        if (username) {
            connectedUsers--;
            connectedUsernames.delete(username);

            // Broadcast user left message
            const leftMessage = {
                id: Date.now().toString(),
                sender: 'System',
                username: 'System',
                text: `${username} has left the chat`,
                timestamp: Date.now(),
                type: 'system'
            };
            io.emit('chat message', leftMessage);
        }
    });
});

const PORT = process.env.PORT || 8000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
