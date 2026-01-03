import { useState, useRef, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import PDFReader from './components/PDFReader';
import { Toaster, toast } from 'react-hot-toast';
import { saveBookToLibrary, getLibrary, getBookFile } from './services/storage';
import './App.css';

function App() {
  const [viewMode, setViewMode] = useState('upload'); // 'upload' | 'reader'
  const [currentFile, setCurrentFile] = useState(null); // File object or Blob
  const [currentBookMeta, setCurrentBookMeta] = useState(null); // Metadata for persistence
  const [recentBooks, setRecentBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef(new Audio());

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    const books = await getLibrary();
    setRecentBooks(books);
  };

  const handleFileSelect = async (file) => {
    setIsLoading(true);
    try {
      // Save to local library
      const meta = await saveBookToLibrary(file);
      await loadLibrary(); // Refresh list
      
      openBook(file, meta);
      toast.success('Documento guardado en biblioteca');
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRecent = async (bookMeta) => {
    setIsLoading(true);
    try {
      console.log("Attempting to open:", bookMeta);
      const fileBlob = await getBookFile(bookMeta.fileKey);
      
      if (!fileBlob) {
        console.warn("File blob not found for key:", bookMeta.fileKey);
        toast.error('El archivo no se encuentra. Eliminando de la lista...');
        
        // Self-healing: Remove broken entry
        await removeBookFromLibrary(bookMeta.id);
        await loadLibrary();
        return;
      }
      
      openBook(fileBlob, bookMeta);
    } catch (err) {
      console.error("Error opening recent book:", err);
      toast.error('Error al abrir el libro.');
    } finally {
      setIsLoading(false);
    }
  };

  const openBook = (file, meta) => {
    setCurrentFile(file);
    setCurrentBookMeta(meta);
    setViewMode('reader');
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
    setCurrentBookMeta(null);
    loadLibrary(); // Refresh in case of changes
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
            {!isLoading && (
              <>
                <FileUpload onFileSelect={handleFileSelect} />
                
                {recentBooks.length > 0 && (
                  <div className="recent-books-section">
                    <h3>📚 Biblioteca Reciente</h3>
                    <div className="recent-grid">
                      {recentBooks.map(book => (
                        <div key={book.id} className="book-card" onClick={() => handleOpenRecent(book)}>
                          <div className="book-icon">📄</div>
                          <div className="book-info">
                            <span className="book-name">{book.name.replace('.pdf', '')}</span>
                            <span className="book-date">
                              {new Date(book.lastOpened).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {isLoading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Abriendo documento...</p>
              </div>
            )}
          </main>
        </>
      )}

      {viewMode === 'reader' && pdfUrl && (
        <PDFReader 
          pdfUrl={pdfUrl} 
          bookName={currentBookMeta?.name || 'unknown'}
          onSpeak={handleSpeakText} 
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;
