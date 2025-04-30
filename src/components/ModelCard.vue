<template>
  <div class="model-card">
    <div class="model-header">
      <button 
        class="model-toggle"
        :class="{ 'selected': isSelected }"
        @click="toggleModel"
        :disabled="disabled"
      >
        <span class="toggle-icon">{{ isSelected ? '✓' : '+' }}</span>
        {{ name }}
      </button>
    </div>
    
    <div class="model-body" v-if="isSelected">
      <h4>Filter Options</h4>
      <p class="helper-text">Select one or more filters to apply</p>
      <div class="filter-options">
        <button 
          v-for="filter in store.filterOptions.value" 
          :key="filter"
          class="filter-btn" 
          :class="{ 'selected': isFilterSelected(filter) }"
          @click="toggleFilter(filter)"
          :disabled="disabled"
        >
          {{ formatFilterName(filter) }}
        </button>
      </div>
      
      <div v-if="showFilterWindow" class="filter-window">
        <label>Filter Window Size: {{ store.filterWindowSize.value }}</label>
        <input 
          type="range" 
          min="1" 
          max="15" 
          step="2"
          :value="store.filterWindowSize.value"
          @input="updateFilterWindow"
          :disabled="disabled"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from '../store';

export default {
  name: 'ModelCard',
  props: {
    name: {
      type: String,
      required: true
    },
    modelId: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showFilterWindow: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const store = useStore();
    
    const isSelected = computed(() => {
      return store.selectedModels.value.includes(props.modelId);
    });
    
    const isFilterSelected = (filter) => {
      return store.modelFilters.value[props.modelId] && 
        store.modelFilters.value[props.modelId].includes(filter);
    };
    
    const toggleModel = () => {
      if (props.disabled) return;
      store.toggleModel(props.modelId);
    };
    
    const toggleFilter = (filter) => {
      if (props.disabled) return;
      store.toggleModelFilter(props.modelId, filter);
    };
    
    const updateFilterWindow = (event) => {
      if (props.disabled) return;
      store.setFilterWindowSize(parseInt(event.target.value));
    };
    
    const formatFilterName = (filter) => {
      return filter.charAt(0).toUpperCase() + filter.slice(1);
    };
    
    return {
      store,
      isSelected,
      isFilterSelected,
      toggleModel,
      toggleFilter,
      updateFilterWindow,
      formatFilterName
    };
  }
};
</script>

<style scoped>
.model-card {
  background-color: var(--card-background);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.model-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.model-toggle {
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
}

.model-toggle.selected {
  color: var(--primary-color);
}

.model-toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  font-weight: bold;
  border-radius: 50%;
  color: var(--card-background);
}

.selected .toggle-icon {
  background-color: var(--primary-color);
}

.model-toggle:not(.selected) .toggle-icon {
  background-color: var(--secondary-color);
}

.model-body {
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.02);
}

.model-body h4 {
  font-size: 14px;
  margin-bottom: 4px;
  font-weight: 500;
  color: var(--text-secondary);
}

.helper-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-btn {
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover:not([disabled]) {
  background-color: rgba(0, 0, 0, 0.05);
}

.filter-btn.selected {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.filter-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filter-window {
  margin-top: 16px;
}

.filter-window label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

.filter-window input[type="range"] {
  width: 100%;
}
</style>