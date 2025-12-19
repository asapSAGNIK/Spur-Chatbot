<script lang="ts">
  import '../app.css';
  import ChatWidget from '$lib/components/ChatWidget.svelte';
</script>

<svelte:head>
  <title>ShopEase Support Chat</title>
  <meta name="description" content="Chat with our AI-powered support agent for help with orders, shipping, returns, and more." />
</svelte:head>

<main>
  <ChatWidget />
</main>

<style>
  main {
    height: 100vh;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  }

  @media (max-width: 520px) {
    main {
      padding: 0;
    }
  }
</style>
