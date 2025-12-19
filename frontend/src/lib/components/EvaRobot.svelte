<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let modelContainer: HTMLDivElement;
  let mouseX = 0;
  let mouseY = 0;

  function handleMouseMove(event: MouseEvent) {
    if (!modelContainer) return;
    
    const rect = modelContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center
    mouseX = event.clientX - centerX;
    mouseY = event.clientY - centerY;
    
    // Limit rotation range
    const maxRotateX = 15;
    const maxRotateY = 15;
    
    // Normalize and scale
    const rotateY = (mouseX / (window.innerWidth / 2)) * maxRotateY;
    const rotateX = -(mouseY / (window.innerHeight / 2)) * maxRotateX;
    
    // Update CSS variables for eye tracking
    // Limit eye movement range
    const maxEyeMove = 10;
    const eyeX = (mouseX / (window.innerWidth / 2)) * maxEyeMove;
    const eyeY = (mouseY / (window.innerHeight / 2)) * maxEyeMove;
    
    // Update CSS variables for eye tracking
    modelContainer.style.setProperty('--eye-x', `${eyeX}px`);
    modelContainer.style.setProperty('--eye-y', `${eyeY}px`);
    modelContainer.style.setProperty('--head-rotate-x', `${rotateX}deg`);
    modelContainer.style.setProperty('--head-rotate-y', `${rotateY}deg`);
  }

  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handleMouseMove);
    }
  });
</script>

<div class="modelViewPort" bind:this={modelContainer}>
  <div class="eva">
    <div class="head">
      <div class="eyeChamber">
        <div class="eye"></div>
        <div class="eye"></div>
      </div>
    </div>
    <div class="body"></div>
  </div>
</div>

<style>
  .modelViewPort {
    /* The black circle background around the model*/
    perspective: 1000px;
    width: 20rem;
    height: 20rem;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent; /* Changed from black to blend with dark theme */
    overflow: hidden;
    margin: 0 auto;
  }
  
  .eva {
    --EVA-ROTATION-DURATION: 4s;
    transform-style: preserve-3d;
    animation: rotateRight var(--EVA-ROTATION-DURATION) linear infinite alternate;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .head {
    position: relative;
    width: 6rem;
    height: 4rem;
    border-radius: 48% 53% 45% 55% / 79% 79% 20% 22%;
    background: linear-gradient(to right, white 45%, gray);
    transform-style: preserve-3d;
    transform: rotateX(var(--head-rotate-x, 0deg)) rotateY(var(--head-rotate-y, 0deg));
    transition: transform 0.1s ease-out;
  }
  
  .eyeChamber {
    width: 4.5rem;
    height: 2.75rem;
    position: relative;
    left: 50%;
    top: 55%;
    border-radius: 45% 53% 45% 48% / 62% 59% 35% 34%;
    background-color: #0c203c;
    box-shadow: 0px 0px 2px 2px white, inset 0px 0px 0px 2px black;
    transform: translate(-50%, -50%);
    animation: moveRight var(--EVA-ROTATION-DURATION) linear infinite alternate;
    overflow: hidden; /* Keep eyes inside */
  }
  
  .eye {
    width: 1.2rem;
    height: 1.5rem;
    position: absolute;
    border-radius: 50%;
    /* Eye tracking logic */
    transform: translate(var(--eye-x, 0px), var(--eye-y, 0px)); 
    transition: transform 0.1s ease-out;
  }
  
  .eye:first-child {
    left: 12px;
    top: 50%;
    background: repeating-linear-gradient(
      65deg,
      #9bdaeb 0px,
      #9bdaeb 1px,
      white 2px
    );
    box-shadow: inset 0px 0px 5px #04b8d5, 0px 0px 15px 1px #0bdaeb;
    margin-top: -0.75rem; /* Center vertically since we removed transform translate */
  }
  
  .eye:nth-child(2) {
    right: 12px;
    top: 50%;
    background: repeating-linear-gradient(
      -65deg,
      #9bdaeb 0px,
      #9bdaeb 1px,
      white 2px
    );
    box-shadow: inset 0px 0px 5px #04b8d5, 0px 0px 15px 1px #0bdaeb;
    margin-top: -0.75rem; /* Center vertically since we removed transform translate */
  }
  
  .body {
    width: 6rem;
    height: 8rem;
    position: relative;
    margin-block-start: 0.25rem;
    border-radius: 47% 53% 45% 55% / 12% 9% 90% 88%;
    background: linear-gradient(to right, white 35%, gray);
  }
  
  /* Arms removed as requested in prompt "instead of the hand on the center" */
  

</style>
