export class FloatingNotes {
  constructor() {
    this.notes = JSON.parse(localStorage.getItem('floatingNotes')) || [];
    this.isVisible = false;
    this.setupElements();
    this.setupEventListeners();
    this.render();
  }

  setupElements() {
    // Create floating notes container
    this.container = document.createElement('div');
    this.container.className = 'floating-notes';
    
    // Create toggle button
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.className = 'notes-toggle';
    this.toggleBtn.innerHTML = '📝';
    this.toggleBtn.title = 'Toggle Analysis Notes';
    
    // Create notes panel
    this.panel = document.createElement('div');
    this.panel.className = 'notes-panel';
    this.panel.innerHTML = `
      <div class="notes-header">
        <h3>Analysis Notes</h3>
      </div>
      <div class="notes-list"></div>
      <form class="new-note-form">
        <textarea 
          class="new-note-input" 
          placeholder="Write a quick note..."
          rows="2"
          required
        ></textarea>
        <button type="submit" class="add-note-btn">Add</button>
      </form>
    `;
    
    // Add elements to container
    this.container.appendChild(this.toggleBtn);
    this.container.appendChild(this.panel);
    document.body.appendChild(this.container);
    
    // Get references to elements
    this.notesList = this.panel.querySelector('.notes-list');
    this.noteForm = this.panel.querySelector('.new-note-form');
    this.noteInput = this.panel.querySelector('.new-note-input');
  }

  setupEventListeners() {
    // Toggle panel visibility
    this.toggleBtn.addEventListener('click', () => this.togglePanel());
    
    // Handle click outside to close
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target) && this.isVisible) {
        this.togglePanel();
      }
    });
    
    // Handle new note submission
    this.noteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addNote();
    });
    
    // Auto-resize textarea
    this.noteInput.addEventListener('input', () => {
      this.noteInput.style.height = 'auto';
      this.noteInput.style.height = this.noteInput.scrollHeight + 'px';
    });
  }

  togglePanel() {
    this.isVisible = !this.isVisible;
    this.panel.classList.toggle('visible');
  }

  addNote() {
    const content = this.noteInput.value.trim();
    if (!content) return;
    
    const note = {
      id: Date.now(),
      content,
      timestamp: new Date().toISOString(),
      isPinned: false
    };
    
    this.notes.unshift(note);
    this.saveNotes();
    this.render();
    this.noteForm.reset();
    this.noteInput.style.height = 'auto';
  }

  deleteNote(id) {
    if (confirm('Delete this note?')) {
      this.notes = this.notes.filter(note => note.id !== id);
      this.saveNotes();
      this.render();
    }
  }

  togglePin(id) {
    const note = this.notes.find(note => note.id === id);
    if (note) {
      note.isPinned = !note.isPinned;
      this.notes.sort((a, b) => {
        if (a.isPinned === b.isPinned) {
          return new Date(b.timestamp) - new Date(a.timestamp);
        }
        return b.isPinned - a.isPinned;
      });
      this.saveNotes();
      this.render();
    }
  }

  saveNotes() {
    localStorage.setItem('floatingNotes', JSON.stringify(this.notes));
  }

  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000; // difference in seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  }

  render() {
    this.notesList.innerHTML = this.notes.map(note => `
      <div class="note-item ${note.isPinned ? 'pinned' : ''}">
        <div class="note-content">${this.escapeHtml(note.content)}</div>
        <div class="note-meta">
          <span>${this.formatTimestamp(note.timestamp)}</span>
          <div class="note-actions">
            <button 
              class="note-action" 
              onclick="floatingNotes.togglePin(${note.id})"
              title="${note.isPinned ? 'Unpin' : 'Pin'} note"
            >
              ${note.isPinned ? '📌' : '📍'}
            </button>
            <button 
              class="note-action" 
              onclick="floatingNotes.deleteNote(${note.id})"
              title="Delete note"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    `).join('');
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

window.FloatingNotes = FloatingNotes;
const floatingNotes = new FloatingNotes();
window.floatingNotes = floatingNotes;
