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
          
          <div class="result-actions">
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
      
      return {
        formatModelName,
        formatFilterName
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
    min-height: 240px;
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
  
  .result-actions {
    padding: 12px;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid var(--border-color);
  }
  
  .download-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--secondary-color);
    background-color: transparent;
    border: 1px solid var(--border-color);
    text-decoration: none;
  }
  
  .download-btn:hover {
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