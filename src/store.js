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
  // Now each model can have multiple selected filters
  modelFilters: {
    mediapipe: ['original'],
    fourdhumans: ['original'],
    'sapiens_2b': ['original'],
    'sapiens_1b': ['original'],
    'sapiens_0.6b': ['original'],
    'sapiens_0.3b': ['original']
  },
  filterWindowSize: 5,
  
  // Processing state
  isProcessing: false,
  activeJobs: {}, // Track jobs by model-filter combination
  
  // Results
  processResults: [],
  processingTimes: {} // Store processing time for each model-filter combination
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
      
      // Remove from active jobs
      Object.keys(state.activeJobs).forEach(jobKey => {
        if (jobKey.startsWith(model + '_')) {
          delete state.activeJobs[jobKey];
        }
      });
      
      // Remove from processing times
      Object.keys(state.processingTimes).forEach(timeKey => {
        if (timeKey.startsWith(model + '_')) {
          delete state.processingTimes[timeKey];
        }
      });
    }
  },
  
  // Now toggles a filter for a specific model
  toggleModelFilter(model, filter) {
    if (!state.modelFilters[model]) {
      state.modelFilters[model] = [];
    }
    
    const index = state.modelFilters[model].indexOf(filter);
    if (index === -1) {
      // Add filter
      state.modelFilters[model].push(filter);
    } else {
      // Remove filter if not the last one
      if (state.modelFilters[model].length > 1) {
        state.modelFilters[model].splice(index, 1);
        
        // Remove from results
        const resultKey = `${model}_${filter}`;
        state.processResults = state.processResults.filter(result => 
          !(result.model === model && result.filter === filter)
        );
        
        // Remove from active jobs
        if (state.activeJobs[resultKey]) {
          delete state.activeJobs[resultKey];
        }
        
        // Remove from processing times
        if (state.processingTimes[resultKey]) {
          delete state.processingTimes[resultKey];
        }
      }
    }
  },
  
  resetModelFilters() {
    Object.keys(state.modelFilters).forEach(model => {
      state.modelFilters[model] = ['original'];
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
  
  setJobId(modelFilter, jobId) {
    state.activeJobs[modelFilter] = {
      jobId,
      startTime: Date.now()
    };
  },
  
  // Results management
  addResult(result) {
    state.processResults.push(result);
  },
  
  updateResultStatus(model, filter, status, url = null) {
    const resultKey = `${model}_${filter}`;
    const result = state.processResults.find(r => 
      r.model === model && r.filter === filter
    );
    
    if (result) {
      result.status = status;
      if (url) {
        result.url = url;
      }
      
      // Calculate processing time when completed
      if (status === 'completed' && state.activeJobs[resultKey]) {
        const startTime = state.activeJobs[resultKey].startTime;
        const endTime = Date.now();
        const processingTime = (endTime - startTime) / 1000; // in seconds
        state.processingTimes[resultKey] = processingTime;
        result.processingTime = processingTime;
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
    state.activeJobs = {};
    state.processingTimes = {};
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
      
      // Start individual jobs for each model-filter combination
      const jobPromises = [];
      
      for (const model of state.selectedModels) {
        for (const filter of state.modelFilters[model]) {
          // Create a unique job for each model-filter combination
          const resultKey = `${model}_${filter}`;
          
          // Add result placeholder first
          const resultPlaceholder = {
            model: model,
            filter: filter,
            status: 'pending',
            url: null,
            processingTime: null
          };
          
          actions.addResult(resultPlaceholder);
          
          // Start this specific job
          const jobPromise = api.startSingleJob(model, filter, resultKey);
          jobPromises.push(jobPromise);
        }
      }
      
      // Wait for all jobs to be initiated
      await Promise.all(jobPromises);
      
      // Return success if any jobs were started
      return Object.keys(state.activeJobs).length > 0;
    } catch (error) {
      console.error('Error starting processing:', error);
      actions.setProcessing(false);
      return null;
    }
  },
  
  async startSingleJob(model, filter, resultKey) {
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          upload_id: state.uploadId,
          models: [model],
          noise_filter: filter,
          filter_window: state.filterWindowSize
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        actions.setJobId(resultKey, data.job_id);
        
        // Start polling for this specific job
        api.pollJobStatus(resultKey, model, filter, data.job_id);
        
        return data.job_id;
      } else {
        // Update result to failed
        actions.updateResultStatus(model, filter, 'failed');
        return null;
      }
    } catch (error) {
      console.error(`Error starting job for ${resultKey}:`, error);
      actions.updateResultStatus(model, filter, 'failed');
      return null;
    }
  },
  
  async pollJobStatus(resultKey, model, filter, jobId) {
    // Set up polling interval
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        const data = await response.json();
        
        if (data.status === 'success') {
          const job = data.job;
          
          // Check if job is completed
          if (job.status === 'completed') {
            console.log(`Job completed for ${resultKey}:`, job);
            
            // Update result
            if (data.results && data.results[model]) {
              actions.updateResultStatus(model, filter, 'completed', data.results[model].video);
            } else {
              actions.updateResultStatus(model, filter, 'failed');
            }
            
            // Stop polling
            clearInterval(pollInterval);
            
            // Check if all jobs are completed
            checkAllJobsCompleted();
          } else if (job.status === 'failed') {
            console.error(`Job failed for ${resultKey}:`, job);
            
            // Update result
            actions.updateResultStatus(model, filter, 'failed');
            
            // Stop polling
            clearInterval(pollInterval);
            
            // Check if all jobs are completed
            checkAllJobsCompleted();
          }
        } else {
          console.error(`Failed to get status for ${resultKey}:`, data.message);
          
          // Stop polling after too many failures
          clearInterval(pollInterval);
          actions.updateResultStatus(model, filter, 'failed');
          
          // Check if all jobs are completed
          checkAllJobsCompleted();
        }
      } catch (error) {
        console.error(`Error polling job ${jobId} for ${resultKey}:`, error);
      }
    }, 2000); // Poll every 2 seconds
    
    // Function to check if all jobs are completed
    function checkAllJobsCompleted() {
      const allCompleted = state.processResults.every(result => 
        result.status === 'completed' || result.status === 'failed'
      );
      
      if (allCompleted) {
        actions.setProcessing(false);
      }
    }
  },
  
  async checkJobStatus(jobId) {
    if (!jobId) return;
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error checking job status:', error);
      return null;
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
  processingTimes: computed(() => state.processingTimes),
  hasResults: computed(() => state.processResults.length > 0),
  canProcess: computed(() => state.videoFile && state.selectedModels.length > 0 && 
    state.selectedModels.every(model => state.modelFilters[model] && state.modelFilters[model].length > 0)
  )
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