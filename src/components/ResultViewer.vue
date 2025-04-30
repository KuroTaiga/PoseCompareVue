<template>
  <section class="results-section">
    <h2>Results</h2>
    
    <div class="results-summary" v-if="hasAnyCompleted">
      <div class="summary-item">
        <span class="summary-label">Completed:</span>
        <span class="summary-value">{{ completedCount }} of {{ totalCount }}</span>
      </div>
      <div class="summary-item" v-if="hasAnyProcessingTime">
        <span class="summary-label">Average Processing Time:</span>
        <span class="summary-value">{{ averageProcessingTime }}</span>
      </div>
    </div>
    
    <div class="results-grid">
      <ResultCard 
        v-for="result in sortedResults" 
        :key="`${result.model}_${result.filter}`"
        :result="result"
        class="result-card-wrapper"
      />
    </div>
  </section>
</template>

<script>
import { computed } from 'vue';
import { useStore } from '../store';
import ResultCard from './ResultCard.vue';

export default {
  name: 'ResultViewer',
  components: {
    ResultCard
  },
  setup() {
    const store = useStore();
    
    // Sort results - completed first, then pending, then failed
    const sortedResults = computed(() => {
      const results = [...store.processResults.value];
      return results.sort((a, b) => {
        // Status priority: completed > pending > failed
        const statusPriority = { 'completed': 0, 'pending': 1, 'failed': 2 };
        return statusPriority[a.status] - statusPriority[b.status];
      });
    });
    
    // Calculate stats for summary
    const totalCount = computed(() => store.processResults.value.length);
    
    const completedCount = computed(() => 
      store.processResults.value.filter(result => result.status === 'completed').length
    );
    
    const hasAnyCompleted = computed(() => completedCount.value > 0);
    
    const hasAnyProcessingTime = computed(() => {
      return store.processResults.value.some(result => 
        result.processingTime !== null && result.processingTime !== undefined
      );
    });
    
    const averageProcessingTime = computed(() => {
      const completedResults = store.processResults.value.filter(
        result => result.status === 'completed' && result.processingTime !== null
      );
      
      if (completedResults.length === 0) return '0 seconds';
      
      const totalTime = completedResults.reduce(
        (sum, result) => sum + result.processingTime, 0
      );
      
      const avgTime = totalTime / completedResults.length;
      
      // Format nice time string
      if (avgTime < 60) {
        return `${avgTime.toFixed(1)} seconds`;
      }
      
      const minutes = Math.floor(avgTime / 60);
      const seconds = Math.round(avgTime % 60);
      
      return `${minutes} min ${seconds} sec`;
    });
    
    return {
      store,
      sortedResults,
      totalCount,
      completedCount,
      hasAnyCompleted,
      hasAnyProcessingTime,
      averageProcessingTime
    };
  }
};
</script>

<style scoped>
.results-section {
  margin-bottom: 32px;
}

.results-summary {
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  box-shadow: var(--shadow-sm);
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.summary-value {
  font-size: 16px;
  font-weight: 500;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.result-card-wrapper {
  height: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .results-summary {
    flex-direction: column;
    gap: 12px;
  }
}
</style>