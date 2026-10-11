// api.js - Client-Side REST API Service for LuminaLens Web Application
(function(global) {
  'use strict';

  const TOKEN_KEY = 'luminalens_jwt_token';
  const USER_KEY = 'luminalens_user_data';

  class ApiService {
    constructor() {
      // If served directly from Node backend (port 8085) or reverse proxy, use relative path.
      // If served via external dev server (e.g. port 5500, 3000), target localhost:8085.
      if (typeof window !== 'undefined' && window.location) {
        const port = window.location.port;
        this.baseUrl = (port === '8085' || port === '') ? '' : 'http://localhost:8085';
      } else {
        this.baseUrl = 'http://localhost:8085';
      }
      this.isServerAvailable = null;
    }

    getToken() {
      try {
        return localStorage.getItem(TOKEN_KEY);
      } catch (e) {
        return null;
      }
    }

    setToken(token) {
      try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
      } catch (e) {}
    }

    getUser() {
      try {
        const u = localStorage.getItem(USER_KEY);
        return u ? JSON.parse(u) : null;
      } catch (e) {
        return null;
      }
    }

    setUser(user) {
      try {
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
        else localStorage.removeItem(USER_KEY);
      } catch (e) {}
    }

    isAuthenticated() {
      return Boolean(this.getToken() && this.getUser());
    }

    logout() {
      this.setToken(null);
      this.setUser(null);
    }

    // Health check and session verification
    async initSession() {
      try {
        const res = await fetch(`${this.baseUrl}/api/health`, {
          signal: AbortSignal.timeout ? AbortSignal.timeout(2500) : undefined
        });
        if (res.ok) {
          this.isServerAvailable = true;
          const token = this.getToken();
          if (token) {
            try {
              const meData = await this.getMe();
              return { online: true, authenticated: true, user: meData.user, stats: meData.stats };
            } catch (err) {
              if (err.status === 401) {
                this.logout();
                return { online: true, authenticated: false, sessionExpired: true };
              }
            }
          }
          return { online: true, authenticated: Boolean(this.getUser()), user: this.getUser() };
        } else {
          this.isServerAvailable = false;
          return { online: false, authenticated: Boolean(this.getUser()), user: this.getUser() };
        }
      } catch (e) {
        this.isServerAvailable = false;
        return { online: false, authenticated: Boolean(this.getUser()), user: this.getUser() };
      }
    }

    async request(endpoint, options = {}) {
      const headers = options.headers || {};
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // If body is object and not FormData, stringify
      if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
      }

      options.headers = headers;

      const url = `${this.baseUrl}${endpoint}`;
      let response;
      try {
        response = await fetch(url, options);
      } catch (networkError) {
        this.isServerAvailable = false;
        const err = new Error('Network error. Unable to reach server.');
        err.isNetworkError = true;
        throw err;
      }

      this.isServerAvailable = true;

      let data = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { text: await response.text() };
      }

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof this.onAuthError === 'function') {
            this.onAuthError(data.error || 'Session expired. Please sign in again.');
          }
        }
        const error = new Error(data.error || `HTTP error ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    }

    // Auth endpoints
    async register(name, email, password) {
      const res = await this.request('/api/auth/register', {
        method: 'POST',
        body: { name, email, password }
      });
      this.setToken(res.token);
      this.setUser(res.user);
      return res;
    }

    async login(email, password) {
      const res = await this.request('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      this.setToken(res.token);
      this.setUser(res.user);
      return res;
    }

    async getMe() {
      const res = await this.request('/api/auth/me');
      if (res.user) this.setUser(res.user);
      return res;
    }

    async updateProfile(updates) {
      const res = await this.request('/api/auth/profile', {
        method: 'PUT',
        body: updates
      });
      if (res.user) this.setUser(res.user);
      return res;
    }

    // Normalizers to guarantee consistent object shapes between SQLite and IndexedDB
    normalizeAlbum(album) {
      if (!album) return null;
      return {
        ...album,
        id: album.id,
        title: album.title || 'Untitled Album',
        description: album.description || '',
        accentColor: album.accentColor || album.accent_color || '#38bdf8',
        accent_color: album.accent_color || album.accentColor || '#38bdf8',
        coverPhoto: album.coverPhoto || album.cover_photo || album.resolved_cover || null,
        photoCount: (album.photo_count !== undefined) ? album.photo_count : (album.photoCount || 0),
        activeSharesCount: album.active_shares_count || album.activeSharesCount || 0,
        sharing: album.sharing || {
          isShared: Boolean(album.active_shares_count),
          shareToken: album.share_token || album.id,
          allowDownload: true,
          stripExifOnShare: true
        }
      };
    }

    normalizePhoto(photo) {
      if (!photo) return null;
      const url = photo.dataUrl || photo.storage_url || photo.storageUrl;
      const thumb = photo.thumbnailUrl || photo.thumbnail_url || url;
      const meta = photo.metadata || {};

      let albumIds = [];
      if (Array.isArray(photo.albumIds)) {
        albumIds = photo.albumIds;
      } else if (Array.isArray(photo.album_ids)) {
        albumIds = photo.album_ids;
      } else if (typeof photo.album_ids === 'string') {
        albumIds = photo.album_ids.split(',').filter(Boolean);
      }

      return {
        ...photo,
        id: photo.id,
        title: photo.title || 'Untitled Photo',
        caption: photo.caption || '',
        description: photo.description || '',
        fileName: photo.fileName || photo.filename || 'photo.jpg',
        filename: photo.filename || photo.fileName || 'photo.jpg',
        dataUrl: url,
        storage_url: url,
        thumbnailUrl: thumb,
        thumbnail_url: thumb,
        fileSize: photo.fileSize || photo.file_size || 0,
        file_size: photo.file_size || photo.fileSize || 0,
        favorite: Boolean(photo.favorite),
        albumIds: albumIds,
        tags: Array.isArray(photo.tags) ? photo.tags : (typeof photo.tags === 'string' ? photo.tags.split(',').map(t => t.trim()).filter(Boolean) : []),
        createdAt: photo.createdAt || (photo.uploaded_at ? new Date(photo.uploaded_at).getTime() : Date.now()),
        date_taken: photo.date_taken || meta.dateTimeOriginal,
        metadata: {
          cameraMake: meta.cameraMake || 'Unknown',
          cameraModel: meta.cameraModel || 'Standard Camera',
          lensModel: meta.lensModel || 'Standard Lens',
          focalLength: meta.focalLength,
          aperture: meta.aperture,
          shutterSpeed: meta.shutterSpeed,
          iso: meta.iso,
          exposureBias: meta.exposureBias,
          dateTimeOriginal: meta.dateTimeOriginal,
          location: meta.location || null,
          dimensions: meta.dimensions || { width: photo.width || 0, height: photo.height || 0, aspectRatio: 1 },
          colorSpace: meta.colorSpace || 'sRGB',
          hasExif: Boolean(meta.hasExif || meta.cameraMake || meta.cameraModel || meta.aperture || meta.iso)
        }
      };
    }

    // Album endpoints
    async getAlbums() {
      const albums = await this.request('/api/albums');
      return Array.isArray(albums) ? albums.map(a => this.normalizeAlbum(a)) : [];
    }

    async getAlbum(id) {
      const album = await this.request(`/api/albums/${id}`);
      return this.normalizeAlbum(album);
    }

    async createAlbum(albumData) {
      const res = await this.request('/api/albums', {
        method: 'POST',
        body: {
          title: albumData.title,
          description: albumData.description,
          accent_color: albumData.accentColor || albumData.accent_color,
          accentColor: albumData.accentColor || albumData.accent_color,
          visibility: albumData.visibility || 'private',
          cover_photo: albumData.coverPhoto || albumData.cover_photo
        }
      });
      return {
        ...res,
        album: this.normalizeAlbum(res.album)
      };
    }

    async updateAlbum(id, albumData) {
      const res = await this.request(`/api/albums/${id}`, {
        method: 'PUT',
        body: {
          title: albumData.title,
          description: albumData.description,
          accent_color: albumData.accentColor || albumData.accent_color,
          accentColor: albumData.accentColor || albumData.accent_color,
          visibility: albumData.visibility || 'private',
          cover_photo: albumData.coverPhoto || albumData.cover_photo
        }
      });
      return {
        ...res,
        album: this.normalizeAlbum(res.album)
      };
    }

    async deleteAlbum(id) {
      return this.request(`/api/albums/${id}`, {
        method: 'DELETE'
      });
    }

    // Photo endpoints
    async getPhotos(queryParams = {}) {
      const searchParams = new URLSearchParams();
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== undefined && queryParams[key] !== null && queryParams[key] !== '') {
          searchParams.append(key, queryParams[key]);
        }
      });
      const qs = searchParams.toString();
      const photos = await this.request(`/api/photos${qs ? '?' + qs : ''}`);
      return Array.isArray(photos) ? photos.map(p => this.normalizePhoto(p)) : [];
    }

    async getPhoto(id) {
      const photo = await this.request(`/api/photos/${id}`);
      return this.normalizePhoto(photo);
    }

    async uploadPhoto(dataUrlOrFormData, metadata = {}, albumIds = [], title = '', caption = '', tags = '') {
      let res;
      if (dataUrlOrFormData instanceof FormData) {
        res = await this.request('/api/photos/upload', {
          method: 'POST',
          body: dataUrlOrFormData
        });
      } else {
        res = await this.request('/api/photos/upload', {
          method: 'POST',
          body: {
            dataUrl: dataUrlOrFormData,
            title,
            caption,
            tags,
            metadata,
            albumIds
          }
        });
      }
      return {
        ...res,
        photo: this.normalizePhoto(res.photo)
      };
    }

    async updatePhotoDetails(id, updates) {
      const res = await this.request(`/api/photos/${id}`, {
        method: 'PUT',
        body: updates
      });
      return {
        ...res,
        photo: this.normalizePhoto(res.photo)
      };
    }

    async toggleFavorite(id) {
      return this.request(`/api/photos/${id}/favorite`, {
        method: 'POST'
      });
    }

    async assignAlbums(photoId, albumIds) {
      return this.request(`/api/photos/${photoId}/albums`, {
        method: 'POST',
        body: { albumIds }
      });
    }

    async deletePhoto(id) {
      return this.request(`/api/photos/${id}`, {
        method: 'DELETE'
      });
    }

    // Sharing endpoints
    async createShare(albumId, options = {}) {
      const res = await this.request(`/api/albums/${albumId}/shares`, {
        method: 'POST',
        body: options
      });
      return res;
    }

    async getAlbumShares(albumId) {
      return this.request(`/api/albums/${albumId}/shares`);
    }

    async revokeShare(shareId) {
      return this.request(`/api/shares/${shareId}`, {
        method: 'DELETE'
      });
    }

    async regenerateShare(shareId) {
      return this.request(`/api/shares/${shareId}/regenerate`, {
        method: 'POST'
      });
    }

    async getSharedAlbum(token) {
      const res = await this.request(`/api/shared/${token}`);
      if (res && res.photos) {
        res.photos = res.photos.map(p => this.normalizePhoto(p));
      }
      if (res && res.album) {
        res.album = this.normalizeAlbum(res.album);
      }
      return res;
    }

    // Migration endpoint
    async migrateLocalData(albums, photos) {
      return this.request('/api/photos/migrate', {
        method: 'POST',
        body: { albums, photos }
      });
    }
  }

  global.api = new ApiService();
})(window);
