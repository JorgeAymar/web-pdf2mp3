import { get, set, keys, del } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

const METADATA_KEY = 'pdf_library_metadata';

// --- Library Management ---

export async function saveBookToLibrary(file) {
  // Generate a unique ID for the file if it doesn't have one (or use name as distinct enough for now)
  const bookId = uuidv4(); 
  const timestamp = Date.now();
  
  const metadataItem = {
    id: bookId,
    name: file.name,
    type: file.type,
    lastOpened: timestamp,
    // Store file content in a separate key to avoid loading all heavy blobs when listing
    fileKey: `book_file_${bookId}` 
  };

  // Save the heavy file blob
  await set(metadataItem.fileKey, file);

  // Update central metadata list
  const currentLibrary = (await get(METADATA_KEY)) || [];
  
  // Remove duplicates by name if existing (update timestamp)
  const filtered = currentLibrary.filter(item => item.name !== file.name);
  filtered.unshift(metadataItem); // Add to top
  
  await set(METADATA_KEY, filtered);

  return metadataItem;
}

export async function getLibrary() {
  return (await get(METADATA_KEY)) || [];
}

export async function getBookFile(fileKey) {
  return await get(fileKey);
}

export async function removeBookFromLibrary(bookId) {
  const currentLibrary = (await get(METADATA_KEY)) || [];
  const bookToDelete = currentLibrary.find(item => item.id === bookId);
  
  if (bookToDelete) {
    // Delete the file content
    await del(bookToDelete.fileKey);
    
    // Update metadata list
    const updatedLibrary = currentLibrary.filter(item => item.id !== bookId);
    await set(METADATA_KEY, updatedLibrary);
  }
}

// --- Preferences (Page, Zoom, Voice) ---

export function saveBookPreferences(bookName, prefs) {
  try {
    const allPrefs = JSON.parse(localStorage.getItem('book_prefs') || '{}');
    allPrefs[bookName] = { ...allPrefs[bookName], ...prefs, lastUpdated: Date.now() };
    localStorage.setItem('book_prefs', JSON.stringify(allPrefs));
  } catch (e) {
    console.error("Error saving preferences:", e);
  }
}

export function getBookPreferences(bookName) {
  try {
    const allPrefs = JSON.parse(localStorage.getItem('book_prefs') || '{}');
    return allPrefs[bookName] || {};
  } catch (e) {
    console.error("Error reading preferences:", e);
    return {};
  }
}
