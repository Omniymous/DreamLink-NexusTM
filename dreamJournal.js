export class DreamJournal {
  constructor() {
    this.dreams = JSON.parse(localStorage.getItem('dreamJournal')) || [];
    this.dreamLinks = JSON.parse(localStorage.getItem('dreamLinks')) || [];
    this.setupElements();
    this.setupEventListeners();
    this.renderJournal();
  }

  setupElements() {
    this.modal = document.getElementById('journalModal');
    this.newEntryBtn = document.getElementById('newEntryBtn');
    this.closeBtn = document.querySelector('.close');
    this.journalForm = document.getElementById('dreamJournalForm');
    this.journalEntries = document.querySelector('.journal-entries');
    this.lucidityLevel = document.getElementById('lucidityLevel');
    this.lucidityValue = document.getElementById('lucidityValue');
    this.linkDreamsBtn = document.getElementById('linkDreamsBtn');
    this.dreamLinkModal = document.getElementById('dreamLinkModal');
    this.closeLinkBtn = document.querySelector('.close-link');
    this.dreamLinkForm = document.getElementById('dreamLinkForm');
    this.dreamSelect1 = document.getElementById('dreamSelect1');
    this.dreamSelect2 = document.getElementById('dreamSelect2');
  }

  setupEventListeners() {
    this.newEntryBtn.addEventListener('click', () => this.openModal());
    this.closeBtn.addEventListener('click', () => this.closeModal());
    this.journalForm.addEventListener('submit', (e) => this.handleSubmit(e));
    this.lucidityLevel.addEventListener('input', (e) => {
      this.lucidityValue.textContent = e.target.value;
    });

    window.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
      if (e.target === this.dreamLinkModal) this.closeLinkModal();
    });

    this.linkDreamsBtn.addEventListener('click', () => this.openLinkModal());
    this.closeLinkBtn.addEventListener('click', () => this.closeLinkModal());
    this.dreamLinkForm.addEventListener('submit', (e) => this.handleLinkSubmit(e));
    this.journalEntries?.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-btn');
      if (deleteBtn) {
        const dreamId = parseInt(deleteBtn.dataset.dreamId);
        this.deleteDream(dreamId);
      }

      const deleteLinkBtn = e.target.closest('.delete-link-btn');
      if (deleteLinkBtn) {
        const linkId = parseInt(deleteLinkBtn.dataset.linkId);
        this.deleteDreamLink(linkId);
      }
    });
  }

  openModal() {
    this.modal.style.display = 'block';
    document.getElementById('dreamDate').value = this.getCurrentDateTime();
  }

  closeModal() {
    this.modal.style.display = 'none';
    this.journalForm.reset();
  }

  openLinkModal() {
    this.dreamLinkModal.style.display = 'block';
    this.populateDreamSelects();
  }

  closeLinkModal() {
    this.dreamLinkModal.style.display = 'none';
    if (this.dreamLinkForm) {
      this.dreamLinkForm.reset();
    }
  }

  populateDreamSelects() {
    const options = this.dreams.map(dream => `
      <option value="${dream.id}">${this.escapeHtml(dream.title)} (${new Date(dream.date).toLocaleDateString()})</option>
    `).join('');
    
    this.dreamSelect1.innerHTML = options;
    this.dreamSelect2.innerHTML = options;
  }

  getCurrentDateTime() {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const dream = {
      id: Date.now(),
      title: document.getElementById('dreamTitle').value,
      date: document.getElementById('dreamDate').value,
      description: document.getElementById('dreamDescription').value,
      tags: document.getElementById('dreamTags').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag),
      lucidity: document.getElementById('lucidityLevel').value
    };

    this.dreams.unshift(dream);
    this.saveDreams();
    this.renderJournal();
    this.closeModal();
  }

  handleLinkSubmit(e) {
    e.preventDefault();
    
    const dreamLink = {
      id: Date.now(),
      dream1Id: parseInt(this.dreamSelect1.value),
      dream2Id: parseInt(this.dreamSelect2.value),
      connectionType: document.getElementById('connectionType').value,
      notes: document.getElementById('connectionNotes').value
    };

    if (dreamLink.dream1Id === dreamLink.dream2Id) {
      alert('Please select two different dreams to link');
      return;
    }

    this.dreamLinks.push(dreamLink);
    this.saveDreamLinks();
    this.renderJournal();
    this.closeLinkModal();
  }

  deleteDream(id) {
    if (confirm('Are you sure you want to delete this dream entry?')) {
      this.dreams = this.dreams.filter(dream => dream.id !== id);
      this.dreamLinks = this.dreamLinks.filter(link => 
        link.dream1Id !== id && link.dream2Id !== id
      );
      this.saveDreams();
      this.saveDreamLinks();
      this.renderJournal();
    }
  }

  deleteDreamLink(linkId) {
    if (confirm('Are you sure you want to remove this dream connection?')) {
      this.dreamLinks = this.dreamLinks.filter(link => link.id !== linkId);
      this.saveDreamLinks();
      this.renderJournal();
    }
  }

  saveDreams() {
    localStorage.setItem('dreamJournal', JSON.stringify(this.dreams));
  }

  saveDreamLinks() {
    localStorage.setItem('dreamLinks', JSON.stringify(this.dreamLinks));
  }

  getDreamLinks(dreamId) {
    return this.dreamLinks.filter(link => 
      link.dream1Id === dreamId || link.dream2Id === dreamId
    );
  }

  getLinkedDream(link, currentDreamId) {
    const linkedDreamId = link.dream1Id === currentDreamId ? link.dream2Id : link.dream1Id;
    return this.dreams.find(dream => dream.id === linkedDreamId);
  }

  renderJournal() {
    this.journalEntries.innerHTML = this.dreams.map(dream => {
      const links = this.getDreamLinks(dream.id);
      const linkedDreamsHtml = links.length ? `
        <div class="dream-links">
          <h4>Connected Dreams:</h4>
          ${links.map(link => {
            const linkedDream = this.getLinkedDream(link, dream.id);
            if (!linkedDream) return ''; // Skip if linked dream was deleted
            return `
              <div class="dream-link">
                <div class="dream-link-content">
                  <span class="connection-type">${this.escapeHtml(link.connectionType)}:</span>
                  <a href="#dream-${linkedDream.id}" class="linked-dream-title">
                    ${this.escapeHtml(linkedDream.title)}
                  </a>
                  <span class="link-notes">${this.escapeHtml(link.notes)}</span>
                </div>
                <button class="delete-link-btn" data-link-id="${link.id}">×</button>
              </div>
            `;
          }).join('')}
        </div>
      ` : '';

      return `
        <div class="dream-entry" id="dream-${dream.id}">
          <div class="dream-entry-header">
            <h3>${this.escapeHtml(dream.title)}</h3>
            <button class="delete-btn" data-dream-id="${dream.id}">
              <span class="delete-icon">×</span>
            </button>
          </div>
          <div class="dream-meta">
            ${new Date(dream.date).toLocaleString()} | Lucidity: ${dream.lucidity}/10
          </div>
          <div>${this.escapeHtml(dream.description)}</div>
          <div class="dream-tags">
            ${dream.tags.map(tag => `
              <span class="dream-tag">#${this.escapeHtml(tag)}</span>
            `).join('')}
          </div>
          ${linkedDreamsHtml}
        </div>
      `;
    }).join('');
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

const dreamJournal = new DreamJournal();
window.DreamJournal = DreamJournal;
