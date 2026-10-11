// db.js - IndexedDB storage engine for LuminaLens Photo Album
const DB_NAME = 'LuminaPhotoStudioDB';
const DB_VERSION = 1;

class PhotoDB {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Photos Store
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
          photoStore.createIndex('createdAt', 'createdAt', { unique: false });
          photoStore.createIndex('favorite', 'favorite', { unique: false });
        }

        // Albums Store
        if (!db.objectStoreNames.contains('albums')) {
          const albumStore = db.createObjectStore('albums', { keyPath: 'id' });
          albumStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getAllPhotos() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('photos', 'readonly');
      const store = tx.objectStore('photos');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getPhoto(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('photos', 'readonly');
      const store = tx.objectStore('photos');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async savePhoto(photo) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('photos', 'readwrite');
      const store = tx.objectStore('photos');
      const request = store.put(photo);
      request.onsuccess = () => resolve(photo);
      request.onerror = () => reject(request.error);
    });
  }

  async savePhotos(photos) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('photos', 'readwrite');
      const store = tx.objectStore('photos');
      photos.forEach(p => store.put(p));
      tx.oncomplete = () => resolve(photos);
      tx.onerror = () => reject(tx.error);
    });
  }

  async updatePhoto(id, updates) {
    await this.init();
    return new Promise(async (resolve, reject) => {
      const photo = await this.getPhoto(id);
      if (!photo) return reject(new Error('Photo not found'));
      const updated = { ...photo, ...updates, updatedAt: Date.now() };
      const tx = this.db.transaction('photos', 'readwrite');
      const store = tx.objectStore('photos');
      const request = store.put(updated);
      request.onsuccess = () => resolve(updated);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePhoto(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('photos', 'readwrite');
      const store = tx.objectStore('photos');
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAlbums() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('albums', 'readonly');
      const store = tx.objectStore('albums');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getAlbum(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('albums', 'readonly');
      const store = tx.objectStore('albums');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveAlbum(album) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('albums', 'readwrite');
      const store = tx.objectStore('albums');
      const request = store.put(album);
      request.onsuccess = () => resolve(album);
      request.onerror = () => reject(request.error);
    });
  }

  async saveAlbums(albums) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('albums', 'readwrite');
      const store = tx.objectStore('albums');
      albums.forEach(a => store.put(a));
      tx.oncomplete = () => resolve(albums);
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteAlbum(id) {
    await this.init();
    return new Promise(async (resolve, reject) => {
      const photos = await this.getAllPhotos();
      const updatedPhotos = photos.map(p => {
        if (p.albumIds && p.albumIds.includes(id)) {
          return { ...p, albumIds: p.albumIds.filter(aid => aid !== id) };
        }
        return p;
      });
      await this.savePhotos(updatedPhotos);

      const tx = this.db.transaction('albums', 'readwrite');
      const store = tx.objectStore('albums');
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async hasSeeded() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get('hasSeededInitialData');
      request.onsuccess = () => resolve(!!request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  async markSeeded() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const request = store.put({ key: 'hasSeededInitialData', value: true });
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['photos', 'albums', 'settings'], 'readwrite');
      tx.objectStore('photos').clear();
      tx.objectStore('albums').clear();
      tx.objectStore('settings').clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
}

window.photoDB = new PhotoDB();
