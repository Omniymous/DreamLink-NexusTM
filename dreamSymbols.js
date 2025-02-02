export class DreamSymbolDatabase {
  constructor() {
    this.symbols = {
      "water": {
        meaning: "Emotions, unconscious mind, flow of life",
        interpretations: [
          "Calm water often represents inner peace",
          "Turbulent water may suggest emotional turmoil",
          "Deep water can symbolize the depths of your unconscious"
        ],
        tags: ["elements", "emotions", "nature", "purification"],
        insight: "Water in dreams often reflects your emotional state and spiritual journey."
      },
      "flying": {
        meaning: "Freedom, transcendence, escape from limitations",
        interpretations: [
          "Feeling of liberation and breaking free",
          "Desire to rise above current situations",
          "Spiritual or mental elevation"
        ],
        tags: ["movement", "freedom", "spirituality", "transformation"],
        insight: "Flying dreams often emerge during periods of personal growth and spiritual awakening."
      },
      "falling": {
        meaning: "Loss of control, anxiety, letting go",
        interpretations: [
          "Fear of failure or losing grip on something",
          "Feeling of helplessness",
          "Release of tension or old patterns"
        ],
        tags: ["fear", "transition", "release", "control"],
        insight: "Falling in dreams can signify a need to surrender or let go of controlling behaviors."
      },
      "teeth": {
        meaning: "Power, confidence, anxiety about appearance",
        interpretations: [
          "Losing teeth often relates to fears about appearance",
          "Breaking teeth can suggest communication anxiety",
          "Strong teeth may represent confidence"
        ],
        tags: ["body", "communication", "anxiety", "appearance"],
        insight: "Teeth dreams often surface during times of personal insecurity or life transitions."
      },
      "door": {
        meaning: "Opportunities, transitions, new beginnings",
        interpretations: [
          "Closed doors represent blocked opportunities",
          "Open doors suggest new possibilities",
          "Multiple doors indicate choices to be made"
        ],
        tags: ["transition", "opportunity", "choice", "path"],
        insight: "Doors in dreams invite you to explore new possibilities and face important decisions."
      },
      "snake": {
        meaning: "Transformation, wisdom, hidden fears",
        interpretations: [
          "Shedding skin represents personal transformation",
          "Wisdom and spiritual energy",
          "Potential dangers or fears"
        ],
        tags: ["animals", "transformation", "wisdom", "fear"],
        insight: "Snake dreams often appear during times of profound personal transformation."
      },
      "house": {
        meaning: "Self, personality, state of mind",
        interpretations: [
          "Different rooms represent different aspects of self",
          "Old house can represent past memories",
          "New house might suggest new beginnings"
        ],
        tags: ["self", "structure", "memory", "identity"],
        insight: "Houses in dreams reflect your inner landscape and various aspects of your personality."
      },
      "mirror": {
        meaning: "Self-reflection, identity, truth",
        interpretations: [
          "Broken mirrors suggest distorted self-image",
          "Clear mirrors represent honest self-evaluation",
          "Multiple mirrors might indicate identity confusion"
        ],
        tags: ["reflection", "truth", "identity", "perception"],
        insight: "Mirror dreams often appear when you're going through periods of self-discovery."
      }
    };
    
    this.setupElements();
    this.setupEventListeners();
  }

  setupElements() {
    this.searchInput = document.getElementById('symbolSearch');
    this.resultsContainer = document.getElementById('symbolResults');
    this.symbolModal = document.getElementById('symbolModal');
    this.symbolModalContent = document.getElementById('symbolModalContent');
    this.closeSymbolModal = document.querySelector('.close-symbol');
  }

  setupEventListeners() {
    this.searchInput.addEventListener('input', () => this.handleSearch());
    this.closeSymbolModal.addEventListener('click', () => this.hideSymbolDetails());
    
    window.addEventListener('click', (e) => {
      if (e.target === this.symbolModal) {
        this.hideSymbolDetails();
      }
    });
  }

  handleSearch() {
    const searchTerm = this.searchInput.value.toLowerCase();
    const results = Object.entries(this.symbols)
      .filter(([symbol]) => symbol.toLowerCase().includes(searchTerm))
      .slice(0, 5); // Limit to 5 results

    this.displayResults(results);
  }

  displayResults(results) {
    this.resultsContainer.innerHTML = results.length ? results.map(([symbol, data]) => `
      <div class="symbol-result">
        <h4>${this.capitalizeFirstLetter(symbol)}</h4>
        <p>${data.meaning}</p>
        
        <div class="symbol-popup">
          <div class="popup-header">${this.capitalizeFirstLetter(symbol)}</div>
          <div class="popup-meaning">${data.meaning}</div>
          <ul class="popup-interpretations">
            ${data.interpretations.map(interp => `
              <li>${interp}</li>
            `).join('')}
          </ul>
          <div class="popup-tags">
            ${data.tags.map(tag => `
              <span class="symbol-tag">#${tag}</span>
            `).join('')}
          </div>
          <div class="popup-footer">${data.insight}</div>
        </div>
      </div>
    `).join('') : '<div class="no-results">No symbols found</div>';
  }

  showSymbolDetails(symbol) {
    const symbolData = this.symbols[symbol];
    if (!symbolData) return;

    this.symbolModalContent.innerHTML = `
      <h2>${this.capitalizeFirstLetter(symbol)}</h2>
      <div class="symbol-meaning">
        <h3>Primary Meaning:</h3>
        <p>${symbolData.meaning}</p>
      </div>
      <div class="symbol-interpretations">
        <h3>Interpretations:</h3>
        <ul>
          ${symbolData.interpretations.map(interp => `<li>${interp}</li>`).join('')}
        </ul>
      </div>
    `;
    
    this.symbolModal.style.display = 'block';
  }

  hideSymbolDetails() {
    this.symbolModal.style.display = 'none';
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

window.DreamSymbolDatabase = DreamSymbolDatabase;
const dreamSymbols = new DreamSymbolDatabase();
