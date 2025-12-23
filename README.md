# Linux Learning Assistant

> **🚀 Prototype** - Demonstrating remote desktop access using VNC and WebSockets

A proof-of-concept application showing how to set up server PCs that can be accessed from anywhere using VNC and websockify. This prototype demonstrates the architecture for building remote access solutions that work through web browsers or Electron apps.

## Purpose

This project serves as a **learning resource and prototype** for:

1. **Remote Desktop Access**: Setting up VNC servers on Linux machines for remote GUI access
2. **WebSocket Proxying**: Using websockify to bridge VNC's TCP protocol to WebSockets
3. **Browser-Based Access**: Accessing remote desktops from any device with a web browser
4. **Port Forwarding**: Configuring network routing to access VMs or remote servers

### Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client App    │────▶│   websockify    │────▶│  VNC Server     │
│  (Browser/App)  │ WS  │  (Port 6080)    │ TCP │  (Port 5900)    │
│   noVNC Client  │     │  WebSocket Proxy│     │  x0vncserver    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Use Cases:**
- Access home lab servers from anywhere
- Remote IT support and administration  
- Cloud-based development environments
- Educational platforms with live Linux terminals

## Features

- **Live VNC Viewer (70%)**: Connect to remote Linux machines via WebSocket
- **AI Learning Assistant (30%)**: Interactive chat powered by Gemini AI for learning Linux
- **Split-Screen Layout**: Practice commands while getting real-time assistance
- **Cross-Platform**: Works in browsers or as a standalone Electron app

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Arch Linux VM with:
  - VNC server (`x0vncserver`) running on display :0
  - WebSocket proxy (`websockify`) forwarding port 5900 to 6080
  - VirtualBox port forwarding: localhost:6080 → VM:6080

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

Run the application in development mode:

```bash
npm run electron:dev
```

This will:
- Start the Vite development server
- Launch Electron with hot-reload enabled
- Open DevTools automatically

## Building

Build the application for production:

```bash
npm run electron:build
```

The built application will be in the `release/` directory.

## Project Structure

```
virthelper/
├── electron/
│   └── main.js          # Electron main process
├── src/
│   ├── App.jsx          # Main React component
│   ├── App.css          # Styles
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

## Usage

1. Ensure your Arch Linux VM is running with VNC server and websockify
2. Launch the application
3. The VNC viewer will automatically attempt to connect to `ws://127.0.0.1:6080`
4. Use the chat panel to ask questions about Linux commands
5. Practice commands in the live VM while getting assistance

## Supported Commands (Mock AI)

The assistant can help with:
- File operations: `ls`, `cd`, `pwd`, `mkdir`, `rm`, `cat`
- Search: `grep`, `find`
- Network: `ip`, `ping`, `netstat`
- System: `top`, `ps`, `df`, `free`
- And more! Just type "help" for a full list

## Technologies

- **Electron**: Desktop application framework
- **React**: UI library
- **Vite**: Fast build tool and dev server
- **noVNC**: JavaScript VNC client library
- **websockify**: WebSocket proxy for VNC
- **Gemini AI**: Google's AI for the learning assistant

## Server Setup Guide

To set up a remote-accessible Linux server:

### 1. Install VNC Server
```bash
# Arch Linux
sudo pacman -S tigervnc

# Ubuntu/Debian
sudo apt install tigervnc-standalone-server
```

### 2. Install websockify
```bash
# Arch Linux
sudo pacman -S python-websockify

# Ubuntu/Debian
sudo apt install websockify
```

### 3. Start VNC Server
```bash
# Allow X connections
xhost +local:

# Start VNC server (no password for testing)
x0vncserver -display :0 -SecurityTypes None &

# Or with password
vncpasswd
x0vncserver -display :0 -PasswordFile ~/.vnc/passwd &
```

### 4. Start websockify
```bash
# Listen on all interfaces for remote access
websockify 0.0.0.0:6080 localhost:5900
```

### 5. Configure Port Forwarding
For VirtualBox VMs or behind NAT:
- Forward external port 6080 → internal port 6080
- For cloud servers, open port 6080 in firewall

## Troubleshooting

### VNC won't connect
- Verify websockify is running: `ss -tlnp | grep 6080`
- Check VNC server: `ss -tlnp | grep 5900`
- Test WebSocket: Open browser console, run `new WebSocket('ws://your-ip:6080')`

### No screen capture (0 pixels)
- Run `xhost +local:` before starting x0vncserver
- Ensure DISPLAY is set: `echo $DISPLAY` should show `:0`

### Application won't start
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be v16+)

## Future Improvements

- [ ] SSH tunnel support for secure connections
- [ ] Multi-server management
- [ ] Session recording and playback
- [ ] Collaborative sessions
- [ ] Mobile-responsive design

## License

MIT
