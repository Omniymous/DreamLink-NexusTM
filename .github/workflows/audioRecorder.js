export class HypnagogicRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordings = JSON.parse(localStorage.getItem('hypnagogicRecordings')) || [];
    this.isRecording = false;
    
    this.setupElements();
    this.setupEventListeners();
    this.renderRecordings();
    this.checkPermissions();
  }

  setupElements() {
    this.recordButton = document.getElementById('recordButton');
    this.recordingsList = document.querySelector('.recordings-list');
    this.recordingStatus = document.querySelector('.recording-status');
    this.visualizer = document.getElementById('audioVisualizer');
    this.visualizerCtx = this.visualizer.getContext('2d');
  }

  setupEventListeners() {
    this.recordButton.addEventListener('click', () => this.toggleRecording());
    this.recordingsList?.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-recording-btn');
      if (deleteBtn) {
        const recordingId = parseInt(deleteBtn.dataset.recordingId);
        this.deleteRecording(recordingId);
      }
    });
  }

  async checkPermissions() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      this.recordButton.disabled = false;
    } catch (err) {
      console.error('Microphone access denied:', err);
      this.recordButton.disabled = true;
      this.recordingStatus.textContent = 'Please enable microphone access';
    }
  }

  async toggleRecording() {
    if (!this.isRecording) {
      await this.startRecording();
    } else {
      await this.stopRecording();
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.setupAudioVisualizer(stream);
      
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        try {
          const audioUrl = await websim.upload(audioBlob);
          this.saveRecording(audioUrl);
        } catch (err) {
          console.error('Error uploading audio:', err);
          this.recordingStatus.textContent = 'Error saving recording';
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordButton.textContent = 'Stop Recording';
      this.recordButton.classList.add('recording');
      this.recordingStatus.textContent = 'Recording...';
      
    } catch (err) {
      console.error('Error starting recording:', err);
      this.recordingStatus.textContent = 'Error starting recording';
    }
  }

  async stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.isRecording = false;
      this.recordButton.textContent = 'Start Recording';
      this.recordButton.classList.remove('recording');
      this.recordingStatus.textContent = 'Processing recording...';
      this.stopAudioVisualizer();
    }
  }

  setupAudioVisualizer(stream) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);
    
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!this.isRecording) return;
      
      requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);
      
      this.visualizerCtx.fillStyle = 'rgb(0, 0, 0)';
      this.visualizerCtx.fillRect(0, 0, this.visualizer.width, this.visualizer.height);
      
      const barWidth = this.visualizer.width / bufferLength * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        
        const gradient = this.visualizerCtx.createLinearGradient(
          0, 0, 0, this.visualizer.height
        );
        gradient.addColorStop(0, '#9370DB');
        gradient.addColorStop(1, '#4B0082');
        
        this.visualizerCtx.fillStyle = gradient;
        this.visualizerCtx.fillRect(
          x, this.visualizer.height - barHeight,
          barWidth, barHeight
        );
        
        x += barWidth + 1;
      }
    };
    
    draw();
  }

  stopAudioVisualizer() {
    this.visualizerCtx.clearRect(0, 0, this.visualizer.width, this.visualizer.height);
  }

  saveRecording(audioUrl) {
    const recording = {
      id: Date.now(),
      url: audioUrl,
      timestamp: new Date().toISOString(),
      duration: Math.round(this.audioChunks.reduce((acc, chunk) => acc + chunk.size, 0) / 32000)
    };
    
    this.recordings.unshift(recording);
    localStorage.setItem('hypnagogicRecordings', JSON.stringify(this.recordings));
    this.renderRecordings();
    this.recordingStatus.textContent = 'Recording saved';
  }

  deleteRecording(id) {
    if (confirm('Are you sure you want to delete this recording?')) {
      this.recordings = this.recordings.filter(rec => rec.id !== id);
      localStorage.setItem('hypnagogicRecordings', JSON.stringify(this.recordings));
      this.renderRecordings();
    }
  }

  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  renderRecordings() {
    if (!this.recordingsList) return;
    
    this.recordingsList.innerHTML = this.recordings.map(recording => `
      <div class="recording-entry">
        <div class="recording-info">
          <span>${new Date(recording.timestamp).toLocaleString()}</span>
          <span>${this.formatDuration(recording.duration)}</span>
        </div>
        <div class="recording-controls">
          <audio src="${recording.url}" controls></audio>
          <button 
            class="delete-recording-btn" 
            data-recording-id="${recording.id}"
          >
            <span class="delete-icon">×</span>
          </button>
        </div>
      </div>
    `).join('');
  }
}

window.HypnagogicRecorder = HypnagogicRecorder;
const hypnagogicRecorder = new HypnagogicRecorder();
