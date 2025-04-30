<template>
  <div class="app-container">
    <header class="header">
      <h1>Video Processing Tool</h1>
      <button 
        class="btn reset-btn" 
        @click="resetApp"
        :disabled="isProcessing"
      >
        Reset
      </button>
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
  </div>
</template>

<script>
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
    
    return {
      // Use computed props to get store state
      videoFile: store.videoFile,
      isProcessing: store.isProcessing,
      hasResults: store.hasResults,
      
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

/* Section styling */
section {
  margin-bottom: 32px;
}

section h2 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--text-primary);
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }
  
  .main {
    padding: 16px;
  }
}
</style>