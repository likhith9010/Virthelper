# Linux Learning Assistant Project

## Project Type
Electron desktop application with React and Vite

## Technology Stack
- Electron: Desktop application framework
- React: UI library
- Vite: Build tool
- react-vnc: VNC client library for remote desktop viewing
- electron-vite: Electron build tooling

## Project Structure
- electron/: Main Electron process code
- src/: React application code
- dist/: Build output

## Development Status
- [x] Create .github/copilot-instructions.md file
- [x] Scaffold Electron+React+Vite project structure
- [x] Customize project with VNC and chat components
- [x] Install dependencies
- [x] Test and verify setup

## How to Run
```bash
npm run electron:dev
```

## Key Features Implemented
- Split-screen layout (30% chat, 70% VNC)
- Chat interface with mock AI responses for Linux commands
- VNC viewer using noVNC library
- Connection to ws://127.0.0.1:6080 for VM access
