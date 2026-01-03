import { useState, useEffect } from 'react';
import { Document, Page, pdfjs, Outline } from 'react-pdf';
import toast from 'react-hot-toast';
import { saveBookPreferences, getBookPreferences } from '../services/storage';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import './PDFReader.css';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFReader = ({ pdfUrl, bookName, onSpeak, onBack, onConvert }) => {
  const defaults = getBookPreferences(bookName);
  
  const [numPages, setNumPages] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageNumber, setPageNumber] = useState(defaults.pageNumber || 1);
  const [selection, setSelection] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scale, setScale] = useState(defaults.scale || 1.2);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(defaults.voice || 'es-ES-AlvaroNeural');
  const [audioUrl, setAudioUrl] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [hasOutline, setHasOutline] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5001/api/voices')
      .then(res => res.json())
      .then(data => setVoices(data))
      .catch(err => console.error("Error fetching voices:", err));
  }, []);

  // Autosave preferences
  useEffect(() => {
    saveBookPreferences(bookName, { pageNumber, scale, voice: selectedVoice });
  }, [pageNumber, scale, selectedVoice, bookName]);

  function onDocumentLoadSuccess(pdf) {
    setPdfDocument(pdf);
    setNumPages(pdf.numPages);
    
    // Validate page number from persistence
    if (pageNumber > pdf.numPages) {
      setPageNumber(1);
      toast.error(`La página guardada (${pageNumber}) no existe. Volviendo a página 1.`);
    }

    pdf.getOutline().then(outline => {
      setHasOutline(outline && outline.length > 0);
    }).catch(() => setHasOutline(false));
  }

  const handleReadPage = async () => {
    if (!pdfDocument || isPlaying) return;

    try {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');

      if (!text.trim()) {
        toast.error("No se encontró texto en esta página");
        return;
      }

      setIsPlaying(true);
      const url = await onSpeak(text, selectedVoice);
      setAudioUrl(url);
      setIsPlaying(false);
    } catch (error) {
      console.error("Error reading page:", error);
      toast.error("Error al leer la página");
      setIsPlaying(false);
    }
  };

  const handleSelection = () => {
    const selectedText = window.getSelection().toString();
    if (selectedText && selectedText.trim().length > 0) {
      const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
      setSelection({
        text: selectedText,
        x: rect.x + rect.width / 2,
        y: rect.y
      });
      setAudioUrl(null); // Reset audio when new selection
    } else {
      // Allow slight delay or user click to clear
    }
  };

  const speakSelection = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selection) return;
    
    setIsPlaying(true);
    const url = await onSpeak(selection.text, selectedVoice);
    setAudioUrl(url);
    setIsPlaying(false);
  };

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (audioUrl) {
      window.open(audioUrl, '_blank');
    }
  };

  const adjustZoom = (delta) => {
    setScale(prev => Math.max(0.6, Math.min(3.0, prev + delta)));
  };

  const handleOutlineClick = ({ pageNumber }) => {
    setPageNumber(pageNumber);
  };

  return (
    <div className="reader-shell" onMouseUp={handleSelection}>
      {/* Top Bar - Controls */}
      <header className="top-bar">
        <div className="toolbar-group">
          <button className="btn-secondary" onClick={onBack}>
            ← Volver
          </button>
          <button 
            className="btn-icon" 
            onClick={() => setShowSidebar(!showSidebar)}
            title="Alternar Índice"
            style={{ opacity: showSidebar ? 1 : 0.6 }}
          >
            📋
          </button>
        </div>

        <div className="toolbar-group">
          <div className="pagination">
            <button 
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(prev => prev - 1)}
            >
              ◀
            </button>
            <span style={{ minWidth: '60px', textAlign: 'center' }}>
              {pageNumber} / {numPages || '--'}
            </span>
            <button 
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(prev => prev + 1)}
            >
              ▶
            </button>
          </div>
          
          <div className="toolbar-divider"></div>

          <div className="zoom-controls">
            <button onClick={() => adjustZoom(-0.2)}>➖</button>
            <span style={{ minWidth: '45px', textAlign: 'center', display: 'inline-block' }}>
              {Math.round(scale * 100)}%
            </span>
            <button onClick={() => adjustZoom(0.2)}>➕</button>
          </div>
        </div>

        <div className="toolbar-group">
          <button 
            className="btn-primary-action" 
            onClick={handleReadPage}
            disabled={isPlaying}
            title="Leer página completa"
          >
            {isPlaying ? '🔊 ...' : '📖 Leer Página'}
          </button>
          
           <button 
            className="btn-primary-action" 
            onClick={onConvert}
            title="Descargar libro entero"
            style={{ marginLeft: '0.5rem', background: 'rgba(100, 255, 100, 0.1)', color: '#8f8' }}
          >
            💿 MP3
          </button>

          <div className="toolbar-divider"></div>

          <select 
            className="voice-select" 
            value={selectedVoice} 
            onChange={(e) => setSelectedVoice(e.target.value)}
          >
            {voices.map(voice => (
              <option key={voice.id} value={voice.id}>{voice.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="content-wrapper">
        
        {/* Sidebar */}
        {showSidebar && (
          <aside className="sidebar">
            <h3>Índice</h3>
            <div className="outline-content">
              {hasOutline ? (
                <Document file={pdfUrl}>
                  <Outline onItemClick={handleOutlineClick} className="custom-outline" />
                </Document>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic', padding: '1rem' }}>
                  Este documento no contiene un índice interactivo.
                </p>
              )}
            </div>
          </aside>
        )}

        {/* PDF Document */}
        <div className="document-container">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => {
              console.error("Error loading PDF:", error);
              toast.error("Error al cargar el PDF: " + error.message);
            }}
            loading={<div style={{padding: '2rem', color: '#888'}}>Cargando documento...</div>}
            error={<div style={{padding: '2rem', color: '#ff6b6b'}}>Error al cargar el PDF. Intente de nuevo.</div>}
            className="pdf-document"
          >
            {numPages && (
              <Page 
                pageNumber={Math.min(pageNumber, numPages)} 
                renderTextLayer={true} 
                renderAnnotationLayer={false}
                scale={scale}
                onRenderError={(error) => console.error("Error rendering page:", error)}
              />
            )}
          </Document>
        </div>
      </div>

      {selection && (
        <div 
          className="speak-tooltip"
          style={{ 
            top: selection.y - 60 + window.scrollY, 
            left: selection.x 
          }}
          onMouseDown={(e) => e.stopPropagation()} // Prevent clearing selection
          onMouseUp={(e) => e.stopPropagation()}
        >
          <button 
            className="btn-primary speak-btn" 
            onClick={speakSelection}
            disabled={isPlaying}
          >
            {isPlaying ? '🔊 ...' : '🗣️ Leer'}
          </button>
          
          {audioUrl && (
            <button 
              className="btn-success download-btn" 
              onClick={handleDownload}
              title="Descargar MP3"
            >
              ⬇️
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFReader;
