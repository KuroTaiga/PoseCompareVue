import { createApp } from 'vue'
import App from './main.js'

// Import global styles
import './assets/styles.css'

// Create and mount Vue app
const app = createApp(App)
app.mount('#app')