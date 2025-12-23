import React, { useState, useRef, useEffect } from 'react'
import { sendMessage, getMockResponse, hasApiKey, setApiKey, getApiKey } from './LLMAssistant'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your Linux Learning Assistant powered by Gemini AI. Ask me anything about Linux commands!' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [vncStatus, setVncStatus] = useState('connecting')
  const [isLoading, setIsLoading] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check if API key is set on load
  useEffect(() => {
    if (!hasApiKey()) {
      setShowApiKeyModal(true)
    }
  }, [])

  // Check VNC connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const ws = new WebSocket('ws://127.0.0.1:6080')
        ws.onopen = () => {
          setVncStatus('connected')
          ws.close()
        }
        ws.onerror = () => {
          setVncStatus('disconnected')
        }
        ws.onclose = () => {
          // Connection check complete
        }
      } catch (error) {
        setVncStatus('disconnected')
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim())
      setShowApiKeyModal(false)
      setApiKeyInput('')
    }
  }

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return

    const userMessage = { role: 'user', content: inputValue }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Get conversation history (last 10 messages for context)
      const history = messages.slice(-10)
      
      let response
      if (hasApiKey()) {
        response = await sendMessage(inputValue, history)
      } else {
        // Fallback to mock responses
        response = getMockResponse(inputValue)
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      console.error('Error:', error)
      // Fallback to mock response on error
      const fallbackResponse = getMockResponse(inputValue)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⚠️ API Error: ${error.message}\n\nFallback response:\n${fallbackResponse}` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="app-container">
      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🔑 Gemini API Key</h3>
            <p>Enter your Gemini API key to enable AI assistance.</p>
            <p style={{ fontSize: '12px', color: '#9cdcfe' }}>
              Get a free key at: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#4ec9b0' }}>aistudio.google.com/apikey</a>
            </p>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter API key..."
              onKeyPress={(e) => e.key === 'Enter' && handleSaveApiKey()}
            />
            <div className="modal-buttons">
              <button onClick={handleSaveApiKey}>Save</button>
              <button onClick={() => setShowApiKeyModal(false)} className="secondary">Skip (Mock Mode)</button>
            </div>
          </div>
        </div>
      )}

      {/* Left Panel - Chat Interface */}
      <div className="chat-panel">
        <div className="chat-header">
          <h2>🐧 Linux Learning Assistant</h2>
          <button 
            className="settings-btn"
            onClick={() => setShowApiKeyModal(true)}
            title="API Settings"
          >
            ⚙️
          </button>
        </div>
        
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-role">
                {msg.role === 'user' ? '👤 You' : '🤖 Assistant'}
              </div>
              <div className="message-content">
                {msg.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-role">🤖 Assistant</div>
              <div className="message-content loading-dots">
                <span>●</span><span>●</span><span>●</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Linux commands..."
            rows="3"
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>

      {/* Right Panel - VNC Viewer */}
      <div className="vnc-panel">
        <div className="vnc-header">
          <h2>Arch Linux VM</h2>
          <span className={`status-indicator ${vncStatus}`}>
            {vncStatus === 'connected' ? '🟢 Connected' : 
             vncStatus === 'connecting' ? '🟡 Connecting...' : 
             '🔴 Disconnected'}
          </span>
        </div>
        
        <div className="vnc-container">
          {vncStatus === 'connecting' && (
            <div className="vnc-loading">
              <div className="spinner"></div>
              <p>Connecting to Arch Linux VM...</p>
            </div>
          )}
          {vncStatus === 'disconnected' && (
            <div className="vnc-loading">
              <p>Unable to connect to VNC server</p>
              <p style={{ fontSize: '12px', marginTop: '10px' }}>
                Make sure websockify is running on port 6080
              </p>
            </div>
          )}
          {vncStatus === 'connected' && (
            <iframe
              src="vnc.html"
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="VNC Viewer"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
