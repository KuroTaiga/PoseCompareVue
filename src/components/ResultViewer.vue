<template>
    <section class="results-section">
      <h2>Results</h2>
      
      <div class="results-grid">
        <ResultCard 
          v-for="(result, idx) in store.processResults.value" 
          :key="idx"
          :result="result"
        />
      </div>
    </section>
  </template>
  
  <script>
  import { useStore } from '../store';
  import ResultCard from './ResultCard.vue';
  
  export default {
    name: 'ResultViewer',
    components: {
      ResultCard
    },
    setup() {
      const store = useStore();
      
      return {
        store
      };
    }
  };
  </script>
  
  <style scoped>
  .results-section {
    margin-bottom: 32px;
  }
  
  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .results-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>