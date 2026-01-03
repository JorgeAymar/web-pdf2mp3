import { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type !== "application/pdf") {
      alert("Por favor sube un archivo PDF válido.");
      return;
    }
    onFileSelect(file);
  };

  return (
    <div 
      className={`upload-card ${dragActive ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
    >
      <input 
        ref={inputRef}
        type="file" 
        className="file-input" 
        onChange={handleChange} 
        accept=".pdf"
      />
      
      <div className="upload-content">
        <div className="upload-icon">📄</div>
        <h3>Suelta tu PDF aquí</h3>
        <p>o haz clic para buscar</p>
      </div>
    </div>
  );
};

export default FileUpload;
