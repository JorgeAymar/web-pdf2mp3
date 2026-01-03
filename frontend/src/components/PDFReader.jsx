import toast from 'react-hot-toast';
import { saveBookPreferences, getBookPreferences } from '../services/storage';

// ... existing imports ...

const PDFReader = ({ pdfUrl, bookName, onSpeak, onBack }) => {
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

  // Autosave preferences
  useEffect(() => {
    saveBookPreferences(bookName, { pageNumber, scale, voice: selectedVoice });
  }, [pageNumber, scale, selectedVoice, bookName]);


  // ... useEffect ...

  const [hasOutline, setHasOutline] = useState(false);

  function onDocumentLoadSuccess(pdf) {
    setPdfDocument(pdf);
    setNumPages(pdf.numPages);
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

  // ... handler functions ... 

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

      {/* ... rest of the component (Main Content Area, Sidebars, etc) ... */}


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
