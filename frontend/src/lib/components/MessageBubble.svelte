<script lang="ts">
  export let sender: 'user' | 'ai';
  export let text: string;
  export let timestamp: string;

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="message {sender}">
  <div class="bubble">
    <p class="text">{text}</p>
    <span class="time">{formatTime(timestamp)}</span>
  </div>
</div>

<style>
  .message {
    display: flex;
    margin-bottom: 12px;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message.user {
    justify-content: flex-end;
  }

  .message.ai {
    justify-content: flex-start;
  }

  .bubble {
    max-width: 75%;
    padding: 12px 16px;
    border-radius: var(--radius-lg);
    position: relative;
  }

  .message.user .bubble {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-bottom-right-radius: 4px;
  }

  .message.ai .bubble {
    background: var(--ai-bubble);
    border-bottom-left-radius: 4px;
  }

  .text {
    color: var(--text-primary);
    font-size: 0.95rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .time {
    display: block;
    margin-top: 6px;
    font-size: 0.7rem;
    color: var(--text-muted);
    text-align: right;
  }

  .message.user .time {
    color: rgba(255, 255, 255, 0.6);
  }
</style>
