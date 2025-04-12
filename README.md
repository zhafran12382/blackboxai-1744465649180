
Built by https://www.blackbox.ai

---

```markdown
# WhatsApp-like Chat

A WhatsApp-like chat application with a 4-user limit, password-protected entry, and admin features.

## Project Overview

This project provides a simple and interactive chat application that mimics the functionality of WhatsApp to allow up to four users to chat in real-time. The app includes features that allow for user authentication, message handling, and administrative permissions for managing the chat environment.

## Installation

To run this application locally, you'll need to have Node.js installed on your machine. Follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/whatsapp-like-chat.git
   cd whatsapp-like-chat
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```

## Usage

To start the application, use the following command in your terminal:

```bash
npm start
```

Once the server is running, you can access the chat application in your web browser at `http://localhost:8000`.

## Features

- **User Authentication**: Users can join the chat by entering a username and password (with a fixed password in this version for users and an admin password).
- **Limited Users**: The chat supports a maximum of four concurrent users.
- **Chat History**: Recent messages are stored and served to new users upon joining.
- **Admin Controls**: Admin users have the ability to change passwords and manage messages (edit or delete).
- **Message Cleanup**: Old messages are cleared periodically (older than one week).

## Dependencies

The application relies on the following npm packages:

- **express**: Web framework for Node.js.
- **socket.io**: Allows real-time, bi-directional communication between clients and servers.

The dependencies are automatically installed when you run `npm install`.

## Project Structure

```
whatsapp-like-chat/
├── package.json          // Project metadata and dependencies
├── package-lock.json     // Dependency tree
└── server.js             // Main server file
```

### File Descriptions

- **package.json**: Manages project dependencies and scripts.
- **server.js**: Contains application logic, sets up the server, and manages WebSocket connections.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
```

This README.md is structured to cover all the necessary information about the project, including installation steps, usage instructions, features, dependencies, and the project structure. Make sure to replace `https://github.com/YOUR_USERNAME/whatsapp-like-chat.git` with the actual repository URL.