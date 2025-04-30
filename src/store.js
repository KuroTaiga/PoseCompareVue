import { reactive, readonly, computed } from 'vue';

// Create a reactive state object
const state = reactive({
  // Session state
  sessionId: null,
  
  // Upload state
  videoFile: null,
  videoUrl: null,
  uploadId: null,
  
  // Model selection
  selectedModels: [],
  filterOptions: ['original', 'butterworth', 'chebyshev', 'bessel'],
  modelFilters: {
    mediapipe: 'original',
    fourdhumans: 'original',
    'sapiens_2b': 'original',
    'sapiens_1b': 'original',
    'sapiens_0.6b': 'original',
    'sapiens_0.3b': 'original'
  },
  filterWindowSize: 5,
  
  // Processing state
  isProcessing: false,
  jobId: null,
  
  // Results
  processResults: []
});

// Create actions to modify state
const actions = {
  // Session management
  setSessionId(id) {
    state.sessionId = id;
  },
  
  // Upload management
  setVideoFile(file, url) {
    state.videoFile = file;
    state.videoUrl = url;
  },
  
  clearVideo() {
    if (state.videoUrl) {
      URL.revokeObjectURL(state.videoUrl);
    }
    state.videoFile = null;
    state.videoUrl = null;
  },
  
  setUploadId(id) {
    state.uploadId = id;
  },
  
  // Model selection
  toggleModel(model) {
    const index = state.selectedModels.indexOf(model);
    if (index === -1) {
      // Add model
      state.selectedModels.push(model);
    } else {
      // Remove model
      state.selectedModels.splice(index, 1);
      
      // Remove from results
      state.processResults = state.processResults.filter(result => result.model !== model);
    }
  },
  
  setModelFilter(model, filter) {
    state.modelFilters[model] = filter;
  },
  
  resetModelFilters() {
    Object.keys(state.modelFilters).forEach(model => {
      state.modelFilters[model] = 'original';
    });
    state.filterWindowSize = 5;
  },
  
  setFilterWindowSize(size) {
    state.filterWindowSize = size;
  },
  
  // Processing state
  setProcessing(isProcessing) {
    state.isProcessing = isProcessing;
  },
  
  setJobId(id) {
    state.jobId = id;
  },
  
  // Results management
  setResults(results) {
    state.processResults = results;
  },
  
  updateResultStatus(model, status, url = null) {
    const result = state.processResults.find(r => r.model === model);
    if (result) {
      result.status = status;
      if (url) {
        result.url = url;
      }
    }
  },
  
  // Reset everything
  reset() {
    // Clear video
    actions.clearVideo();
    
    // Reset selections
    state.selectedModels = [];
    actions.resetModelFilters();
    
    // Clear results
    state.processResults = [];
    
    // Reset processing state
    state.jobId = null;
    state.isProcessing = false;
  }
};

// API methods
const api = {
  async initializeSession() {
    try {
      const response = await fetch('/api/session');
      const data = await response.json();
      
      if (data.status === 'success') {
        actions.setSessionId(data.session_id);
        return data.session_id;
      } else {
        console.error('Failed to initialize session:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      return null;
    }
  },
  
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        actions.setUploadId(data.upload_id);
        return data.upload_id;
      } else {
        console.error('Failed to upload file:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  },
  
  async startProcessing() {
    if (!state.uploadId || !state.selectedModels.length) {
      return null;
    }
    
    try {
      actions.setProcessing(true);
      
      // Prepare result placeholders
      const results = state.selectedModels.map(model => ({
        model: model,
        filter: state.modelFilters[model],
        status: 'pending',
        url: null
      }));
      
      actions.setResults(results);
      
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          upload_id: state.uploadId,
          models: state.selectedModels,
          noise_filter: 'original', // Default filter
          filter_window: state.filterWindowSize
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        actions.setJobId(data.job_id);
        return data.job_id;
      } else {
        // Update all results to failed
        state.selectedModels.forEach(model => {
          actions.updateResultStatus(model, 'failed');
        });
        
        actions.setProcessing(false);
        return null;
      }
    } catch (error) {
      console.error('Error starting processing:', error);
      
      // Update all results to failed
      state.selectedModels.forEach(model => {
        actions.updateResultStatus(model, 'failed');
      });
      
      actions.setProcessing(false);
      return null;
    }
  },
  
  async checkJobStatus() {
    if (!state.jobId) return;
    
    try {
      const response = await fetch(`/api/jobs/${state.jobId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        const job = data.job;
        
        // Check if job is completed
        if (job.status === 'completed') {
          console.log('Job completed:', job);
          
          // Update results
          state.processResults.forEach(result => {
            const model = result.model;
            
            if (data.results && data.results[model]) {
              actions.updateResultStatus(model, 'completed', data.results[model].video);
            } else {
              actions.updateResultStatus(model, 'failed');
            }
          });
          
          actions.setProcessing(false);
          return true;
        } else if (job.status === 'failed') {
          console.error('Job failed:', job);
          
          // Update all results to failed
          state.processResults.forEach(result => {
            actions.updateResultStatus(result.model, 'failed');
          });
          
          actions.setProcessing(false);
          return false;
        }
        
        // Job still processing
        return null;
      } else {
        console.error('Failed to get job status:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error checking job status:', error);
      return false;
    }
  }
};

// Computed properties
const getters = {
  videoFile: computed(() => state.videoFile),
  videoUrl: computed(() => state.videoUrl),
  isProcessing: computed(() => state.isProcessing),
  selectedModels: computed(() => state.selectedModels),
  filterOptions: computed(() => state.filterOptions),
  modelFilters: computed(() => state.modelFilters),
  filterWindowSize: computed(() => state.filterWindowSize),
  processResults: computed(() => state.processResults),
  hasResults: computed(() => state.processResults.length > 0),
  canProcess: computed(() => state.videoFile && state.selectedModels.length > 0)
};

// Create a store factory
export function useStore() {
  return {
    // State (read-only)
    ...getters,
    
    // Actions
    ...actions,
    
    // API methods
    api
  };
}