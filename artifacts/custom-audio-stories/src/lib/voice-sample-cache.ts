/**
 * Client-side voice sample cache using IndexedDB
 * Fetches samples once and caches them locally for instant playback
 */

const DB_NAME = "VoiceSampleCache";
const DB_VERSION = 1;
const STORE_NAME = "samples";

interface CachedSample {
  voiceId: string;
  data: ArrayBuffer;
  timestamp: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "voiceId" });
      }
    };
  });

  return dbPromise;
}

export async function getCachedSampleUrl(voiceId: string, basePath: string): Promise<string> {
  try {
    const db = await getDatabase();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(voiceId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          // Return cached blob URL
          const blob = new Blob([request.result.data], { type: "audio/mpeg" });
          const blobUrl = URL.createObjectURL(blob);
          resolve(blobUrl);
        } else {
          // Not cached, return API URL (will be fetched and cached on play)
          resolve(`${basePath}voice-samples/${voiceId}.mp3`);
        }
      };
    });
  } catch (err) {
    console.warn("Failed to check cache:", err);
    // Fallback to API URL
    return `${basePath}voice-samples/${voiceId}.mp3`;
  }
}

export async function cacheSampleFromUrl(voiceId: string, url: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.arrayBuffer();
    const db = await getDatabase();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.put({
        voiceId,
        data,
        timestamp: Date.now(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (err) {
    console.warn(`Failed to cache sample ${voiceId}:`, err);
    // Silent fail - playback will still work via API
  }
}

export async function clearCache(): Promise<void> {
  try {
    const db = await getDatabase();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (err) {
    console.warn("Failed to clear cache:", err);
  }
}

export async function getCacheSize(): Promise<number> {
  try {
    const db = await getDatabase();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const totalBytes = request.result.reduce(
          (sum, item) => sum + (item.data?.byteLength || 0),
          0
        );
        resolve(totalBytes);
      };
    });
  } catch (err) {
    console.warn("Failed to get cache size:", err);
    return 0;
  }
}
