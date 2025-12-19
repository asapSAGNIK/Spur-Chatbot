<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let disabled = false;
  export let placeholder = 'Type your message...';

  let message = '';
  const dispatch = createEventDispatcher<{ send: string }>();

  function handleSubmit() {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      dispatch('send', trimmed);
      message = '';
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
</script>

<form class="chat-input" on:submit|preventDefault={handleSubmit}>
  <input
    type="text"
    bind:value={message}
    on:keydown={handleKeydown}
    {placeholder}
    {disabled}
    autocomplete="off"
    aria-label="Message input"
  />
  <button 
    type="submit" 
    disabled={disabled || !message.trim()}
    aria-label="Send message"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  </button>
</form>

<style>
  .chat-input {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    background: var(--bg-card);
    border-top: 1px solid var(--border-color);
  }

  input {
    flex: 1;
    padding: 14px 18px;
    background: var(--bg-input);
    border-radius: var(--radius-full);
    color: var(--text-primary);
    font-size: 0.95rem;
    transition: box-shadow var(--transition-fast);
  }

  input::placeholder {
    color: var(--text-muted);
  }

  input:focus {
    box-shadow: 0 0 0 2px var(--primary);
    outline: none;
  }

  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-radius: var(--radius-full);
    color: white;
    transition: all var(--transition-fast);
  }

  button:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: var(--shadow-md);
  }

  button:active:not(:disabled) {
    transform: scale(0.95);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
