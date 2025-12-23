// Gemini 2.0 Flash API Integration for Linux Learning Assistant

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Get API key from environment variable or localStorage
let API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are an expert Linux Learning Assistant designed to help users learn and master Linux commands, system administration, and terminal usage.

## Your Expertise:
- Linux command line (bash, zsh)
- File system navigation and management
- User and permission management
- Package managers (pacman, apt, yum, dnf)
- System monitoring and processes
- Networking and connectivity
- Shell scripting basics
- Arch Linux specifics (since the user is using Arch)

## Response Guidelines:
1. **Be concise** - Give direct, actionable answers
2. **Show commands** - Always provide the exact command to run
3. **Explain briefly** - Add a short explanation of what the command does
4. **Use formatting** - Use backticks for commands, bullet points for options
5. **Warn about dangers** - Flag destructive commands (rm -rf, dd, etc.)
6. **Suggest alternatives** - Offer safer or more efficient approaches when relevant

## Response Format:
- For simple queries: Direct command + one-line explanation
- For complex topics: Brief intro → Command(s) → Key options → Example
- Always use \`backticks\` for commands and paths

## Example Responses:

User: "How do I check disk space?"
Response: "Use \`df -h\` to see disk space in human-readable format:
• \`df -h\` - All mounted filesystems
• \`df -h /\` - Just root partition  
• \`du -sh /path\` - Size of specific directory"

User: "How do I find a file?"
Response: "Use \`find\` or \`locate\`:
• \`find /path -name 'filename'\` - Search by name
• \`find . -type f -name '*.txt'\` - Find all .txt files
• \`locate filename\` - Faster but needs \`sudo updatedb\` first"

## Important:
- The user has a live Arch Linux VM visible on their screen
- They can immediately try commands you suggest
- Focus on practical, hands-on learning
- Encourage experimentation with safe commands`;

export function setApiKey(key) {
  API_KEY = key;
  // Also save to localStorage for persistence
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('gemini_api_key', key);
  }
}

export function getApiKey() {
  if (!API_KEY && typeof localStorage !== 'undefined') {
    API_KEY = localStorage.getItem('gemini_api_key') || '';
  }
  return API_KEY;
}

export function hasApiKey() {
  return !!getApiKey();
}

export async function sendMessage(userMessage, conversationHistory = []) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('API key not set. Please configure your Gemini API key.');
  }

  // Build the conversation contents
  const contents = [];
  
  // Add conversation history
  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  }
  
  // Add current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const requestBody = {
    contents: contents,
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH', 
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE'
      }
    ]
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

// Fallback mock responses when API is not available
export function getMockResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('ip') || msg.includes('address')) {
    return 'To check your IP address:\n\n• `ip addr show` - All interfaces\n• `ip -4 addr` - IPv4 only\n• `hostname -I` - Quick IP list';
  }
  
  if (msg.includes('ls') || msg.includes('list')) {
    return 'List files with `ls`:\n\n• `ls -la` - All files with details\n• `ls -lh` - Human-readable sizes\n• `ls -lt` - Sort by time';
  }
  
  if (msg.includes('cd') || msg.includes('directory')) {
    return 'Change directory with `cd`:\n\n• `cd /path` - Go to path\n• `cd ..` - Up one level\n• `cd ~` - Home directory\n• `cd -` - Previous directory';
  }
  
  if (msg.includes('pacman') || msg.includes('install')) {
    return 'Arch package management:\n\n• `sudo pacman -S pkg` - Install\n• `sudo pacman -Syu` - Update all\n• `pacman -Ss term` - Search\n• `pacman -Q` - List installed';
  }
  
  return 'I can help you learn Linux commands! Try asking about:\n\n• File operations (ls, cd, cp, mv, rm)\n• System info (df, free, top, ps)\n• Networking (ip, ping, ss)\n• Package management (pacman)\n\nWhat would you like to learn?';
}

export default {
  setApiKey,
  getApiKey,
  hasApiKey,
  sendMessage,
  getMockResponse
};
