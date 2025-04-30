<template>
    <section class="upload-section">
      <h2>Upload Video</h2>
      
      <div 
        class="upload-area" 
        :class="{ 'drag-over': isDragging }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
        v-if="!store.videoFile.value"
      >
        <div class="upload-content">
          <input 
            type="file" 
            ref="fileInput" 
            @change="onFileSelected" 
            accept="video/mp4,video/avi,video/mov,video/webm"
            class="hidden"
          />
          <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
          </svg>
          <p class="upload-text">Drag video here or <span class="browse-text" @click="triggerFileUpload">browse</span></p>
          <p class="upload-note">Supported formats: MP4, AVI, MOV, WEBM</p>
        </div>
      </div>
  
      <!-- Video Preview -->
      <div v-if="store.videoFile.value" class="video-preview">
        <h3>{{ store.videoFile.value.name }}</h3>
        <video ref="videoPreview" controls>
          <source :src="store.videoUrl.value" :type="store.videoFile.value.type">
          Your browser does not support the video tag.
        </video>
        <button 
          class="btn secondary-btn" 
          @click="removeVideo" 
          :disabled="disabled"
        >
          Remove
        </button>
      </div>
    </section>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { useStore } from '../store';
  
  export default {
    name: 'VideoUploader',
    props: {
      disabled: {
        type: Boolean,
        default: false
      }
    },
    emits: ['video-uploaded'],
    setup(props, { emit }) {
      const store = useStore();
      const fileInput = ref(null);
      const isDragging = ref(false);
      
      // Initialize session
      store.api.initializeSession();
  
      // Methods
      const triggerFileUpload = () => {
        fileInput.value.click();
      };
      
      const onDragOver = () => {
        isDragging.value = true;
      };
      
      const onDragLeave = () => {
        isDragging.value = false;
      };
      
      const onDrop = (event) => {
        isDragging.value = false;
        const files = event.dataTransfer.files;
        if (files.length > 0) {
          handleFile(files[0]);
        }
      };
      
      const onFileSelected = (event) => {
        const files = event.target.files;
        if (files.length > 0) {
          handleFile(files[0]);
        }
      };
      
      const handleFile = async (file) => {
        // Validate file type
        const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm'];
        if (!validTypes.includes(file.type)) {
          alert('Please select a valid video file (MP4, AVI, MOV, or WEBM).');
          return;
        }
        
        // Validate file size (max 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
          alert('File size exceeds the 100MB limit.');
          return;
        }
        
        // Set file and create object URL
        const url = URL.createObjectURL(file);
        store.setVideoFile(file, url);
        
        // Upload the file to the server
        const uploadId = await store.api.uploadFile(file);
        
        if (uploadId) {
          emit('video-uploaded', uploadId);
        }
      };
      
      const removeVideo = () => {
        if (props.disabled) return;
        store.clearVideo();
      };
      
      return {
        store,
        fileInput,
        isDragging,
        triggerFileUpload,
        onDragOver,
        onDragLeave,
        onDrop,
        onFileSelected,
        removeVideo
      };
    }
  };
  </script>
  
  <style scoped>
  .upload-section {
    margin-bottom: 32px;
  }
  
  /* Upload area */
  .upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 8px;
    padding: 32px;
    text-align: center;
    background-color: var(--card-background);
    transition: all 0.2s ease;
  }
  
  .upload-area.drag-over {
    border-color: var(--primary-color);
    background-color: rgba(66, 133, 244, 0.05);
  }
  
  .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .upload-icon {
    width: 48px;
    height: 48px;
    color: var(--primary-color);
    margin-bottom: 16px;
  }
  
  .upload-text {
    font-size: 16px;
    margin-bottom: 8px;
  }
  
  .browse-text {
    color: var(--primary-color);
    cursor: pointer;
    text-decoration: underline;
  }
  
  .upload-note {
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  .hidden {
    display: none;
  }
  
  /* Video preview */
  .video-preview {
    background-color: var(--card-background);
    border-radius: 8px;
    padding: 16px;
    box-shadow: var(--shadow-sm);
  }
  
  .video-preview h3 {
    font-size: 16px;
    margin-bottom: 16px;
    font-weight: 500;
  }
  
  .video-preview video {
    width: 100%;
    max-height: 400px;
    border-radius: 4px;
    background-color: #000;
    margin-bottom: 16px;
  }
  
  /* Button styles */
  .secondary-btn {
    color: var(--secondary-color);
    background-color: transparent;
    border: 1px solid var(--border-color);
  }
  
  .secondary-btn:hover:not([disabled]) {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .upload-area {
      padding: 24px 16px;
    }
  }
  </style>