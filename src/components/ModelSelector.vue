<template>
    <section class="models-section">
      <h2>Select Models</h2>
      
      <div class="models-grid">
        <!-- MediaPipe -->
        <ModelCard 
          name="MediaPipe"
          model-id="mediapipe"
          :disabled="disabled"
        />
  
        <!-- 4DHumans -->
        <ModelCard 
          name="4DHumans"
          model-id="fourdhumans"
          :disabled="disabled"
        />
  
        <!-- Sapiens Models -->
        <ModelCard 
          v-for="size in ['2b', '1b', '0.6b', '0.3b']" 
          :key="size"
          :name="`Sapiens ${size}`"
          :model-id="`sapiens_${size}`"
          :disabled="disabled"
          :show-filter-window="true"
        />
      </div>
  
      <div class="process-controls">
        <button 
          class="btn primary-btn process-btn"
          @click="startProcessing"
          :disabled="!store.canProcess.value || disabled"
        >
          <span v-if="store.isProcessing.value" class="spinner"></span>
          {{ store.isProcessing.value ? 'Processing...' : 'Start Processing' }}
        </button>
      </div>
    </section>
  </template>
  
  <script>
  import { useStore } from '../store';
  import ModelCard from './ModelCard.vue';
  
  export default {
    name: 'ModelSelector',
    components: {
      ModelCard
    },
    props: {
      disabled: {
        type: Boolean,
        default: false
      }
    },
    emits: ['process-started'],
    setup(props, { emit }) {
      const store = useStore();
  
      const startProcessing = async () => {
        if (!store.canProcess.value || store.isProcessing.value) return;
        
        const jobId = await store.api.startProcessing();
        
        if (jobId) {
          emit('process-started', jobId);
          
          // Start polling for job status
          const statusInterval = setInterval(async () => {
            const result = await store.api.checkJobStatus();
            
            // If job is completed or failed, stop polling
            if (result !== null) {
              clearInterval(statusInterval);
            }
          }, 2000);
        }
      };
      
      return {
        store,
        startProcessing
      };
    }
  };
  </script>
  
  <style scoped>
  .models-section {
    margin-bottom: 32px;
  }
  
  .models-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .process-controls {
    display: flex;
    justify-content: center;
    padding: 16px 0;
  }
  
  .process-btn {
    padding: 8px 24px;
    font-size: 16px;
    min-width: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Button styles */
  .primary-btn {
    color: white;
    background-color: var(--primary-color);
  }
  
  .primary-btn:hover:not([disabled]) {
    background-color: var(--primary-hover);
  }
  
  /* Spinner */
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s linear infinite;
    margin-right: 8px;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .models-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>