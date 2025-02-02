export class DreamDevice {
  constructor() {
    this.active = false;
    this.messages = [
      "The DreamLink Nexus establishes connection...",
      "Quantum resonance patterns stabilizing...",
      "Transcendent frequencies detected...",
      "The boundaries of consciousness blur...",
      "Mystical energies converge in the dream portal...",
      "Time becomes fluid in this sacred space...",
      "DreamLink Nexus bridging realities...",
      "Spiritual wavelengths synchronized..."
    ];
    
    this.setupElements();
    this.setupEventListeners();
  }

  setupElements() {
    this.thetaSlider = document.getElementById('thetaSlider');
    this.deltaSlider = document.getElementById('deltaSlider');
    this.resonanceSlider = document.getElementById('resonanceSlider');
    this.activateButton = document.getElementById('activateButton');
    this.hzDisplay = document.querySelector('.hz');
    this.messagesContainer = document.querySelector('.messages');
    this.deviceContainer = document.querySelector('.device-container');
  }

  setupEventListeners() {
    this.activateButton.addEventListener('click', () => this.toggleDevice());
    
    [this.thetaSlider, this.deltaSlider, this.resonanceSlider].forEach(slider => {
      slider.addEventListener('input', () => this.updateFrequency());
    });
  }

  toggleDevice() {
    this.active = !this.active;
    this.deviceContainer.classList.toggle('active');
    this.activateButton.textContent = this.active ? 
      'Deactivate Dream Connection' : 'Initiate Dream Connection';
    
    if (this.active) {
      this.startCommunication();
    } else {
      this.stopCommunication();
    }
  }

  updateFrequency() {
    const theta = parseFloat(this.thetaSlider.value);
    const delta = parseFloat(this.deltaSlider.value);
    const combined = ((theta + delta) / 2).toFixed(1);
    this.hzDisplay.textContent = combined;
    
    document.documentElement.style.setProperty(
      '--primary-glow',
      `rgba(147, 112, 219, ${this.resonanceSlider.value / 100})`
    );
  }

  async startCommunication() {
    while (this.active) {
      await this.displayMessage();
      await this.wait(3000 + Math.random() * 4000);
    }
  }

  stopCommunication() {
    this.messagesContainer.innerHTML = '';
  }

  async displayMessage() {
    if (!this.active) return;
    
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = this.getRandomMessage();
    message.style.opacity = '0';
    
    this.messagesContainer.appendChild(message);
    await this.wait(10);
    message.style.transition = 'opacity 1s ease-in';
    message.style.opacity = '1';
    
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    
    if (this.messagesContainer.children.length > 5) {
      this.messagesContainer.removeChild(this.messagesContainer.children[0]);
    }
  }

  getRandomMessage() {
    return this.messages[Math.floor(Math.random() * this.messages.length)];
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const dreamDevice = new DreamDevice();
