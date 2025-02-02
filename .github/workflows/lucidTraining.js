export class LucidTrainingModule {
  constructor() {
    this.techniques = {
      'reality-check': {
        name: 'Reality Check Training',
        description: 'Learn to question your reality throughout the day',
        exercises: [
          {
            title: 'Mirror Check',
            steps: [
              'Look at your reflection in a mirror',
              'Try to push your hand through it',
              'Check if text appears normal or distorted',
              'Repeat this check 5-10 times daily'
            ]
          },
          {
            title: 'Hand Inspection',
            steps: [
              'Look at your hands carefully',
              'Count your fingers',
              'Look away and look back',
              'Notice any changes or abnormalities'
            ]
          }
        ]
      },
      'wake-back-to-bed': {
        name: 'Wake Back to Bed (WBTB)',
        description: 'Technique to enter dreams consciously',
        exercises: [
          {
            title: 'WBTB Practice',
            steps: [
              'Set alarm 5 hours after bedtime',
              'Stay awake for 15-30 minutes',
              'Focus on your intention to lucid dream',
              'Return to sleep while maintaining awareness'
            ]
          }
        ]
      },
      'dream-signs': {
        name: 'Dream Sign Recognition',
        description: 'Identify personal dream patterns',
        exercises: [
          {
            title: 'Dream Journal Analysis',
            steps: [
              'Review your dream journal entries',
              'Look for recurring elements',
              'Create a list of personal dream signs',
              'Practice recognizing these signs in waking life'
            ]
          }
        ]
      },
      'visualization': {
        name: 'Dream Scene Visualization',
        description: 'Practice creating and maintaining dream scenes',
        exercises: [
          {
            title: 'Scene Building',
            steps: [
              'Choose a familiar location',
              'Close your eyes and visualize details',
              'Engage all senses in the visualization',
              'Practice maintaining the scene for 5+ minutes'
            ]
          }
        ]
      }
    };

    this.currentProgress = JSON.parse(localStorage.getItem('lucidProgress')) || {
      completedExercises: [],
      streakDays: 0,
      lastPractice: null
    };

    this.setupElements();
    this.setupEventListeners();
    this.renderTrainingModule();
  }

  setupElements() {
    this.trainingContainer = document.querySelector('.training-module');
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('exercise-complete-btn')) {
        const exerciseId = e.target.dataset.exercise;
        this.completeExercise(exerciseId);
      }

      if (e.target.classList.contains('technique-header')) {
        e.target.nextElementSibling.classList.toggle('expanded');
      }
    });
  }

  completeExercise(exerciseId) {
    const today = new Date().toDateString();
    
    if (!this.currentProgress.completedExercises.includes(exerciseId)) {
      this.currentProgress.completedExercises.push(exerciseId);
      
      if (this.currentProgress.lastPractice === today) {
        this.currentProgress.streakDays++;
      } else if (this.currentProgress.lastPractice !== today) {
        this.currentProgress.streakDays = 1;
      }
      
      this.currentProgress.lastPractice = today;
      this.saveProgress();
      this.updateProgress();
    }
  }

  saveProgress() {
    localStorage.setItem('lucidProgress', JSON.stringify(this.currentProgress));
  }

  updateProgress() {
    this.progressDisplay = document.querySelector('.training-progress');
    if (!this.progressDisplay) return; // Safety check
    
    const totalExercises = Object.values(this.techniques)
      .reduce((count, technique) => count + technique.exercises.length, 0);
    
    const progress = Math.round(
      (this.currentProgress.completedExercises.length / totalExercises) * 100
    );

    this.progressDisplay.innerHTML = `
      <div class="progress-stats">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="progress-details">
          <span>Progress: ${progress}%</span>
          <span>Streak: ${this.currentProgress.streakDays} days</span>
        </div>
      </div>
    `;
  }

  renderTrainingModule() {
    if (!this.trainingContainer) return; // Safety check
    
    let html = '<h2>Lucid Dream Training</h2>';
    html += '<div class="training-progress"></div>';
    
    for (const [id, technique] of Object.entries(this.techniques)) {
      html += `
        <div class="technique-section">
          <div class="technique-header">
            <h3>${technique.name}</h3>
            <span class="expand-icon">▼</span>
          </div>
          <div class="technique-content">
            <p>${technique.description}</p>
            <div class="exercises">
              ${technique.exercises.map(exercise => `
                <div class="exercise-card ${
                  this.currentProgress.completedExercises.includes(`${id}-${exercise.title}`) 
                  ? 'completed' 
                  : ''
                }">
                  <h4>${exercise.title}</h4>
                  <ol>
                    ${exercise.steps.map(step => `<li>${step}</li>`).join('')}
                  </ol>
                  <button 
                    class="exercise-complete-btn"
                    data-exercise="${id}-${exercise.title}"
                  >
                    ${this.currentProgress.completedExercises.includes(`${id}-${exercise.title}`)
                      ? 'Completed ✓'
                      : 'Mark Complete'}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    this.trainingContainer.innerHTML = html;
    this.updateProgress();
  }
}
