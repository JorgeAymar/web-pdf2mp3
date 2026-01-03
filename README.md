# Intelligent PDF Reader (PDF to MP3 Converter)

A modern web application to convert PDF documents to audio (MP3) and read them interactively with high-quality neural Spanish voices.

## Features

*   **Interactive Reading**: Select any text in the PDF to listen to it instantly.
*   **Neural Voices**: Multiple Spanish voices (Spain, Mexico, Colombia, etc.) powered by Edge TTS.
*   **Pro App Mode**: Immersive user interface with a "Pro" dark theme, sidebar for the table of contents, and fixed controls.
*   **Personal Library**: Automatically saves your opened books and progress (page, zoom, voice) in your browser. Resume reading instantly!
*   **Smart Index**: Automatically detects outlines or displays a helpful message if none exist.
*   **Audio Download**: Save audio snippets or the full document as MP3.

## Prerequisites

*   **Node.js** (v18 or higher)
*   **Python** (v3.8 or higher)

## Installation and Setup

Follow these steps to run the application locally.

### 1. Backend Setup (Python)

The backend handles PDF text extraction and voice generation.

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server (runs on port 5001)
python app.py
```

### 2. Frontend Setup (React)

The frontend is a React application built with Vite.

```bash
# Open a new terminal and navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev -- --host
```

## Usage

1.  Open your browser at the URL shown in the frontend terminal (usually `http://localhost:5173`).
2.  **Upload a PDF**: Drag and drop a file or click to select one.
3.  **Read and Listen**:
    *   Use the sidebar to navigate the index.
    *   Select text with your mouse and click the floating **"Read"** button.
    *   Click **"📖 Read Page"** to listen to the entire current page.
    *   Change the voice or zoom from the top bar.
    *   Your progress is saved automatically!

## Technologies

*   **Frontend**: React, Vite, PDF.js, CSS Variables (Dark Theme), IndexedDB (Persistence).
*   **Backend**: Flask, PyPDF2/pypdf, Edge TTS (edge-tts).
*   **Testing**: Playwright.
