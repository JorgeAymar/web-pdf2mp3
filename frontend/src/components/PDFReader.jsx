import { useState, useEffect } from 'react';
import { Document, Page, pdfjs, Outline } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import './PDFReader.css';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFReader = ({ pdfUrl, onSpeak, onBack }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [selection, setSelection] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scale, setScale] = useState(1.2);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('es-ES-AlvaroNeural');
  const [audioUrl, setAudioUrl] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5001/api/voices')
      .then(res => res.json())
      .then(data => setVoices(data))
      .catch(err => console.error("Error fetching voices:", err));
  }, []);

  const [hasOutline, setHasOutline] = useState(false);

  function onDocumentLoadSuccess(pdf) {
    setNumPages(pdf.numPages);
    pdf.getOutline().then(outline => {
      setHasOutline(outline && outline.length > 0);
    }).catch(() => setHasOutline(false));
  }


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
      // Don't clear selection immediately if we are interacting with tooltip
      // But for simplicity, we might. 
      // Let's rely on standard behavior first.
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
    
    // Don't clear selection so user can download
    // window.getSelection().removeAllRanges(); 
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
            className="pdf-document"
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={true} 
              renderAnnotationLayer={false}
              scale={scale}
            />
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
