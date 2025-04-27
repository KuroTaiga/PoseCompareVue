<template>
    <div class="app-container">
      <!-- Header -->
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">Video Processing Tool</h1>
          <div class="header-actions">
            <button 
              class="btn btn-secondary"
              @click="resetAll"
            >
              Reset
            </button>
          </div>
        </div>
      </header>
  
      <!-- Main content -->
      <main class="main-content">
        <!-- Upload Section -->
        <section class="upload-section">
          <div class="card">
            <div class="card-header">
              <h2>Upload Video</h2>
            </div>
            <div class="card-body">
              <div class="upload-container" 
                   @dragover.prevent="onDragOver" 
                   @dragleave.prevent="onDragLeave" 
                   @drop.prevent="onDrop"
                   :class="{ 'active-dropzone': isDragging }">
                <div v-if="!uploadedVideo">
                  <input 
                    type="file" 
                    ref="fileInput" 
                    @change="onFileSelected" 
                    accept="video/mp4,video/avi,video/mov,video/webm" 
                    style="display: none"
                  />
                  <button class="btn btn-primary upload-btn" @click="triggerFileInput">
                    <span class="upload-icon">⬆️</span>
                    Select or drag video file here
                  </button>
                  <p class="upload-note">Supported formats: MP4, AVI, MOV, WEBM (Max 100MB)</p>
                </div>
                <div v-else class="video-preview">
                  <h3>{{ uploadedVideo.name }}</h3>
                  <video ref="videoPreview" controls class="preview-video">
                    <source :src="videoPreviewUrl" :type="uploadedVideo.type">
                    Your browser does not support the video tag.
                  </video>
                  <button class="btn btn-secondary mt-3" @click="removeVideo">
                    Remove video
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        <!-- Model Selection Section -->
        <section v-if="uploadedVideo" class="models-section">
          <div class="card">
            <div class="card-header">
              <h2>Select Models</h2>
            </div>
            <div class="card-body">
              <div class="model-options">
                <!-- MediaPipe -->
                <div class="model-option-container">
                  <button 
                    class="model-btn" 
                    :class="{ 'selected': selectedModels.includes('mediapipe') }"
                    @click="toggleModel('mediapipe')"
                  >
                    MediaPipe
                  </button>
                  <div v-if="selectedModels.includes('mediapipe')" class="filter-panel">
                    <h4>Filter Options</h4>
                    <div class="filter-options">
                      <button 
                        v-for="filter in noiseFilters" 
                        :key="filter" 
                        class="filter-btn"
                        :class="{ 'selected': modelFilters.mediapipe === filter }"
                        @click="selectFilter('mediapipe', filter)"
                      >
                        {{ formatFilterName(filter) }}
                      </button>
                    </div>
                  </div>
                </div>
  
                <!-- 4DHumans -->
                <div class="model-option-container">
                  <button 
                    class="model-btn" 
                    :class="{ 'selected': selectedModels.includes('fourdhumans') }"
                    @click="toggleModel('fourdhumans')"
                  >
                    4DHumans
                  </button>
                  <div v-if="selectedModels.includes('fourdhumans')" class="filter-panel">
                    <h4>Filter Options</h4>
                    <div class="filter-options">
                      <button 
                        v-for="filter in noiseFilters" 
                        :key="filter" 
                        class="filter-btn"
                        :class="{ 'selected': modelFilters.fourdhumans === filter }"
                        @click="selectFilter('fourdhumans', filter)"
                      >
                        {{ formatFilterName(filter) }}
                      </button>
                    </div>
                  </div>
                </div>
  
                <!-- Sapiens Models -->
                <div v-for="size in ['2b', '1b', '0.6b', '0.3b']" :key="size" class="model-option-container">
                  <button 
                    class="model-btn" 
                    :class="{ 'selected': selectedModels.includes(`sapiens_${size}`) }"
                    @click="toggleModel(`sapiens_${size}`)"
                  >
                    Sapiens {{ size }}
                  </button>
                  <div v-if="selectedModels.includes(`sapiens_${size}`)" class="filter-panel">
                    <h4>Filter Options</h4>
                    <div class="filter-options">
                      <button 
                        v-for="filter in noiseFilters" 
                        :key="filter" 
                        class="filter-btn"
                        :class="{ 'selected': modelFilters[`sapiens_${size}`] === filter }"
                        @click="selectFilter(`sapiens_${size}`, filter)"
                      >
                        {{ formatFilterName(filter) }}
                      </button>
                    </div>
                    <div class="filter-window-container">
                      <label for="filter-window">Filter Window Size: {{ filterWindowSize }}</label>
                      <input 
                        id="filter-window" 
                        type="range" 
                        min="1" 
                        max="15" 
                        step="2" 
                        v-model.number="filterWindowSize" 
                        class="filter-slider"
                      />
                    </div>
                  </div>
                </div>
              </div>
  
              <div class="process-controls">
                <button 
                  class="btn btn-primary process-btn" 
                  @click="startProcessing"
                  :disabled="!canProcess || isProcessing"
                >
                  {{ isProcessing ? 'Processing...' : 'Start Processing' }}
                </button>
              </div>
            </div>
          </div>
        </section>
  
        <!-- Results Section -->
        <section v-if="hasAnyResults" class="results-section">
          <div class="card">
            <div class="card-header">
              <h2>Results</h2>
            </div>
            <div class="card-body">
              <div class="results-grid">
                <div 
                  v-for="(modelResults, model) in processedResults" 
                  :key="model" 
                  class="result-item"
                >
                  <h3>{{ formatModelName(model) }}</h3>
                  <p>Filter: {{ formatFilterName(modelFilters[model]) }}</p>
                  
                  <div v-if="processStatus[model] === 'pending'" class="processing-indicator">
                    <div class="spinner"></div>
                    <p>Processing video...</p>
                  </div>
                  
                  <div v-else-if="processStatus[model] === 'failed'" class="error-message">
                    <p>Processing failed. Please try again.</p>
                  </div>
                  
                  <div v-else-if="processStatus[model] === 'completed'" class="result-video-container">
                    <video controls class="result-video">
                      <source :src="modelResults" type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                    <div class="result-actions">
                      <a 
                        :href="modelResults" 
                        download 
                        class="btn btn-secondary download-btn"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
  
      <!-- Footer -->
      <footer class="app-footer">
        <p>Video Processing API &copy; 2025</p>
      </footer>
    </div>
  </template>
  
  <script>
  export default {
    name: 'App',
    data() {
      return {
        uploadedVideo: null,
        videoPreviewUrl: null,
        sessionId: null,
        isDragging: false,
        selectedModels: [],
        noiseFilters: ['original', 'butterworth', 'chebyshev', 'bessel'],
        interpolationMethods: [
          'no interpolation',
          'kalman',
          'wiener',
          'linear',
          'bilinear',
          'spline',
          'kriging'
        ],
        modelFilters: {
          mediapipe: 'original',
          fourdhumans: 'original',
          sapiens_2b: 'original',
          sapiens_1b: 'original',
          sapiens_0.6b: 'original',
          sapiens_0.3b: 'original'
        },
        filterWindowSize: 5,
        isProcessing: false,
        jobId: null,
        processStatus: {}, // 'pending', 'completed', 'failed'
        processedResults: {},
        jobCheckInterval: null
      };
    },
    computed: {
      canProcess() {
        return this.uploadedVideo && this.selectedModels.length > 0;
      },
      hasAnyResults() {
        return Object.keys(this.processStatus).length > 0;
      }
    },
    async mounted() {
      await this.getOrCreateSession();
    },
    beforeDestroy() {
      this.clearJobCheckInterval();
      // Clean up video URL if it exists
      if (this.videoPreviewUrl) {
        URL.revokeObjectURL(this.videoPreviewUrl);
      }
    },
    methods: {
      async getOrCreateSession() {
        try {
          const response = await fetch('/api/session', {
            method: 'GET',
            credentials: 'include'
          });
          
          if (!response.ok) throw new Error('Failed to create session');
          
          const data = await response.json();
          this.sessionId = data.session_id;
          console.log('Session created or retrieved:', this.sessionId);
        } catch (error) {
          console.error('Error creating session:', error);
        }
      },
      
      triggerFileInput() {
        this.$refs.fileInput.click();
      },
      
      onDragOver(event) {
        this.isDragging = true;
      },
      
      onDragLeave(event) {
        this.isDragging = false;
      },
      
      onDrop(event) {
        this.isDragging = false;
        if (event.dataTransfer.files.length) {
          this.handleFileUpload(event.dataTransfer.files[0]);
        }
      },
      
      onFileSelected(event) {
        if (event.target.files.length) {
          this.handleFileUpload(event.target.files[0]);
        }
      },
      
      handleFileUpload(file) {
        if (!file.type.match('video.*')) {
          alert('Please select a video file');
          return;
        }
        
        if (file.size > 104857600) { // 100MB
          alert('File size exceeds 100MB limit');
          return;
        }
        
        this.uploadedVideo = file;
        this.videoPreviewUrl = URL.createObjectURL(file);
        
        // Reset selections when new video is uploaded
        this.selectedModels = [];
        this.resetModelFilters();
        this.processStatus = {};
        this.processedResults = {};
        
        this.uploadFile(file);
      },
      
      async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include'
          });
          
          if (!response.ok) throw new Error('Failed to upload file');
          
          const data = await response.json();
          console.log('File uploaded successfully:', data);
        } catch (error) {
          console.error('Error uploading file:', error);
          alert('Failed to upload the file. Please try again.');
        }
      },
      
      removeVideo() {
        if (this.videoPreviewUrl) {
          URL.revokeObjectURL(this.videoPreviewUrl);
        }
        this.uploadedVideo = null;
        this.videoPreviewUrl = null;
        this.selectedModels = [];
        this.resetModelFilters();
        this.processStatus = {};
        this.processedResults = {};
        this.clearJobCheckInterval();
      },
      
      toggleModel(model) {
        const index = this.selectedModels.indexOf(model);
        if (index === -1) {
          this.selectedModels.push(model);
        } else {
          this.selectedModels.splice(index, 1);
          // Remove from results when deselected
          if (this.processStatus[model]) {
            const { [model]: _, ...remainingStatus } = this.processStatus;
            this.processStatus = remainingStatus;
          }
          if (this.processedResults[model]) {
            const { [model]: _, ...remainingResults } = this.processedResults;
            this.processedResults = remainingResults;
          }
        }
      },
      
      selectFilter(model, filter) {
        this.modelFilters[model] = filter;
      },
      
      resetModelFilters() {
        Object.keys(this.modelFilters).forEach(model => {
          this.modelFilters[model] = 'original';
        });
        this.filterWindowSize = 5;
      },
      
      formatFilterName(filter) {
        return filter.charAt(0).toUpperCase() + filter.slice(1);
      },
      
      formatModelName(model) {
        if (model === 'mediapipe') return 'MediaPipe';
        if (model === 'fourdhumans') return '4DHumans';
        if (model.startsWith('sapiens_')) {
          const size = model.split('_')[1];
          return `Sapiens ${size}`;
        }
        return model;
      },
      
      resetAll() {
        this.removeVideo();
        this.selectedModels = [];
        this.resetModelFilters();
        this.processStatus = {};
        this.processedResults = {};
        this.clearJobCheckInterval();
      },
      
      async startProcessing() {
        if (!this.canProcess || this.isProcessing) return;
        
        this.isProcessing = true;
        
        // Set up initial processing status for selected models
        this.selectedModels.forEach(model => {
          this.processStatus[model] = 'pending';
          this.processedResults[model] = null;
        });
        
        try {
          const response = await fetch('/api/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              filename: this.uploadedVideo.name,
              models: this.selectedModels,
              noise_filter: this.noiseFilters[0], // Using first filter for now
              filter_window: this.filterWindowSize
            }),
            credentials: 'include'
          });
          
          if (!response.ok) throw new Error('Failed to start processing');
          
          const data = await response.json();
          this.jobId = data.job_id;
          console.log('Processing started, job ID:', this.jobId);
          
          // Start polling for job status
          this.startJobStatusPolling();
        } catch (error) {
          console.error('Error starting processing:', error);
          this.selectedModels.forEach(model => {
            this.processStatus[model] = 'failed';
          });
        } finally {
          this.isProcessing = false;
        }
      },
      
      startJobStatusPolling() {
        this.clearJobCheckInterval();
        
        this.jobCheckInterval = setInterval(async () => {
          await this.checkJobStatus();
          
          // If all models are processed (completed or failed), stop polling
          const allProcessed = Object.values(this.processStatus).every(
            status => status === 'completed' || status === 'failed'
          );
          
          if (allProcessed) {
            this.clearJobCheckInterval();
          }
        }, 2000); // Check every 2 seconds
      },
      
      clearJobCheckInterval() {
        if (this.jobCheckInterval) {
          clearInterval(this.jobCheckInterval);
          this.jobCheckInterval = null;
        }
      },
      
      async checkJobStatus() {
        if (!this.jobId) return;
        
        try {
          const response = await fetch(`/api/jobs/${this.jobId}`, {
            method: 'GET',
            credentials: 'include'
          });
          
          if (!response.ok) throw new Error('Failed to get job status');
          
          const data = await response.json();
          
          if (data.status === 'completed') {
            // Update status for each model
            this.selectedModels.forEach(model => {
              if (data.results && data.results[model]) {
                this.processStatus[model] = 'completed';
                this.processedResults[model] = data.results[model];
              } else {
                this.processStatus[model] = 'failed';
              }
            });
          } else if (data.status === 'failed') {
            this.selectedModels.forEach(model => {
              this.processStatus[model] = 'failed';
            });
          }
        } catch (error) {
          console.error('Error checking job status:', error);
        }
      }
    }
  };
  </script>
  
  <style>
  /* Google-inspired styles */
  :root {
    --primary-color: #4285F4;
    --primary-hover: #3367D6;
    --secondary-color: #5F6368;
    --secondary-hover: #202124;
    --border-color: #DADCE0;
    --background-color: #F8F9FA;
    --card-background: #FFFFFF;
    --text-color: #202124;
    --text-secondary: #5F6368;
    --error-color: #D93025;
    --success-color: #34A853;
    --processing-color: #FBBC05;
  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Google Sans', Arial, sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.5;
  }
  
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  /* Header styles */
  .app-header {
    background-color: var(--card-background);
    border-bottom: 1px solid var(--border-color);
    padding: 16px 24px;
    box-shadow: 0 1px 2px rgba(60, 64, 67, 0.3);
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  
  .app-title {
    font-size: 22px;
    font-weight: 500;
    color: var(--primary-color);
  }
  
  /* Main content area */
  .main-content {
    flex: 1;
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  
  /* Card styles */
  .card {
    background-color: var(--card-background);
    border-radius: 8px;
    box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3);
    margin-bottom: 24px;
    overflow: hidden;
  }
  
  .card-header {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .card-header h2 {
    font-size: 18px;
    font-weight: 500;
  }
  
  .card-body {
    padding: 24px;
  }
  
  /* Button styles */
  .btn {
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .btn-primary {
    background-color: var(--primary-color);
    color: white;
  }
  
  .btn-primary:hover, .btn-primary:focus {
    background-color: var(--primary-hover);
  }
  
  .btn-primary:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
  }
  
  .btn-secondary {
    background-color: transparent;
    color: var(--secondary-color);
    border: 1px solid var(--border-color);
  }
  
  .btn-secondary:hover, .btn-secondary:focus {
    background-color: var(--background-color);
    color: var(--secondary-hover);
  }
  
  /* Upload section */
  .upload-section {
    margin-bottom: 24px;
  }
  
  .upload-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--border-color);
    border-radius: 4px;
    padding: 32px;
    text-align: center;
    transition: all 0.2s ease;
  }
  
  .active-dropzone {
    border-color: var(--primary-color);
    background-color: rgba(66, 133, 244, 0.05);
  }
  
  .upload-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    font-size: 16px;
  }
  
  .upload-icon {
    font-size: 20px;
  }
  
  .upload-note {
    margin-top: 16px;
    color: var(--text-secondary);
    font-size: 14px;
  }
  
  .video-preview {
    width: 100%;
    max-width: 640px;
  }
  
  .preview-video {
    width: 100%;
    border-radius: 4px;
    margin-top: 16px;
  }
  
  /* Models section */
  .models-section {
    margin-bottom: 24px;
  }
  
  .model-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .model-option-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .model-btn {
    background-color: white;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 12px;
    text-align: left;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .model-btn:hover {
    background-color: var(--background-color);
  }
  
  .model-btn.selected {
    background-color: rgba(66, 133, 244, 0.1);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  
  .filter-panel {
    background-color: var(--background-color);
    border-radius: 4px;
    padding: 16px;
  }
  
  .filter-panel h4 {
    margin-bottom: 12px;
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .filter-btn {
    background-color: white;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .filter-btn:hover {
    background-color: var(--background-color);
  }
  
  .filter-btn.selected {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
  
  .filter-window-container {
    margin-top: 16px;
  }
  
  .filter-slider {
    width: 100%;
    margin-top: 8px;
  }
  
  .process-controls {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }
  
  .process-btn {
    padding: 12px 24px;
    font-size: 16px;
  }
  
  /* Results section */
  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }
  
  .result-item {
    background-color: var(--background-color);
    border-radius: 4px;
    padding: 16px;
  }
  
  .result-item h3 {
    margin-bottom: 8px;
    font-size: 16px;
  }
  
  .result-item p {
    margin-bottom: 16px;
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  .result-video-container {
    margin-top: 16px;
  }
  
  .result-video {
    width: 100%;
    border-radius: 4px;
  }
  
  .result-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }
  
  .download-btn {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  /* Processing status styles */
  .processing-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
  }
  
  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(66, 133, 244, 0.2);
    border-radius: 50%;
    border-top-color: var(--primary-color);
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .error-message {
    color: var(--error-color);
    padding: 16px;
    text-align: center;
  }
  
  /* Footer */
  .app-footer {
    background-color: var(--card-background);
    border-top: 1px solid var(--border-color);
    padding: 16px 24px;
    text-align: center;
    color: var(--text-secondary);
    font-size: 14px;
  }
  
  /* Utility classes */
  .mt-3 {
    margin-top: 12px;
  }
  </style>