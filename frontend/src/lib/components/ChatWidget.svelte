<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import MessageBubble from './MessageBubble.svelte';
  import ChatInput from './ChatInput.svelte';
  import EvaRobot from './EvaRobot.svelte';
  import { sendMessage, getHistory, type Message } from '$lib/api';

  interface DisplayMessage {
    id: string;
    sender: 'user' | 'ai' | 'divider';
    text: string;
    timestamp: string;
  }

  let showLanding = true;

  let messages: DisplayMessage[] = [];
  let isLoading = false;
  let error: string | null = null;
  let sessionId: string | null = null;
  let messagesContainer: HTMLDivElement;

  const SESSION_KEY = 'spur_chat_session_id'; // Keeps track of active session
  const ALL_SESSIONS_KEY = 'spur_chat_all_sessions'; // Keeps track of all history

  onMount(async () => {
    // Load all previous sessions
    const allSessionsJson = localStorage.getItem(ALL_SESSIONS_KEY);
    const allSessions: string[] = allSessionsJson ? JSON.parse(allSessionsJson) : [];
    
    // Load current active session
    const savedSession = localStorage.getItem(SESSION_KEY);
    
    if (allSessions.length > 0) {
      // Load history from all sessions
      await loadAllHistory(allSessions);
    }
    
    if (savedSession) {
      sessionId = savedSession;
      showLanding = false; // Go straight to chat if active session exists
    } else {
       showLanding = true;
    }
  });

  afterUpdate(() => {
    if (!showLanding) {
        scrollToBottom();
    }
  });

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  async function loadAllHistory(sessionIds: string[]) {
    let combinedMessages: DisplayMessage[] = [];
    
    for (let i = 0; i < sessionIds.length; i++) {
        const sid = sessionIds[i];
        try {
            const data = await getHistory(sid);
            if (data.messages && data.messages.length > 0) {
                // Add divider before each session (except the very first one if it's the start)
                if (combinedMessages.length > 0) {
                    combinedMessages.push({
                        id: `div-${sid}`,
                        sender: 'divider',
                        text: 'New Conversation',
                        timestamp: new Date().toISOString()
                    });
                }
                
                const sessionMsgs = data.messages.map((m: Message) => ({
                    id: m.id,
                    sender: m.sender,
                    text: m.text,
                    timestamp: m.created_at
                }));
                combinedMessages = [...combinedMessages, ...sessionMsgs];
            }
        } catch (e) {
            console.error(`Failed to load history for ${sid}`, e);
        }
    }
    messages = combinedMessages;
  }

  async function handleSend(event: CustomEvent<string>) {
    const userMessage = event.detail;
    error = null;
    showLanding = false; // Switch to chat view

    // Check if we need to add a divider locally (if starting fresh after back button)
    if (!sessionId && messages.length > 0 && messages[messages.length - 1].sender !== 'divider') {
        messages = [...messages, {
            id: `div-new-${Date.now()}`,
            sender: 'divider',
            text: 'New Conversation',
            timestamp: new Date().toISOString()
        }];
    }

    // Add user message immediately for responsiveness
    const tempId = `temp-${Date.now()}`;
    messages = [...messages, {
      id: tempId,
      sender: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    }];

    isLoading = true;

    try {
      const response = await sendMessage(userMessage, sessionId || undefined);
      
      // Handle new session creation
      if (response.sessionId && response.sessionId !== sessionId) {
        sessionId = response.sessionId;
        localStorage.setItem(SESSION_KEY, response.sessionId);
        
        // Update list of all sessions
        const allSessionsJson = localStorage.getItem(ALL_SESSIONS_KEY);
        const allSessions: string[] = allSessionsJson ? JSON.parse(allSessionsJson) : [];
        if (!allSessions.includes(response.sessionId)) {
            allSessions.push(response.sessionId);
            localStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(allSessions));
        }
      }

      // Add AI response
      messages = [...messages, {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toISOString()
      }];

    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to send message';
      // Remove the temporary user message on error
      messages = messages.filter(m => m.id !== tempId);
    } finally {
      isLoading = false;
    }
  }

  function startNewChat() {
    // Reset session ID and go back to landing
    sessionId = null;
    localStorage.removeItem(SESSION_KEY);
    showLanding = true;
    error = null;
  }
</script>

