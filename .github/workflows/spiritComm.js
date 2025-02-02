export class SpiritCommunicationLog {
  constructor() {
    this.encounters = JSON.parse(localStorage.getItem('spiritEncounters')) || [];
    this.setupElements();
    this.setupEventListeners();
    this.renderLog();
  }

  setupElements() {
    this.modal = document.getElementById('spiritModal');
    this.newEntryBtn = document.getElementById('newSpiritEntryBtn');
    this.closeBtn = document.querySelector('.close-spirit');
    this.encounterForm = document.getElementById('spiritEncounterForm');
    this.encounterLog = document.querySelector('.spirit-encounters');
  }

  setupEventListeners() {
    this.newEntryBtn.addEventListener('click', () => this.openModal());
    this.closeBtn.addEventListener('click', () => this.closeModal());
    this.encounterForm.addEventListener('submit', (e) => this.handleSubmit(e));

    window.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    this.encounterLog?.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-btn');
      if (deleteBtn) {
        const encounterId = parseInt(deleteBtn.dataset.encounterId);
        this.deleteEncounter(encounterId);
      }
    });
  }

  openModal() {
    this.modal.style.display = 'block';
    document.getElementById('encounterDate').value = this.getCurrentDateTime();
  }

  closeModal() {
    this.modal.style.display = 'none';
    this.encounterForm.reset();
  }

  getCurrentDateTime() {
    return new Date().toISOString().slice(0, 16);
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const encounter = {
      id: Date.now(),
      date: document.getElementById('encounterDate').value,
      spiritName: document.getElementById('spiritName').value,
      natureType: document.getElementById('spiritNature').value,
      message: document.getElementById('spiritMessage').value,
      emotions: document.getElementById('emotions').value,
      symbols: document.getElementById('spiritualSymbols').value
        .split(',')
        .map(symbol => symbol.trim())
        .filter(symbol => symbol),
      clarity: document.getElementById('clarityLevel').value
    };

    this.encounters.unshift(encounter);
    this.saveEncounters();
    this.renderLog();
    this.closeModal();
  }

  saveEncounters() {
    localStorage.setItem('spiritEncounters', JSON.stringify(this.encounters));
  }

  renderLog() {
    if (!this.encounterLog) return;

    this.encounterLog.innerHTML = this.encounters.map(encounter => `
      <div class="spirit-entry">
        <div class="spirit-entry-header">
          <h3>${this.escapeHtml(encounter.spiritName)}</h3>
          <div class="spirit-entry-controls">
            <div class="spirit-meta">
              <span class="spirit-date">${new Date(encounter.date).toLocaleString()}</span>
              <span class="spirit-nature ${encounter.natureType.toLowerCase()}">${encounter.natureType}</span>
              <span class="spirit-clarity">Clarity: ${encounter.clarity}/10</span>
            </div>
            <button class="delete-btn" data-encounter-id="${encounter.id}">
              <span class="delete-icon">×</span>
            </button>
          </div>
        </div>
        <div class="spirit-message">
          <p>${this.escapeHtml(encounter.message)}</p>
        </div>
        <div class="spirit-emotions">
          <strong>Emotional Resonance:</strong> ${this.escapeHtml(encounter.emotions)}
        </div>
        <div class="spiritual-symbols">
          ${encounter.symbols.map(symbol => `
            <span class="spiritual-symbol">${this.escapeHtml(symbol)}</span>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  deleteEncounter(id) {
    if (confirm('Are you sure you want to delete this spirit encounter?')) {
      this.encounters = this.encounters.filter(encounter => encounter.id !== id);
      this.saveEncounters();
      this.renderLog();
    }
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
