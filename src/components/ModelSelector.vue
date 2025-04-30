<template>
  <section class="models-section">
    <h2>Select Models and Filters</h2>
    
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
      <div class="process-status" v-if="processingStats.total > 0">
        <div class="progress-bar-container">
          <div 
            class="progress-bar" 
            :style="{ width: `${processingStats.completionPercentage}%` }"
            :class="{ 'progress-complete': processingStats.isComplete }"
          ></div>
        </div>
        <div class="progress-text">
          {{ processingStats.completed }} of {{ processingStats.total }} completed
        </div>
      </div>
      
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
import { computed } from 'vue';
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

    // Calculate processing stats
    const processingStats = computed(() => {
      const results = store.processResults.value;
      const total = results.length;
      const completed = results.filter(r => r.status === 'completed' || r.status === 'failed').length;
      const isComplete = completed === total && total > 0;
      const completionPercentage = total > 0 ? (completed / total) * 100 : 0;
      
      return {
        total,
        completed,
        isComplete,
        completionPercentage
      };
    });

    const startProcessing = async () => {
      if (!store.canProcess.value || store.isProcessing.value) return;
      
      const success = await store.api.startProcessing();
      
      if (success) {
        emit('process-started');
      }
    };
    
    return {
      store,
      processingStats,
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
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.process-status {
  width: 100%;
  max-width: 600px;
  margin-bottom: 16px;
}

.progress-bar-container {
  height: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  margin-bottom: 8px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-bar.progress-complete {
  background-color: var(--success-color);
}

.progress-text {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
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