<div class="chat-widget">
  <header class="chat-header">
    <div class="header-content">
      <div class="avatar">
        <span>🛒</span>
      </div>
      <div class="info">
        <h1>ShopEase Support</h1>
        <span class="status">
          <span class="status-dot"></span>
          Online
        </span>
      </div>
    </div>
    {#if !showLanding}
        <button class="back-btn" on:click={startNewChat} title="Back to Home">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        </button>
    {/if}
  </header>

  {#if showLanding}
      <!-- Landing View -->
      <div class="welcome">
        <EvaRobot />
        <h2>Welcome to ShopEase!</h2>
        <p>Hi! I'm your support assistant today. How can I help you today?</p>
        <div class="suggestions">
          <button on:click={() => handleSend(new CustomEvent('send', { detail: "What's your return policy?" }))}>
            Return policy
          </button>
          <button on:click={() => handleSend(new CustomEvent('send', { detail: "Do you offer free shipping?" }))}>
            Shipping info
          </button>
          <button on:click={() => handleSend(new CustomEvent('send', { detail: "What are your support hours?" }))}>
            Support hours
          </button>
        </div>
      </div>
  {:else}
      <!-- Chat View -->
      <div class="messages" bind:this={messagesContainer}>
        {#each messages as message (message.id)}
            {#if message.sender === 'divider'}
                <div class="session-divider">
                    <span>{message.text}</span>
                </div>
            {:else}
                <MessageBubble 
                sender={message.sender === 'divider' ? 'ai' : message.sender}
                text={message.text}
                timestamp={message.timestamp}
                />
            {/if}
        {/each}

        {#if isLoading}
        <div class="typing-indicator">
            <div class="bubble">
            <span></span>
            <span></span>
            <span></span>
            </div>
            <p>Agent is typing...</p>
        </div>
        {/if}

        {#if error}
        <div class="error-message">
            <span>⚠️</span>
            <p>{error}</p>
            <button on:click={() => error = null}>Dismiss</button>
        </div>
        {/if}
      </div>
      
  {/if}

  <ChatInput 
    on:send={handleSend}
    disabled={isLoading}
    placeholder={isLoading ? 'Waiting for response...' : 'Type your message...'}
  />
</div>

<style>
  .chat-widget {
    display: flex;
    flex-direction: column;
    height: 100%;
    height: 100%;
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    background: var(--bg-dark);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
  }

  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: white;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
  }

  .info h1 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    opacity: 0.9;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: var(--success);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .back-btn {
    padding: 8px;
    color: rgba(255, 255, 255, 0.8);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  .welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 20px;
    height: 100%;
  }

  .welcome-icon {
    font-size: 3rem;
    margin-bottom: 16px;
    animation: wave 1.5s ease-in-out infinite;
  }

  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(20deg); }
    75% { transform: rotate(-15deg); }
  }

  .welcome h2 {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-primary);
  }

  .welcome p {
    color: var(--text-secondary);
    margin-bottom: 24px;
  }

  .suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .suggestions button {
    padding: 10px 16px;
    background: var(--bg-input);
    color: var(--text-primary);
    border-radius: var(--radius-full);
    font-size: 0.85rem;
    transition: all var(--transition-fast);
  }

  .suggestions button:hover {
    background: var(--primary);
    transform: translateY(-2px);
  }

  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .typing-indicator .bubble {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    background: var(--ai-bubble);
    border-radius: var(--radius-lg);
  }

  .typing-indicator .bubble span {
    width: 8px;
    height: 8px;
    background: var(--text-muted);
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite;
  }

  .typing-indicator .bubble span:nth-child(1) { animation-delay: 0s; }
  .typing-indicator .bubble span:nth-child(2) { animation-delay: 0.2s; }
  .typing-indicator .bubble span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-6px); }
  }

  .typing-indicator p {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--radius-md);
    margin-top: 12px;
    animation: fadeIn 0.3s ease;
  }

  .error-message span {
    font-size: 1.2rem;
  }

  .error-message p {
    flex: 1;
    color: var(--error);
    font-size: 0.9rem;
  }

  .error-message button {
    padding: 6px 12px;
    background: var(--error);
    color: white;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    transition: all var(--transition-fast);
  }

  .error-message button:hover {
    opacity: 0.9;
  }

  @media (max-width: 520px) {
    .chat-widget {
      max-width: 100%;
      border-radius: 0;
      height: 100vh;
    }
  }

  .session-divider {
    display: flex;
    justify-content: center;
    margin: 24px 0;
    position: relative;
  }

  .session-divider span {
    background: var(--bg-dark);
    color: var(--text-muted);
    font-size: 0.75rem;
    padding: 4px 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 1;
  }

  .session-divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    z-index: 0;
  }

  .inline-suggestions {
    padding: 20px 0;
    text-align: center;
    animation: fadeIn 0.3s ease;
  }

  .inline-suggestions p {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 12px;
  }
</style>
