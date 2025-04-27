# Video Processing Frontend

A professional, Google-style frontend for the video processing API. This frontend allows users to upload videos, process them with various AI models, and view/download the results.

## Features

- Clean, Google-inspired UI design
- Drag and drop video upload
- Video preview before processing
- Multiple model selection (MediaPipe, 4DHumans, Sapiens)
- Filter options for each model
- Result display with download option
- Responsive design

## Project Setup

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Flask backend running (as provided in the backend code)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/video-processing-frontend.git
   cd video-processing-frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file with your backend API URL
   ```
   VITE_API_URL=http://localhost:5000
   ```

### Development

Start the development server:
```
npm run dev
```

This will start the development server at `http://localhost:3000`

### Build for Production

Build the project for production:
```
npm run build
```

The built files will be in the `dist` directory and can be served by any static file server.

## Project Structure

```
├── public/              # Static assets
├── src/
│   ├── assets/          # CSS and other assets
│   ├── components/      # Vue components
│   ├── App.vue          # Main application component
│   └── main.js          # Application entry point
├── index.html           # HTML template
├── package.json         # Project dependencies and scripts
└── vite.config.js       # Vite configuration
```

## Using the Application

1. **Upload a Video**
   - Click the upload button or drag and drop a video file
   - Preview the video to ensure it's the right one

2. **Select Models**
   - Choose one or more processing models (MediaPipe, 4DHumans, Sapiens variants)
   - For each selected model, choose a filter option (Original, Butterworth, etc.)
   - For Sapiens models, adjust the filter window size as needed

3. **Process the Video**
   - Click "Start Processing" to begin
   - Monitor processing status for each model
   - Once complete, view and download the results

4. **Reset**
   - Click "Reset" to clear all selections and upload a new video

## Working with the Flask Backend

This frontend is designed to work with the provided Flask backend. Ensure the backend is running and accessible at the URL specified in your `.env.local` file.

The backend should have these endpoints available:
- `/api/session` - For session management
- `/api/upload` - For file uploads
- `/api/process` - For processing videos
- `/api/jobs/{job_id}` - For checking job status
