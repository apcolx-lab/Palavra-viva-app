const DB_NAME = 'pv4-reader-db';
const DB_VERSION = 1;

export function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('bookmarks')) {
        db.createObjectStore('bookmarks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('highlights')) {
        db.createObjectStore('highlights', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('state')) {
        db.createObjectStore('state', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLastPosition(bookId, chapter) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('state', 'readwrite');
    const store = tx.objectStore('state');
    store.put({ key: 'lastPosition', bookId, chapter, updatedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getLastPosition() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('state', 'readonly');
    const store = tx.objectStore('state');
    const req = store.get('lastPosition');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function requestStoragePersistence() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    console.log(`Storage persistence granted: ${isPersisted}`);
    return isPersisted;
  }
  return false;
}

export async function getStorageEstimate() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      usageInMB: (estimate.usage / (1024 * 1024)).toFixed(2),
      quotaInMB: (estimate.quota / (1024 * 1024)).toFixed(2)
    };
  }
  return null;
}

export async function exportUserDataJson() {
  const db = await openDb();
  const exportData = {
    app: 'Palavra Viva',
    exportedAt: new Date().toISOString(),
    bookmarks: [],
    highlights: [],
    notes: [],
    state: []
  };

  const stores = ['bookmarks', 'highlights', 'notes', 'state'];
  for (const storeName of stores) {
    const items = await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    exportData[storeName] = items;
  }

  return JSON.stringify(exportData, null, 2);
}

export async function importUserDataJson(jsonString) {
  const data = JSON.parse(jsonString);
  if (!data || data.app !== 'Palavra Viva') {
    throw new Error('Formato de arquivo de backup inválido.');
  }

  const db = await openDb();
  const stores = ['bookmarks', 'highlights', 'notes', 'state'];

  for (const storeName of stores) {
    if (Array.isArray(data[storeName])) {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        for (const item of data[storeName]) {
          store.put(item);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  }
}

export async function clearAllPv4Storage() {
  // Delete indexed DB databases with prefix pv4-
  indexedDB.deleteDatabase(DB_NAME);

  // Clear caches with prefix pv4-
  if ('caches' in window) {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key.startsWith('pv4-')) {
        await caches.delete(key);
      }
    }
  }
}
