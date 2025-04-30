<template>
  <div class="app-container">
    <header class="header">
      <h1>Video Processing Tool</h1>
      <div class="header-actions">
        <button 
          class="btn info-btn"
          @click="showInfoDialog = true"
          aria-label="Show information"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </button>
        <button 
          class="btn reset-btn" 
          @click="resetApp"
          :disabled="isProcessing"
        >
          Reset
        </button>
      </div>
    </header>

    <main class="main">
      <!-- Upload Section -->
      <VideoUploader 
        @video-uploaded="handleVideoUploaded" 
        :disabled="isProcessing"
      />

      <!-- Model Selection -->
      <ModelSelector 
        v-if="videoFile"
        :disabled="isProcessing"
        @process-started="handleProcessStarted"
      />

      <!-- Results Section -->
      <ResultViewer 
        v-if="hasResults"
      />
    </main>

    <footer class="footer">
      <p>&copy; 2025 Video Processing API</p>
    </footer>
    
    <!-- Info Dialog -->
    <div class="dialog-backdrop" v-if="showInfoDialog" @click="showInfoDialog = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>How to Use This Tool</h2>
          <button class="btn close-btn" @click="showInfoDialog = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <ol class="instructions-list">
            <li>
              <strong>Upload a Video</strong>
              <p>Upload a video file (MP4, AVI, MOV, WEBM) by dragging and dropping or clicking the upload area.</p>
            </li>
            <li>
              <strong>Select Models and Filters</strong>
              <p>Choose one or more pose estimation models and select multiple filters for each model to compare results.</p>
            </li>
            <li>
              <strong>Process the Video</strong>
              <p>Click "Start Processing" to begin. Results will appear as they are completed - no need to wait for all to finish.</p>
            </li>
            <li>
              <strong>View and Download Results</strong>
              <p>Each result will show the processing time and provide a download option for the processed video.</p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import VideoUploader from './components/VideoUploader.vue';
import ModelSelector from './components/ModelSelector.vue';
import ResultViewer from './components/ResultViewer.vue';
import { useStore } from './store';

export default {
  name: 'App',
  components: {
    VideoUploader,
    ModelSelector,
    ResultViewer
  },
  setup() {
    const store = useStore();
    const showInfoDialog = ref(false);
    
    return {
      // Use computed props to get store state
      videoFile: store.videoFile,
      isProcessing: store.isProcessing,
      hasResults: store.hasResults,
      
      // Local state
      showInfoDialog,
      
      // Methods
      handleVideoUploaded() {
        console.log('Video uploaded successfully');
      },
      
      handleProcessStarted() {
        console.log('Processing started');
      },
      
      resetApp() {
        if (store.isProcessing.value) return;
        store.reset();
      }
    };
  }
};
</script>

<style>
:root {
  --primary-color: #4285f4;
  --primary-hover: #3367d6;
  --secondary-color: #5f6368;
  --background-color: #f8f9fa;
  --border-color: #dadce0;
  --error-color: #ea4335;
  --success-color: #34a853;
  --warning-color: #fbbc05;
  --card-background: #ffffff;
  --text-primary: #202124;
  --text-secondary: #5f6368;
  --shadow-sm: 0 1px 2px 0 rgba(60, 64, 67, 0.3);
  --shadow-md: 0 2px 6px 2px rgba(60, 64, 67, 0.15);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
  background-color: var(--background-color);
  color: var(--text-primary);
  line-height: 1.5;
}

/* Main layout */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: var(--card-background);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header h1 {
  color: var(--primary-color);
  font-size: 20px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
}

.footer {
  background-color: var(--card-background);
  padding: 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  box-shadow: 0 -1px 2px 0 rgba(60, 64, 67, 0.3);
}

/* Button styles */
.btn {
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-btn {
  color: var(--secondary-color);
  background-color: transparent;
}

.reset-btn:hover:not([disabled]) {
  background-color: rgba(0, 0, 0, 0.05);
}

.info-btn {
  color: var(--secondary-color);
  background-color: transparent;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.close-btn {
  background: transparent;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Dialog */
.dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog-content {
  background-color: var(--card-background);
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-md);
}

.dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.dialog-body {
  padding: 20px;
}

.instructions-list {
  list-style-position: inside;
  padding-left: 0;
}

.instructions-list li {
  margin-bottom: 16px;
}

.instructions-list strong {
  display: block;
  margin-bottom: 4px;
}

.instructions-list p {
  color: var(--text-secondary);
  margin: 4px 0 0 24px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }
  
  .main {
    padding: 16px;
  }
  
  .dialog-content {
    width: 95%;
  }
}
</style>