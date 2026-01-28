/**
 * AIAvatar - An interactive AI avatar component with animations and state management
 *
 * States:
 * - idle: Default resting state with subtle breathing animation
 * - thinking: Processing state with pulsing animation
 * - speaking: Active speaking state with mouth and expression animations
 * - listening: Attentive listening state with ear highlight
 * - error: Error state with red tint
 */

export class AIAvatar {
  static STATES = {
    IDLE: 'idle',
    THINKING: 'thinking',
    SPEAKING: 'speaking',
    LISTENING: 'listening',
    ERROR: 'error'
  };

  static DEFAULT_CONFIG = {
    size: 200,
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8',
    backgroundColor: '#1e1b4b',
    glowColor: '#a5b4fc',
    animationSpeed: 1,
    showParticles: true,
    showGlow: true,
    rounded: true
  };

  constructor(container, config = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error('AIAvatar: Container element not found');
    }

    this.config = { ...AIAvatar.DEFAULT_CONFIG, ...config };
    this.state = AIAvatar.STATES.IDLE;
    this.animationFrame = null;
    this.particles = [];
    this.time = 0;

    this._init();
  }

  _init() {
    this._createStyles();
    this._createDOM();
    this._startAnimationLoop();
  }

  _createStyles() {
    if (document.getElementById('ai-avatar-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'ai-avatar-styles';
    styles.textContent = `
      .ai-avatar-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .ai-avatar-container.rounded {
        border-radius: 50%;
      }

      .ai-avatar-glow {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        filter: blur(20px);
        opacity: 0.5;
        transition: opacity 0.3s ease;
      }

      .ai-avatar-svg {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
      }

      .ai-avatar-container[data-state="thinking"] .ai-avatar-glow {
        animation: pulse 1.5s ease-in-out infinite;
      }

      .ai-avatar-container[data-state="speaking"] .ai-avatar-glow {
        animation: speak-glow 0.3s ease-in-out infinite alternate;
      }

      .ai-avatar-container[data-state="listening"] .ai-avatar-glow {
        animation: listen-glow 2s ease-in-out infinite;
      }

      .ai-avatar-container[data-state="error"] .ai-avatar-glow {
        background: #ef4444 !important;
        animation: error-pulse 0.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }

      @keyframes speak-glow {
        0% { opacity: 0.5; }
        100% { opacity: 0.9; }
      }

      @keyframes listen-glow {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.7; }
      }

      @keyframes error-pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 0.9; }
      }

      .ai-avatar-particles {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2;
      }

      .ai-avatar-particle {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
      }
    `;
    document.head.appendChild(styles);
  }

  _createDOM() {
    const { size, backgroundColor, glowColor, rounded, showGlow } = this.config;

    this.container.innerHTML = '';
    this.container.className = `ai-avatar-container ${rounded ? 'rounded' : ''}`;
    this.container.style.width = `${size}px`;
    this.container.style.height = `${size}px`;
    this.container.style.backgroundColor = backgroundColor;
    this.container.dataset.state = this.state;

    // Glow layer
    if (showGlow) {
      this.glowElement = document.createElement('div');
      this.glowElement.className = 'ai-avatar-glow';
      this.glowElement.style.background = glowColor;
      this.container.appendChild(this.glowElement);
    }

    // SVG Avatar
    this.svgElement = this._createSVG();
    this.container.appendChild(this.svgElement);

    // Particles layer
    if (this.config.showParticles) {
      this.particlesContainer = document.createElement('div');
      this.particlesContainer.className = 'ai-avatar-particles';
      this.container.appendChild(this.particlesContainer);
    }
  }

  _createSVG() {
    const { size, primaryColor, secondaryColor } = this.config;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('class', 'ai-avatar-svg');

    svg.innerHTML = `
      <defs>
        <linearGradient id="avatar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor}"/>
          <stop offset="100%" style="stop-color:${secondaryColor}"/>
        </linearGradient>
        <filter id="avatar-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${primaryColor}" flood-opacity="0.3"/>
        </filter>
        <clipPath id="face-clip">
          <circle cx="100" cy="100" r="70"/>
        </clipPath>
      </defs>

      <!-- Main head circle -->
      <circle class="avatar-head" cx="100" cy="100" r="70"
        fill="url(#avatar-gradient)" filter="url(#avatar-shadow)"/>

      <!-- Face group -->
      <g class="avatar-face" clip-path="url(#face-clip)">
        <!-- Left eye -->
        <g class="avatar-eye avatar-eye-left">
          <ellipse cx="75" cy="90" rx="12" ry="14" fill="#1e1b4b"/>
          <ellipse class="avatar-pupil" cx="75" cy="90" rx="6" ry="7" fill="#fff"/>
          <circle class="avatar-eye-highlight" cx="78" cy="86" r="3" fill="#fff" opacity="0.8"/>
        </g>

        <!-- Right eye -->
        <g class="avatar-eye avatar-eye-right">
          <ellipse cx="125" cy="90" rx="12" ry="14" fill="#1e1b4b"/>
          <ellipse class="avatar-pupil" cx="125" cy="90" rx="6" ry="7" fill="#fff"/>
          <circle class="avatar-eye-highlight" cx="128" cy="86" r="3" fill="#fff" opacity="0.8"/>
        </g>

        <!-- Mouth -->
        <path class="avatar-mouth" d="M 80 125 Q 100 135 120 125"
          stroke="#1e1b4b" stroke-width="4" fill="none" stroke-linecap="round"/>

        <!-- Thinking indicator (hidden by default) -->
        <g class="avatar-thinking-dots" opacity="0">
          <circle cx="75" cy="150" r="4" fill="#1e1b4b"/>
          <circle cx="100" cy="150" r="4" fill="#1e1b4b"/>
          <circle cx="125" cy="150" r="4" fill="#1e1b4b"/>
        </g>
      </g>

      <!-- Antenna/AI indicator -->
      <g class="avatar-antenna">
        <line x1="100" y1="30" x2="100" y2="15" stroke="${primaryColor}" stroke-width="3" stroke-linecap="round"/>
        <circle class="avatar-antenna-light" cx="100" cy="12" r="5" fill="${secondaryColor}"/>
      </g>

      <!-- Sound waves for listening (hidden by default) -->
      <g class="avatar-sound-waves" opacity="0">
        <path d="M 175 100 Q 185 85, 175 70" stroke="${primaryColor}" stroke-width="2" fill="none" opacity="0.6"/>
        <path d="M 180 100 Q 195 80, 180 60" stroke="${primaryColor}" stroke-width="2" fill="none" opacity="0.4"/>
        <path d="M 25 100 Q 15 85, 25 70" stroke="${primaryColor}" stroke-width="2" fill="none" opacity="0.6"/>
        <path d="M 20 100 Q 5 80, 20 60" stroke="${primaryColor}" stroke-width="2" fill="none" opacity="0.4"/>
      </g>
    `;

    return svg;
  }

  _startAnimationLoop() {
    const animate = () => {
      this.time += 0.016 * this.config.animationSpeed;
      this._updateAnimation();
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  _updateAnimation() {
    const svg = this.svgElement;
    if (!svg) return;

    const head = svg.querySelector('.avatar-head');
    const leftEye = svg.querySelector('.avatar-eye-left');
    const rightEye = svg.querySelector('.avatar-eye-right');
    const mouth = svg.querySelector('.avatar-mouth');
    const antennaLight = svg.querySelector('.avatar-antenna-light');
    const thinkingDots = svg.querySelector('.avatar-thinking-dots');
    const soundWaves = svg.querySelector('.avatar-sound-waves');

    // Base breathing animation
    const breathe = Math.sin(this.time * 2) * 0.02;
    head.style.transform = `scale(${1 + breathe})`;
    head.style.transformOrigin = 'center';

    // Antenna pulsing
    const antennaPulse = (Math.sin(this.time * 4) + 1) / 2;
    antennaLight.style.opacity = 0.5 + antennaPulse * 0.5;

    switch (this.state) {
      case AIAvatar.STATES.IDLE:
        this._animateIdle(leftEye, rightEye, mouth);
        thinkingDots.style.opacity = '0';
        soundWaves.style.opacity = '0';
        break;

      case AIAvatar.STATES.THINKING:
        this._animateThinking(leftEye, rightEye, mouth, thinkingDots);
        soundWaves.style.opacity = '0';
        break;

      case AIAvatar.STATES.SPEAKING:
        this._animateSpeaking(mouth);
        thinkingDots.style.opacity = '0';
        soundWaves.style.opacity = '0';
        break;

      case AIAvatar.STATES.LISTENING:
        this._animateListening(leftEye, rightEye, soundWaves);
        thinkingDots.style.opacity = '0';
        break;

      case AIAvatar.STATES.ERROR:
        this._animateError(leftEye, rightEye, mouth);
        thinkingDots.style.opacity = '0';
        soundWaves.style.opacity = '0';
        break;
    }

    // Update particles
    if (this.config.showParticles) {
      this._updateParticles();
    }
  }

  _animateIdle(leftEye, rightEye, mouth) {
    // Subtle eye movement
    const eyeX = Math.sin(this.time * 0.5) * 2;
    const eyeY = Math.cos(this.time * 0.7) * 1;

    leftEye.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
    rightEye.style.transform = `translate(${eyeX}px, ${eyeY}px)`;

    // Occasional blink
    const blinkPhase = this.time % 5;
    if (blinkPhase < 0.1) {
      leftEye.style.transform += ' scaleY(0.1)';
      rightEye.style.transform += ' scaleY(0.1)';
    }

    // Gentle smile
    mouth.setAttribute('d', 'M 80 125 Q 100 135 120 125');
  }

  _animateThinking(leftEye, rightEye, mouth, thinkingDots) {
    // Eyes looking up
    leftEye.style.transform = 'translateY(-5px)';
    rightEye.style.transform = 'translateY(-5px)';

    // Neutral mouth
    mouth.setAttribute('d', 'M 80 128 Q 100 128 120 128');

    // Animate thinking dots
    thinkingDots.style.opacity = '1';
    const dots = thinkingDots.querySelectorAll('circle');
    dots.forEach((dot, i) => {
      const offset = i * 0.3;
      const bounce = Math.abs(Math.sin((this.time + offset) * 4)) * 8;
      dot.style.transform = `translateY(-${bounce}px)`;
      dot.style.transformOrigin = 'center';
    });
  }

  _animateSpeaking(mouth) {
    // Animated mouth for speaking
    const openness = (Math.sin(this.time * 15) + 1) * 5;
    mouth.setAttribute('d', `M 80 125 Q 100 ${135 + openness} 120 125`);
  }

  _animateListening(leftEye, rightEye, soundWaves) {
    // Attentive eyes
    leftEye.style.transform = 'scale(1.1)';
    rightEye.style.transform = 'scale(1.1)';
    leftEye.style.transformOrigin = 'center';
    rightEye.style.transformOrigin = 'center';

    // Show and animate sound waves
    soundWaves.style.opacity = '1';
    const waves = soundWaves.querySelectorAll('path');
    waves.forEach((wave, i) => {
      const scale = 0.8 + Math.sin(this.time * 3 + i * 0.5) * 0.2;
      wave.style.transform = `scale(${scale})`;
      wave.style.transformOrigin = 'center';
    });
  }

  _animateError(leftEye, rightEye, mouth) {
    // Worried eyes
    const shake = Math.sin(this.time * 20) * 2;
    leftEye.style.transform = `translateX(${shake}px)`;
    rightEye.style.transform = `translateX(${shake}px)`;

    // Sad mouth
    mouth.setAttribute('d', 'M 80 130 Q 100 120 120 130');
  }

  _updateParticles() {
    if (!this.particlesContainer) return;

    // Only add particles in active states
    if (this.state === AIAvatar.STATES.THINKING || this.state === AIAvatar.STATES.SPEAKING) {
      if (Math.random() < 0.1) {
        this._createParticle();
      }
    }

    // Update existing particles
    this.particles = this.particles.filter(particle => {
      particle.life -= 0.02;
      if (particle.life <= 0) {
        particle.element.remove();
        return false;
      }

      particle.y -= particle.speed;
      particle.x += Math.sin(particle.y * 0.05) * 0.5;

      particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
      particle.element.style.opacity = particle.life;

      return true;
    });
  }

  _createParticle() {
    const { size, primaryColor } = this.config;
    const particle = document.createElement('div');
    particle.className = 'ai-avatar-particle';

    const particleSize = 2 + Math.random() * 4;
    particle.style.width = `${particleSize}px`;
    particle.style.height = `${particleSize}px`;
    particle.style.backgroundColor = primaryColor;

    const startX = size / 4 + Math.random() * (size / 2);
    const startY = size;

    particle.style.left = '0';
    particle.style.top = '0';
    particle.style.transform = `translate(${startX}px, ${startY}px)`;

    this.particlesContainer.appendChild(particle);

    this.particles.push({
      element: particle,
      x: startX,
      y: startY,
      speed: 1 + Math.random() * 2,
      life: 1
    });
  }

  // Public API

  setState(state) {
    if (!Object.values(AIAvatar.STATES).includes(state)) {
      console.warn(`AIAvatar: Unknown state "${state}"`);
      return this;
    }

    this.state = state;
    this.container.dataset.state = state;

    // Emit state change event
    this.container.dispatchEvent(new CustomEvent('statechange', {
      detail: { state }
    }));

    return this;
  }

  getState() {
    return this.state;
  }

  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this._createDOM();
    return this;
  }

  idle() {
    return this.setState(AIAvatar.STATES.IDLE);
  }

  think() {
    return this.setState(AIAvatar.STATES.THINKING);
  }

  speak() {
    return this.setState(AIAvatar.STATES.SPEAKING);
  }

  listen() {
    return this.setState(AIAvatar.STATES.LISTENING);
  }

  error() {
    return this.setState(AIAvatar.STATES.ERROR);
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.particles.forEach(p => p.element.remove());
    this.particles = [];
    this.container.innerHTML = '';
  }
}

export default AIAvatar;
