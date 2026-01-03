import { useState, useRef } from 'react';
import FileUpload from './components/FileUpload';
import AudioPlayer from './components/AudioPlayer';
import PDFReader from './components/PDFReader';
import { Toaster, toast } from 'react-hot-toast';
import './App.css';

function App() {
  const [viewMode, setViewMode] = useState('upload'); // 'upload' | 'reader'
  const [currentFile, setCurrentFile] = useState(null); // URL for PDF viewing
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Audio ref to play snippets automatically
  const audioRef = useRef(new Audio());

  const handleFileSelect = async (file) => {
    setIsLoading(true);
    setAudioUrl(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Direct access to reader mode without upload
      setCurrentFile(file);
      setViewMode('reader');
      toast.success('Documento cargado correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakText = async (text, voice) => {
    try {
      const response = await fetch('http://localhost:5001/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) throw new Error('Speech generation failed');

      const data = await response.json();
      const audioSrc = `http://localhost:5001${data.download_url}`;
      
      // Play immediately
      audioRef.current.src = audioSrc;
      audioRef.current.play();
      
      return audioSrc;
    } catch (err) {
      console.error(err);
      toast.error("Error generando audio: " + err.message);
    }
  };

  const handleBack = () => {
    setViewMode('upload');
    setCurrentFile(null);
    setAudioUrl(null);
  }

  return (
    <div className={viewMode === 'upload' ? "app-container" : "app-reader-mode"}>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      
      {viewMode === 'upload' && (
        <>
          <header>
            <h1>Lector de PDF (Español)</h1>
            <p>Sube un documento y selecciona texto para escuchar</p>
          </header>

          <main className="glass-panel main-content">
            {!isLoading && <FileUpload onFileSelect={handleFileSelect} />}
            
            {isLoading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Procesando documento...</p>
              </div>
            )}
          </main>
        </>
      )}

      {viewMode === 'reader' && currentFile && (
        <PDFReader 
          pdfUrl={URL.createObjectURL(currentFile)} 
          onSpeak={handleSpeakText} 
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;
