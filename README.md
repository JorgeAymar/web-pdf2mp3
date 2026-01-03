# Lector PDF Inteligente (PDF to MP3 Converter)

Una aplicación web moderna para convertir documentos PDF a audio (MP3) y leerlos de manera interactiva con voces neuronales en español de alta calidad.

## Características

*   **Lectura Interactiva**: Selecciona cualquier texto del PDF para escucharlo al instante.
*   **Voces Neuronales**: Múltiples voces en español (España, México, Colombia, etc.) impulsadas por Edge TTS.
*   **Modo Aplicación**: Interfaz de usuario inmersiva con tema oscuro "Pro", barra lateral para el índice y controles fijos.
*   **Zoom y Navegación**: Control total sobre el tamaño del documento y navegación por páginas.
*   **Descarga de Audio**: Guarda fragmentos de audio o el documento completo como MP3.

## Requisitos Previos

*   **Node.js** (v18 o superior)
*   **Python** (v3.8 o superior)

## Instalación y Configuración

Sigue estos pasos para ejecutar la aplicación en tu entorno local.

### 1. Configuración del Backend (Python)

El backend maneja la extracción de texto del PDF y la generación de voz.

```bash
cd backend

# Crear un entorno virtual
python -m venv venv

# Activar el entorno virtual
# En macOS/Linux:
source venv/bin/activate
# En Windows:
# venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar el servidor (corre en el puerto 5001)
python app.py
```

### 2. Configuración del Frontend (React)

El frontend es una aplicación React construida con Vite.

```bash
# Abrir una nueva terminal y navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev -- --host
```

## Uso

1.  Abre tu navegador en la URL que muestra la terminal del frontend (usualmente `http://localhost:5173`).
2.  **Sube un PDF**: Arrastra un archivo o haz clic para seleccionarlo.
3.  **Lee y Escucha**:
    *   Usa el panel lateral para navegar por el índice.
    *   Selecciona texto con el mouse y haz clic en el botón flotante **"Leer"**.
    *   Cambia la voz o el zoom desde la barra superior.
    *   Descarga el audio generado con el botón de flecha junto al control de reproducción.

## Tecnologías

*   **Frontend**: React, Vite, PDF.js, CSS Variables (Dark Theme).
*   **Backend**: Flask, PyPDF2/pypdf, Edge TTS (edge-tts).
*   **Testing**: Playwright.
