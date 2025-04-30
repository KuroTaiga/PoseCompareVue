<template>
  <div class="result-card">
    <div class="result-header">
      <h3>{{ formatModelName(result.model) }}</h3>
      <p class="filter-type">Filter: {{ formatFilterName(result.filter) }}</p>
    </div>
    
    <div class="result-body">
      <div v-if="result.status === 'pending'" class="processing-placeholder">
        <div class="spinner large"></div>
        <p>Processing...</p>
      </div>
      
      <div v-else-if="result.status === 'failed'" class="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <p>Processing failed</p>
      </div>
      
      <div v-else-if="result.status === 'completed'" class="result-video-container">
        <video controls>
          <source :src="result.url" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        
        <div class="result-meta">
          <div class="processing-time" v-if="result.processingTime !== null">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <span>Processing time: {{ formatTime(result.processingTime) }}</span>
          </div>
          
          <div class="result-actions">
            <a :href="result.url" target="_blank" rel="noopener noreferrer" class="btn view-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              View
            </a>
            <a :href="result.url" download class="btn download-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultCard',
  props: {
    result: {
      type: Object,
      required: true
    }
  },
  setup() {
    const formatModelName = (model) => {
      if (model === 'mediapipe') return 'MediaPipe';
      if (model === 'fourdhumans') return '4DHumans';
      
      if (model.startsWith('sapiens_')) {
        const parts = model.split('_');
        return `Sapiens ${parts[1]}`;
      }
      
      return model;
    };
    
    const formatFilterName = (filter) => {
      return filter.charAt(0).toUpperCase() + filter.slice(1);
    };
    
    const formatTime = (seconds) => {
      if (seconds < 60) {
        return `${seconds.toFixed(1)} seconds`;
      }
      
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      
      return `${minutes} min ${remainingSeconds.toFixed(0)} sec`;
    };
    
    return {
      formatModelName,
      formatFilterName,
      formatTime
    };
  }
};
</script>

<style scoped>
.result-card {
  background-color: var(--card-background);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.result-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.result-header h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.filter-type {
  font-size: 14px;
  color: var(--text-secondary);
}

.result-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.processing-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: var(--text-secondary);
}

.error-message {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: var(--error-color);
  text-align: center;
}

.error-message svg {
  margin-bottom: 16px;
}

.result-video-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-video-container video {
  width: 100%;
  flex: 1;
  background-color: #000;
}

.result-meta {
  padding: 12px;
  border-top: 1px solid var(--border-color);
}

.processing-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.download-btn, .view-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--secondary-color);
  background-color: transparent;
  border: 1px solid var(--border-color);
  text-decoration: none;
}

.download-btn:hover, .view-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  text-decoration: none;
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(95, 99, 104, 0.3);
  border-radius: 50%;
  border-top-color: var(--secondary-color);
  animation: spin 1s linear infinite;
}

.spinner.large {
  width: 40px;
  height: 40px;
  border-width: 3px;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>