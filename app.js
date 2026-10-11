// app.js - Main Application Controller for LuminaLens Photo Album Studio
// Integrated with REST Backend API, JWT Authentication, and Offline IndexedDB Fallback

(function() {
  'use strict';

  // Application State
  const state = {
    allPhotos: [],
    allAlbums: [],
    activeFilter: 'all', // 'all', 'favorites', 'geotagged', or albumId
    searchQuery: '',
    cameraFilter: 'all',
    sortOrder: 'newest',
    favoritesOnly: false,
    gpsOnly: false,
    currentGalleryPhotos: [],
    lightboxIndex: 0,
    isSlideshowPlaying: false,
    slideshowInterval: null,
    guestMode: false,
    sharedAlbumId: null,
    sharedAlbumData: null,
    leafletMap: null,
    leafletMarker: null,
    photoToAssign: null,
    selectedColor: '#38bdf8',
    isOnline: false,
    currentUser: null
  };

  // DOM Elements
  const DOM = {
    // Navigation & Inputs
    globalSearchInput: document.getElementById('globalSearchInput'),
    btnNewAlbum: document.getElementById('btnNewAlbum'),
    btnUploadPhotos: document.getElementById('btnUploadPhotos'),
    brandHomeBtn: document.getElementById('brandHomeBtn'),
    sidebarAddAlbumBtn: document.getElementById('sidebarAddAlbumBtn'),
    backendStatusPill: document.getElementById('backendStatusPill'),
    backendStatusText: document.getElementById('backendStatusText'),

    // Authentication & User Profile in Navigation
    btnNavSignIn: document.getElementById('btnNavSignIn'),
    userMenuContainer: document.getElementById('userMenuContainer'),
    userProfileBtn: document.getElementById('userProfileBtn'),
    userNavAvatar: document.getElementById('userNavAvatar'),
    userNavName: document.getElementById('userNavName'),
    userDropdownMenu: document.getElementById('userDropdownMenu'),
    dropdownUserAvatar: document.getElementById('dropdownUserAvatar'),
    dropdownUserName: document.getElementById('dropdownUserName'),
    dropdownUserEmail: document.getElementById('dropdownUserEmail'),
    statMenuPhotos: document.getElementById('statMenuPhotos'),
    statMenuAlbums: document.getElementById('statMenuAlbums'),
    statMenuVault: document.getElementById('statMenuVault'),
    btnProfileSettings: document.getElementById('btnProfileSettings'),
    btnSignOut: document.getElementById('btnSignOut'),

    // Sidebar items & counts
    navAllPhotos: document.getElementById('navAllPhotos'),
    navFavorites: document.getElementById('navFavorites'),
    navGeotagged: document.getElementById('navGeotagged'),
    countAllPhotos: document.getElementById('countAllPhotos'),
    countFavorites: document.getElementById('countFavorites'),
    countGeotagged: document.getElementById('countGeotagged'),
    sidebarAlbumsList: document.getElementById('sidebarAlbumsList'),
    sidebarTagsCloud: document.getElementById('sidebarTagsCloud'),
    storageUsageText: document.getElementById('storageUsageText'),
    storageBarFill: document.getElementById('storageBarFill'),

    // Guest Mode
    guestModeBanner: document.getElementById('guestModeBanner'),
    btnExitGuestMode: document.getElementById('btnExitGuestMode'),

    // Hero Banner
    albumHeroBanner: document.getElementById('albumHeroBanner'),
    heroGlow: document.getElementById('heroGlow'),
    heroTag: document.getElementById('heroTag'),
    heroTitle: document.getElementById('heroTitle'),
    heroDesc: document.getElementById('heroDesc'),
    heroPhotoCount: document.getElementById('heroPhotoCount'),
    heroCameraBrands: document.getElementById('heroCameraBrands'),
    heroLocationsCount: document.getElementById('heroLocationsCount'),
    btnHeroSlideshow: document.getElementById('btnHeroSlideshow'),
    btnHeroShare: document.getElementById('btnHeroShare'),
    btnHeroShareText: document.getElementById('btnHeroShareText'),
    btnEditAlbum: document.getElementById('btnEditAlbum'),

    // Filters
    cameraSelectFilter: document.getElementById('cameraSelectFilter'),
    sortSelect: document.getElementById('sortSelect'),
    filterPillFavorites: document.getElementById('filterPillFavorites'),
    filterPillGps: document.getElementById('filterPillGps'),
    photosMatchingCount: document.getElementById('photosMatchingCount'),

    // Gallery
    photoGalleryGrid: document.getElementById('photoGalleryGrid'),

    // Lightbox
    lightboxModal: document.getElementById('lightboxModal'),
    lightboxTitle: document.getElementById('lightboxTitle'),
    lightboxCounter: document.getElementById('lightboxCounter'),
    lightboxMainImg: document.getElementById('lightboxMainImg'),
    lbPrevBtn: document.getElementById('lbPrevBtn'),
    lbNextBtn: document.getElementById('lbNextBtn'),
    lbSlideshowBtn: document.getElementById('lbSlideshowBtn'),
    lbPlayIcon: document.getElementById('lbPlayIcon'),
    lbFavBtn: document.getElementById('lbFavBtn'),
    lbDownloadBtn: document.getElementById('lbDownloadBtn'),
    lbToggleInfoBtn: document.getElementById('lbToggleInfoBtn'),
    lbCloseBtn: document.getElementById('lbCloseBtn'),
    lightboxDrawer: document.getElementById('lightboxDrawer'),
    drawerCloseSubBtn: document.getElementById('drawerCloseSubBtn'),

    // Drawer Metadata fields
    drawerCameraBrand: document.getElementById('drawerCameraBrand'),
    drawerCameraModel: document.getElementById('drawerCameraModel'),
    drawerLensModel: document.getElementById('drawerLensModel'),
    drawerAperture: document.getElementById('drawerAperture'),
    drawerShutter: document.getElementById('drawerShutter'),
    drawerIso: document.getElementById('drawerIso'),
    drawerFocal: document.getElementById('drawerFocal'),
    drawerCaptureDate: document.getElementById('drawerCaptureDate'),
    drawerDimensions: document.getElementById('drawerDimensions'),
    drawerExposureBias: document.getElementById('drawerExposureBias'),
    drawerFileSize: document.getElementById('drawerFileSize'),
    drawerColorSpace: document.getElementById('drawerColorSpace'),
    gpsMapContainer: document.getElementById('gpsMapContainer'),
    drawerLocationText: document.getElementById('drawerLocationText'),
    btnExportStrippedPhoto: document.getElementById('btnExportStrippedPhoto'),

    // Modals
    albumModal: document.getElementById('albumModal'),
    albumModalTitle: document.getElementById('albumModalTitle'),
    editAlbumId: document.getElementById('editAlbumId'),
    albumTitleInput: document.getElementById('albumTitleInput'),
    albumDescInput: document.getElementById('albumDescInput'),
    albumColorSwatches: document.getElementById('albumColorSwatches'),
    closeAlbumModalBtn: document.getElementById('closeAlbumModalBtn'),
    cancelAlbumModalBtn: document.getElementById('cancelAlbumModalBtn'),
    saveAlbumBtn: document.getElementById('saveAlbumBtn'),
    deleteAlbumModalBtn: document.getElementById('deleteAlbumModalBtn'),

    shareModal: document.getElementById('shareModal'),
    shareAlbumName: document.getElementById('shareAlbumName'),
    shareUrlDisplay: document.getElementById('shareUrlDisplay'),
    copyShareLinkBtn: document.getElementById('copyShareLinkBtn'),
    stripExifShareToggle: document.getElementById('stripExifShareToggle'),
    shareQrCanvas: document.getElementById('shareQrCanvas'),
    previewGuestViewBtn: document.getElementById('previewGuestViewBtn'),
    nativeShareBtn: document.getElementById('nativeShareBtn'),
    doneShareBtn: document.getElementById('doneShareBtn'),
    closeShareModalBtn: document.getElementById('closeShareModalBtn'),

    uploadModal: document.getElementById('uploadModal'),
    uploadDropzone: document.getElementById('uploadDropzone'),
    browseFilesBtn: document.getElementById('browseFilesBtn'),
    fileInputElement: document.getElementById('fileInputElement'),
    uploadTargetAlbumSelect: document.getElementById('uploadTargetAlbumSelect'),
    uploadProgressCard: document.getElementById('uploadProgressCard'),
    uploadProgressBar: document.getElementById('uploadProgressBar'),
    uploadStatusText: document.getElementById('uploadStatusText'),
    closeUploadModalBtn: document.getElementById('closeUploadModalBtn'),
    cancelUploadBtn: document.getElementById('cancelUploadBtn'),

    assignAlbumModal: document.getElementById('assignAlbumModal'),
    assignModalSubtitle: document.getElementById('assignModalSubtitle'),
    assignAlbumsChecklist: document.getElementById('assignAlbumsChecklist'),
    closeAssignModalBtn: document.getElementById('closeAssignModalBtn'),
    cancelAssignBtn: document.getElementById('cancelAssignBtn'),
    saveAssignBtn: document.getElementById('saveAssignBtn'),

    // Authentication Modal
    authModal: document.getElementById('authModal'),
    closeAuthModalBtn: document.getElementById('closeAuthModalBtn'),
    tabLoginBtn: document.getElementById('tabLoginBtn'),
    tabRegisterBtn: document.getElementById('tabRegisterBtn'),
    authAlert: document.getElementById('authAlert'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    toggleLoginPasswordBtn: document.getElementById('toggleLoginPasswordBtn'),
    btnFillDemoCreds: document.getElementById('btnFillDemoCreds'),
    loginSubmitBtn: document.getElementById('loginSubmitBtn'),
    loginSpinner: document.getElementById('loginSpinner'),
    loginBtnText: document.getElementById('loginBtnText'),
    registerName: document.getElementById('registerName'),
    registerEmail: document.getElementById('registerEmail'),
    registerPassword: document.getElementById('registerPassword'),
    registerConfirmPassword: document.getElementById('registerConfirmPassword'),
    toggleRegisterPasswordBtn: document.getElementById('toggleRegisterPasswordBtn'),
    toggleRegisterConfirmPasswordBtn: document.getElementById('toggleRegisterConfirmPasswordBtn'),
    registerSubmitBtn: document.getElementById('registerSubmitBtn'),
    registerSpinner: document.getElementById('registerSpinner'),
    registerBtnText: document.getElementById('registerBtnText'),
    authSwitchPrompt: document.getElementById('authSwitchPrompt'),
    linkSwitchToRegister: document.getElementById('linkSwitchToRegister'),

    // Profile Details Modal
    profileModal: document.getElementById('profileModal'),
    closeProfileModalBtn: document.getElementById('closeProfileModalBtn'),
    closeProfileModalDoneBtn: document.getElementById('closeProfileModalDoneBtn'),
    profileModalLogoutBtn: document.getElementById('profileModalLogoutBtn'),
    profileCardAvatar: document.getElementById('profileCardAvatar'),
    profileCardName: document.getElementById('profileCardName'),
    profileCardEmail: document.getElementById('profileCardEmail'),
    statCardPhotos: document.getElementById('statCardPhotos'),
    statCardAlbums: document.getElementById('statCardAlbums'),
    statCardFavs: document.getElementById('statCardFavs'),
    statCardShares: document.getElementById('statCardShares'),

    toastContainer: document.getElementById('toastContainer')
  };

  // Helper normalizers for consistent object shapes
  function normalizeAlbum(album) {
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

  function normalizePhoto(photo) {
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

  // Visual status pill updater
  function updateBackendStatusBadge(status) {
    if (!DOM.backendStatusPill) return;
    DOM.backendStatusPill.className = `backend-status-badge ${status}`;
    if (status === 'online') {
      state.isOnline = true;
      DOM.backendStatusText.textContent = 'Server Sync';
      DOM.backendStatusPill.title = 'Live sync active with Backend SQLite Database';
    } else if (status === 'offline') {
      state.isOnline = false;
      DOM.backendStatusText.textContent = 'Offline Vault';
      DOM.backendStatusPill.title = 'Running on Local IndexedDB Vault (Offline Mode)';
    } else {
      DOM.backendStatusText.textContent = 'Connecting...';
    }
  }

  // ==========================================
  // AUTHENTICATION UI & STATE MANAGEMENT
  // ==========================================
  function updateAuthUI() {
    const user = state.currentUser;
    if (user) {
      // Logged in state
      DOM.btnNavSignIn.style.display = 'none';
      DOM.userMenuContainer.style.display = 'inline-block';

      const avatarSrc = user.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}&backgroundColor=6366f1`;
      DOM.userNavAvatar.src = avatarSrc;
      DOM.dropdownUserAvatar.src = avatarSrc;
      DOM.profileCardAvatar.src = avatarSrc;

      const displayName = user.name || 'Photographer';
      DOM.userNavName.textContent = displayName;
      DOM.dropdownUserName.textContent = displayName;
      DOM.profileCardName.textContent = displayName;

      const email = user.email || '';
      DOM.dropdownUserEmail.textContent = email;
      DOM.profileCardEmail.textContent = email;
    } else {
      // Logged out state
      DOM.btnNavSignIn.style.display = 'inline-flex';
      DOM.userMenuContainer.style.display = 'none';
      DOM.userDropdownMenu.classList.remove('show');
      DOM.userProfileBtn.classList.remove('active');
    }
  }

  function requireUserAuth(actionDescription = 'perform this action') {
    if (state.currentUser) return true;
    showToast(`Please sign in to ${actionDescription}`, 'info');
    openAuthModal('login');
    return false;
  }

  function openAuthModal(mode = 'login') {
    setAuthModalMode(mode);
    clearAuthAlert();
    DOM.authModal.classList.add('active');
    if (mode === 'login') {
      setTimeout(() => DOM.loginEmail.focus(), 80);
    } else {
      setTimeout(() => DOM.registerName.focus(), 80);
    }
  }

  function closeAuthModal() {
    DOM.authModal.classList.remove('active');
    clearAuthAlert();
  }

  function setAuthModalMode(mode) {
    if (mode === 'login') {
      DOM.tabLoginBtn.classList.add('active');
      DOM.tabRegisterBtn.classList.remove('active');
      DOM.loginForm.style.display = 'block';
      DOM.registerForm.style.display = 'none';
      DOM.authSwitchPrompt.innerHTML = `Don't have an account? <a href="#" id="linkSwitchToRegister" style="color: var(--accent-cyan); font-weight: 600; text-decoration: none;">Create one free</a>`;
      document.getElementById('linkSwitchToRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthModalMode('register');
      });
    } else {
      DOM.tabLoginBtn.classList.remove('active');
      DOM.tabRegisterBtn.classList.add('active');
      DOM.loginForm.style.display = 'none';
      DOM.registerForm.style.display = 'block';
      DOM.authSwitchPrompt.innerHTML = `Already have an account? <a href="#" id="linkSwitchToLogin" style="color: var(--accent-cyan); font-weight: 600; text-decoration: none;">Sign in here</a>`;
      document.getElementById('linkSwitchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthModalMode('login');
      });
    }
  }

  function showAuthAlert(message, type = 'error') {
    DOM.authAlert.style.display = 'block';
    DOM.authAlert.className = `auth-alert ${type}`;
    DOM.authAlert.textContent = message;
  }

  function clearAuthAlert() {
    DOM.authAlert.style.display = 'none';
    DOM.authAlert.textContent = '';
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    clearAuthAlert();

    const email = DOM.loginEmail.value.trim();
    const password = DOM.loginPassword.value;

    if (!email || !password) {
      showAuthAlert('Please enter both email and password.');
      return;
    }

    DOM.loginSubmitBtn.disabled = true;
    DOM.loginSpinner.style.display = 'inline-block';
    DOM.loginBtnText.textContent = 'Authenticating...';

    try {
      const res = await window.api.login(email, password);
      if (res && res.user) {
        state.currentUser = res.user;
        updateAuthUI();
        closeAuthModal();
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        DOM.loginPassword.value = '';
        await refreshData();
      }
    } catch (err) {
      console.error('Login error:', err);
      let errMsg = 'Failed to sign in. Please verify your credentials.';
      if (err.data && err.data.error) {
        errMsg = err.data.error;
      } else if (err.isNetworkError || !navigator.onLine) {
        errMsg = 'Network error: Backend server is unreachable. Please verify server is running.';
      }
      showAuthAlert(errMsg, 'error');
    } finally {
      DOM.loginSubmitBtn.disabled = false;
      DOM.loginSpinner.style.display = 'none';
      DOM.loginBtnText.textContent = 'Sign In to LuminaLens';
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    clearAuthAlert();

    const name = DOM.registerName.value.trim();
    const email = DOM.registerEmail.value.trim();
    const password = DOM.registerPassword.value;
    const confirmPassword = DOM.registerConfirmPassword.value;

    // Validation
    if (!name || name.length < 2) {
      showAuthAlert('Please enter your full name (at least 2 characters).');
      DOM.registerName.focus();
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      showAuthAlert('Please enter a valid email address.');
      DOM.registerEmail.focus();
      return;
    }
    if (!password || password.length < 6) {
      showAuthAlert('Password must be at least 6 characters long.');
      DOM.registerPassword.focus();
      return;
    }
    if (password !== confirmPassword) {
      showAuthAlert('Passwords do not match. Please re-enter your password.');
      DOM.registerConfirmPassword.focus();
      return;
    }

    DOM.registerSubmitBtn.disabled = true;
    DOM.registerSpinner.style.display = 'inline-block';
    DOM.registerBtnText.textContent = 'Creating Account...';

    try {
      const res = await window.api.register(name, email, password);
      if (res && res.user) {
        state.currentUser = res.user;
        updateAuthUI();
        closeAuthModal();
        showToast(`Welcome to LuminaLens, ${res.user.name}! Account created.`, 'success');
        DOM.registerPassword.value = '';
        DOM.registerConfirmPassword.value = '';
        await refreshData();
      }
    } catch (err) {
      console.error('Register error:', err);
      let errMsg = 'Registration failed. Please try again.';
      if (err.data && err.data.error) {
        errMsg = err.data.error;
      } else if (err.isNetworkError || !navigator.onLine) {
        errMsg = 'Network error: Server is unreachable. Please verify connection.';
      }
      showAuthAlert(errMsg, 'error');
    } finally {
      DOM.registerSubmitBtn.disabled = false;
      DOM.registerSpinner.style.display = 'none';
      DOM.registerBtnText.textContent = 'Create Studio Account';
    }
  }

  function handleLogout() {
    window.api.logout();
    state.currentUser = null;
    DOM.userDropdownMenu.classList.remove('show');
    DOM.userProfileBtn.classList.remove('active');
    DOM.profileModal.classList.remove('active');
    updateAuthUI();
    showToast('Signed out successfully', 'info');
    state.activeFilter = 'all';
    refreshData();
  }

  async function openProfileModal() {
    DOM.userDropdownMenu.classList.remove('show');
    DOM.userProfileBtn.classList.remove('active');

    if (!state.currentUser) {
      openAuthModal('login');
      return;
    }

    // Refresh user details and statistics from backend
    if (window.api && window.api.isServerAvailable !== false) {
      try {
        const res = await window.api.getMe();
        if (res && res.stats) {
          DOM.statCardPhotos.textContent = res.stats.totalPhotos;
          DOM.statCardAlbums.textContent = res.stats.totalAlbums;
          DOM.statCardFavs.textContent = res.stats.favoritePhotos;
          DOM.statCardShares.textContent = res.stats.activeShares;

          DOM.statMenuPhotos.textContent = res.stats.totalPhotos;
          DOM.statMenuAlbums.textContent = res.stats.totalAlbums;
          DOM.statMenuVault.textContent = ExifProcessor.formatBytes(res.stats.storageBytes);
        }
      } catch (err) {
        console.warn('Could not fetch updated profile stats:', err);
      }
    }

    DOM.profileModal.classList.add('active');
  }

  function closeProfileModal() {
    DOM.profileModal.classList.remove('active');
  }

  function togglePasswordVisibility(inputElem, toggleBtn) {
    const isPassword = inputElem.type === 'password';
    inputElem.type = isPassword ? 'text' : 'password';
    const openIcon = toggleBtn.querySelector('.eye-icon-open');
    const closedIcon = toggleBtn.querySelector('.eye-icon-closed');
    if (openIcon && closedIcon) {
      openIcon.style.display = isPassword ? 'none' : 'block';
      closedIcon.style.display = isPassword ? 'block' : 'none';
    }
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  async function init() {
    try {
      // 1. Initialize local IndexedDB engine for offline caching
      await window.photoDB.init();

      // 2. Setup auth error handler for session expiration
      if (window.api) {
        window.api.onAuthError = (errMsg) => {
          state.currentUser = null;
          updateAuthUI();
          showToast(errMsg || 'Session expired. Please sign in.', 'error');
          openAuthModal('login');
          showAuthAlert('Your session has expired. Please sign in again to continue.', 'error');
        };
      }

      // 3. Check backend server availability and user session
      let sessionResult = { online: false, authenticated: false };
      if (window.api) {
        sessionResult = await window.api.initSession();
      }

      if (sessionResult.online) {
        updateBackendStatusBadge('online');
      } else {
        updateBackendStatusBadge('offline');
      }

      if (sessionResult.authenticated && sessionResult.user) {
        state.currentUser = sessionResult.user;
      } else if (sessionResult.sessionExpired) {
        showToast('Your session has expired. Please sign in again.', 'info');
      }

      updateAuthUI();

      // 4. Check URL parameters for guest shared link (/shared/:token or ?share=:token)
      const urlParams = new URLSearchParams(window.location.search);
      let shareToken = urlParams.get('share');
      const pathMatches = window.location.pathname.match(/\/shared\/([^\/]+)/);
      if (pathMatches && pathMatches[1]) {
        shareToken = pathMatches[1];
      }

      if (shareToken) {
        await handleSharedLinkParam(shareToken);
      } else {
        await refreshData();
      }

      setupEventListeners();
      setupDragDrop();
    } catch (err) {
      console.error('Initialization error:', err);
      updateBackendStatusBadge('offline');
      updateAuthUI();
      await refreshData();
      setupEventListeners();
      setupDragDrop();
    }
  }

  // ==========================================
  // DATA REFRESH & HYBRID SYNC PIPELINE
  // ==========================================
  async function refreshData() {
    let loadedFromBackend = false;

    // A. Attempt to retrieve latest data from Backend API for authenticated user
    if (window.api && window.api.isServerAvailable !== false && state.currentUser) {
      try {
        const [backendAlbums, backendPhotos] = await Promise.all([
          window.api.getAlbums(),
          window.api.getPhotos()
        ]);

        if (Array.isArray(backendAlbums) && Array.isArray(backendPhotos)) {
          state.allAlbums = backendAlbums.map(normalizeAlbum);
          state.allPhotos = backendPhotos.map(normalizePhoto);
          loadedFromBackend = true;
          updateBackendStatusBadge('online');

          // Keep IndexedDB synced as warm offline cache
          try {
            await window.photoDB.saveAlbums(state.allAlbums);
            await window.photoDB.savePhotos(state.allPhotos);
          } catch (cacheErr) {
            console.warn('Cache update warning:', cacheErr);
          }
        }
      } catch (apiErr) {
        console.warn('Backend fetch failed, falling back to local IndexedDB vault:', apiErr);
        if (apiErr.status === 401) {
          state.currentUser = null;
          updateAuthUI();
        } else {
          updateBackendStatusBadge('offline');
        }
      }
    }

    // B. Fallback: Retrieve from local IndexedDB if backend failed or unavailable
    if (!loadedFromBackend) {
      try {
        if (state.currentUser || !window.api || !state.isOnline) {
          const localPhotos = await window.photoDB.getAllPhotos();
          const localAlbums = await window.photoDB.getAllAlbums();
          state.allPhotos = localPhotos.map(normalizePhoto);
          state.allAlbums = localAlbums.map(normalizeAlbum);
        } else {
          // Logged out with active server
          state.allPhotos = [];
          state.allAlbums = [];
        }
      } catch (idbErr) {
        console.error('Local database read error:', idbErr);
      }
    }

    // Update profile stats if authenticated
    if (state.currentUser && window.api && state.isOnline) {
      try {
        window.api.getMe().then(res => {
          if (res && res.stats) {
            DOM.statMenuPhotos.textContent = res.stats.totalPhotos;
            DOM.statMenuAlbums.textContent = res.stats.totalAlbums;
            DOM.statMenuVault.textContent = ExifProcessor.formatBytes(res.stats.storageBytes);
          }
        }).catch(() => {});
      } catch (e) {}
    }

    // Render interface elements
    populateCameraFilterOptions();
    updateSidebarCounts();
    renderSidebarAlbums();
    renderTagsCloud();
    updateStorageMeter();
    renderHeroBanner();
    renderGallery();
  }

  function updateSidebarCounts() {
    DOM.countAllPhotos.textContent = state.allPhotos.length;
    DOM.countFavorites.textContent = state.allPhotos.filter(p => p.favorite).length;
    DOM.countGeotagged.textContent = state.allPhotos.filter(p => p.metadata?.location?.latitude).length;
  }

  function updateStorageMeter() {
    let totalBytes = 0;
    state.allPhotos.forEach(p => {
      totalBytes += p.fileSize || p.file_size || 2000000;
    });
    DOM.storageUsageText.textContent = ExifProcessor.formatBytes(totalBytes);
    // Visual bar fill representation up to 100MB
    const pct = Math.min(100, Math.round((totalBytes / (100 * 1024 * 1024)) * 100));
    DOM.storageBarFill.style.width = `${Math.max(8, pct)}%`;
  }

  function populateCameraFilterOptions() {
    const cameras = new Set();
    state.allPhotos.forEach(p => {
      if (p.metadata?.cameraModel && p.metadata.cameraModel !== 'Unknown Model') {
        cameras.add(p.metadata.cameraModel);
      }
    });

    const currentVal = DOM.cameraSelectFilter.value;
    DOM.cameraSelectFilter.innerHTML = '<option value="all">All Cameras & Gear</option>';
    cameras.forEach(cam => {
      const opt = document.createElement('option');
      opt.value = cam;
      opt.textContent = cam;
      DOM.cameraSelectFilter.appendChild(opt);
    });

    if (cameras.has(currentVal)) {
      DOM.cameraSelectFilter.value = currentVal;
    }
  }

  // ==========================================
  // SIDEBAR & ALBUM NAVIGATION
  // ==========================================
  function renderSidebarAlbums() {
    DOM.sidebarAlbumsList.innerHTML = '';
    DOM.uploadTargetAlbumSelect.innerHTML = '<option value="">None (Library only)</option>';

    state.allAlbums.forEach(album => {
      const count = state.allPhotos.filter(p => p.albumIds && p.albumIds.includes(album.id)).length;

      const li = document.createElement('li');
      li.className = `sidebar-item ${state.activeFilter === album.id ? 'active' : ''}`;
      li.dataset.albumId = album.id;
      li.innerHTML = `
        <div class="sidebar-item-content">
          <span class="album-color-dot" style="background: ${album.accentColor || '#38bdf8'};"></span>
          <span class="sidebar-item-title">${escapeHtml(album.title)}</span>
        </div>
        <span class="item-count-badge">${count}</span>
      `;
      li.addEventListener('click', () => {
        setActiveFilter(album.id);
      });
      DOM.sidebarAlbumsList.appendChild(li);

      // Populate target album selector in upload modal
      const opt = document.createElement('option');
      opt.value = album.id;
      opt.textContent = album.title;
      DOM.uploadTargetAlbumSelect.appendChild(opt);
    });
  }

  function renderTagsCloud() {
    const tagsMap = {};
    state.allPhotos.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(t => {
          if (t && t.trim()) {
            tagsMap[t.trim()] = (tagsMap[t.trim()] || 0) + 1;
          }
        });
      }
    });

    DOM.sidebarTagsCloud.innerHTML = '';
    const sortedTags = Object.keys(tagsMap).sort((a, b) => tagsMap[b] - tagsMap[a]).slice(0, 10);
    sortedTags.forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'card-tag';
      pill.style.cursor = 'pointer';
      pill.textContent = `#${tag}`;
      pill.addEventListener('click', () => {
        DOM.globalSearchInput.value = tag;
        state.searchQuery = tag;
        renderGallery();
      });
      DOM.sidebarTagsCloud.appendChild(pill);
    });
  }

  function setActiveFilter(filterId) {
    state.activeFilter = filterId;

    // Update active class on library links
    [DOM.navAllPhotos, DOM.navFavorites, DOM.navGeotagged].forEach(el => el.classList.remove('active'));
    if (filterId === 'all') DOM.navAllPhotos.classList.add('active');
    else if (filterId === 'favorites') DOM.navFavorites.classList.add('active');
    else if (filterId === 'geotagged') DOM.navGeotagged.classList.add('active');

    // Update active class on album items
    const albumItems = DOM.sidebarAlbumsList.querySelectorAll('.sidebar-item');
    albumItems.forEach(el => {
      if (el.dataset.albumId === filterId) el.classList.add('active');
      else el.classList.remove('active');
    });

    renderHeroBanner();
    renderGallery();
  }

  // ==========================================
  // HERO BANNER
  // ==========================================
  function renderHeroBanner() {
    let title = 'All Photos';
    let tag = 'Portfolio Vault';
    let desc = 'Complete photographic catalog with detailed EXIF camera diagnostics, geolocation coordinates, and lens metadata.';
    let accent = 'rgba(99, 102, 241, 0.3)';
    let isAlbum = false;

    if (state.guestMode && state.sharedAlbumData) {
      title = state.sharedAlbumData.album.title;
      tag = `Shared Album • By ${state.sharedAlbumData.album.owner?.name || 'Photographer'}`;
      desc = state.sharedAlbumData.album.description || 'Curated personal photo collection shared securely.';
      accent = state.sharedAlbumData.album.accentColor || '#38bdf8';
      isAlbum = true;
    } else if (state.activeFilter === 'favorites') {
      title = 'Favorite Moments';
      tag = 'Curated Bookmarks';
      desc = 'Your hand-picked top photography shots and bookmarked memories.';
      accent = 'rgba(244, 63, 94, 0.35)';
    } else if (state.activeFilter === 'geotagged') {
      title = 'Geotagged Expeditions';
      tag = 'Spatial Visual Map';
      desc = 'All photos featuring verified GPS latitude and longitude metadata.';
      accent = 'rgba(16, 185, 129, 0.35)';
    } else if (state.activeFilter !== 'all') {
      const album = state.allAlbums.find(a => a.id === state.activeFilter);
      if (album) {
        title = album.title;
        tag = 'Album Collection';
        desc = album.description || 'Curated personal photo album collection.';
        accent = album.accentColor || '#38bdf8';
        isAlbum = true;
      }
    }

    DOM.heroTitle.textContent = title;
    DOM.heroTag.textContent = tag;
    DOM.heroDesc.textContent = desc;
    DOM.heroGlow.style.background = `radial-gradient(circle, ${accent} 0%, transparent 70%)`;
    DOM.albumHeroBanner.style.setProperty('--hero-accent', accent);

    DOM.btnEditAlbum.style.display = isAlbum && !state.guestMode ? 'inline-flex' : 'none';
    DOM.btnHeroShareText.textContent = isAlbum ? 'Share Album' : 'Share Collection';
  }

  // ==========================================
  // GALLERY FILTER & RENDERING
  // ==========================================
  function getFilteredPhotos() {
    let photos = [...state.allPhotos];

    // 1. Filter by view / album
    if (state.activeFilter === 'favorites') {
      photos = photos.filter(p => p.favorite);
    } else if (state.activeFilter === 'geotagged') {
      photos = photos.filter(p => p.metadata?.location?.latitude);
    } else if (state.activeFilter !== 'all') {
      photos = photos.filter(p => p.albumIds && p.albumIds.includes(state.activeFilter));
    }

    // 2. Filter by search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      photos = photos.filter(p => {
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const tagsMatch = (p.tags || []).some(t => t.toLowerCase().includes(q));
        const camMakeMatch = (p.metadata?.cameraMake || '').toLowerCase().includes(q);
        const camModelMatch = (p.metadata?.cameraModel || '').toLowerCase().includes(q);
        const lensMatch = (p.metadata?.lensModel || '').toLowerCase().includes(q);
        const placeMatch = (p.metadata?.location?.placeName || '').toLowerCase().includes(q);
        return titleMatch || descMatch || tagsMatch || camMakeMatch || camModelMatch || lensMatch || placeMatch;
      });
    }

    // 3. Filter by camera dropdown
    if (state.cameraFilter !== 'all') {
      photos = photos.filter(p => p.metadata?.cameraModel === state.cameraFilter);
    }

    // 4. Quick pills
    if (state.favoritesOnly) {
      photos = photos.filter(p => p.favorite);
    }
    if (state.gpsOnly) {
      photos = photos.filter(p => p.metadata?.location?.latitude);
    }

    // 5. Sorting
    photos.sort((a, b) => {
      if (state.sortOrder === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      if (state.sortOrder === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
      if (state.sortOrder === 'title') return (a.title || '').localeCompare(b.title || '');
      if (state.sortOrder === 'iso') return (b.metadata?.iso || 0) - (a.metadata?.iso || 0);
      if (state.sortOrder === 'shotDate') {
        const dateA = a.metadata?.dateTimeOriginal || '';
        const dateB = b.metadata?.dateTimeOriginal || '';
        return dateB.localeCompare(dateA);
      }
      return 0;
    });

    return photos;
  }

  function renderGallery() {
    const photos = getFilteredPhotos();
    state.currentGalleryPhotos = photos;

    // Update counts
    DOM.heroPhotoCount.textContent = photos.length;
    DOM.photosMatchingCount.textContent = `Showing ${photos.length} photos`;

    // Camera brands summary
    const brands = [...new Set(photos.map(p => p.metadata?.cameraMake).filter(Boolean))];
    DOM.heroCameraBrands.textContent = brands.length > 0 ? brands.slice(0, 3).join(', ') : 'Various Cameras';

    // Locations summary
    const locationsCount = photos.filter(p => p.metadata?.location?.latitude).length;
    DOM.heroLocationsCount.textContent = locationsCount > 0 ? `${locationsCount} Geotagged` : 'No GPS tags';

    DOM.photoGalleryGrid.innerHTML = '';

    if (photos.length === 0) {
      const isLoggedOut = !state.currentUser && !state.guestMode;
      DOM.photoGalleryGrid.innerHTML = `
        <div class="empty-gallery-state">
          <div class="empty-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <h3 style="font-size: 1.2rem; font-weight: 700;">${isLoggedOut ? 'Sign in to access your photography vault' : 'No photos in this view'}</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted); max-width: 380px;">
            ${isLoggedOut ? 'Log in or create a studio account to store your personal photos and albums.' : 'Upload photos to extract EXIF camera data, or adjust your search and filters.'}
          </p>
          <button class="btn btn-primary" id="emptyStateUploadBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>${isLoggedOut ? 'Sign In Now' : 'Upload Photos'}</span>
          </button>
        </div>
      `;
      document.getElementById('emptyStateUploadBtn')?.addEventListener('click', () => {
        if (isLoggedOut) openAuthModal('login');
        else openUploadModal();
      });
      return;
    }

    photos.forEach((photo, idx) => {
      const card = createPhotoCard(photo, idx);
      DOM.photoGalleryGrid.appendChild(card);
    });
  }

  function createPhotoCard(photo, index) {
    const card = document.createElement('article');
    card.className = 'photo-card';
    card.id = `photo-card-${photo.id}`;

    // EXIF summary formatted pill
    const camName = photo.metadata?.cameraModel || 'Camera';
    const aperture = photo.metadata?.aperture || '';
    const shutter = photo.metadata?.shutterSpeed || '';
    const iso = photo.metadata?.iso ? `ISO ${photo.metadata.iso}` : '';
    const exifSummary = [camName, aperture, shutter, iso].filter(Boolean).join(' • ');

    const placeName = photo.metadata?.location?.placeName || (photo.metadata?.location?.latitude ? `${photo.metadata.location.latitude.toFixed(2)}°, ${photo.metadata.location.longitude.toFixed(2)}°` : null);

    card.innerHTML = `
      <div class="card-img-container">
        <img class="card-img" src="${photo.thumbnailUrl || photo.dataUrl}" alt="${escapeHtml(photo.title)}" loading="lazy">
        
        <div class="card-overlay-actions">
          <button class="card-action-btn favorite-btn ${photo.favorite ? 'active' : ''}" data-action="favorite" title="Bookmark Favorite">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="${photo.favorite ? '#f43f5e' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          ${!state.guestMode ? `
            <button class="card-action-btn" data-action="assign" title="Organize into Albums">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                <line x1="12" y1="11" x2="12" y2="17"/>
                <line x1="9" y1="14" x2="15" y2="14"/>
              </svg>
            </button>
            <button class="card-action-btn" data-action="delete" title="Delete Photo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          ` : ''}
        </div>

        ${placeName ? `
          <div class="card-geo-badge" title="${placeName}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${escapeHtml(placeName)}</span>
          </div>
        ` : ''}
      </div>

      <div class="card-body">
        <h4 class="card-title">${escapeHtml(photo.title || 'Untitled Photo')}</h4>
        <div class="card-exif-pill" title="${escapeHtml(exifSummary)}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>${escapeHtml(exifSummary || 'Standard Photo')}</span>
        </div>
        ${Array.isArray(photo.tags) && photo.tags.length > 0 ? `
          <div class="card-tags-row">
            ${photo.tags.slice(0, 3).map(t => `<span class="card-tag">#${escapeHtml(t)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    // Click on photo opens Lightbox
    card.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn) {
        const action = btn.dataset.action;
        if (action === 'favorite') {
          e.stopPropagation();
          toggleFavorite(photo.id);
        } else if (action === 'assign') {
          e.stopPropagation();
          openAssignModal(photo);
        } else if (action === 'delete') {
          e.stopPropagation();
          deletePhoto(photo.id);
        }
        return;
      }
      openLightbox(index);
    });

    return card;
  }

  // ==========================================
  // LIGHTBOX & EXIF / MAP INSPECTOR
  // ==========================================
  function openLightbox(index) {
    if (state.currentGalleryPhotos.length === 0) return;
    state.lightboxIndex = Math.max(0, Math.min(index, state.currentGalleryPhotos.length - 1));
    updateLightboxUI();
    DOM.lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    DOM.lightboxModal.classList.remove('active');
    stopSlideshow();
    document.body.style.overflow = '';
  }

  function updateLightboxUI() {
    const photo = state.currentGalleryPhotos[state.lightboxIndex];
    if (!photo) return;

    DOM.lightboxTitle.textContent = photo.title || 'Untitled Photo';
    DOM.lightboxCounter.textContent = `${state.lightboxIndex + 1} of ${state.currentGalleryPhotos.length}`;
    DOM.lightboxMainImg.src = photo.dataUrl;

    // Update favorite icon in lightbox
    const favSvg = DOM.lbFavBtn.querySelector('svg');
    if (photo.favorite) {
      favSvg.setAttribute('fill', '#f43f5e');
      favSvg.style.color = '#f43f5e';
    } else {
      favSvg.setAttribute('fill', 'none');
      favSvg.style.color = 'currentColor';
    }

    // Populate Inspector Drawer Metadata
    const m = photo.metadata || {};
    DOM.drawerCameraBrand.textContent = m.cameraMake || 'UNKNOWN BRAND';
    DOM.drawerCameraModel.textContent = m.cameraModel || 'Standard Camera Device';
    DOM.drawerLensModel.textContent = m.lensModel || 'Lens specs not reported in EXIF';

    DOM.drawerAperture.textContent = m.aperture || '—';
    DOM.drawerShutter.textContent = m.shutterSpeed || '—';
    DOM.drawerIso.textContent = m.iso ? String(m.iso) : '—';
    DOM.drawerFocal.textContent = m.focalLength || '—';

    DOM.drawerCaptureDate.textContent = m.dateTimeOriginal || 'Unknown';
    DOM.drawerDimensions.textContent = m.dimensions?.width ? `${m.dimensions.width} × ${m.dimensions.height} px` : '—';
    DOM.drawerExposureBias.textContent = m.exposureBias || '0.0 EV';
    DOM.drawerFileSize.textContent = ExifProcessor.formatBytes(photo.fileSize);
    DOM.drawerColorSpace.textContent = m.colorSpace || 'sRGB';

    // Geolocation & Interactive Map
    renderInspectorMap(m.location);
  }

  function renderInspectorMap(location) {
    if (location && location.latitude && location.longitude) {
      DOM.drawerLocationText.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>${location.placeName || `${location.latitude}°, ${location.longitude}°`}</span>
      `;
      DOM.gpsMapContainer.style.display = 'block';

      if (window.L) {
        setTimeout(() => {
          if (!state.leafletMap) {
            state.leafletMap = L.map('leafletMap', {
              zoomControl: false,
              attributionControl: false
            }).setView([location.latitude, location.longitude], 12);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 18,
            }).addTo(state.leafletMap);

            state.leafletMarker = L.marker([location.latitude, location.longitude]).addTo(state.leafletMap);
          } else {
            state.leafletMap.invalidateSize();
            state.leafletMap.setView([location.latitude, location.longitude], 12);
            if (state.leafletMarker) {
              state.leafletMarker.setLatLng([location.latitude, location.longitude]);
            }
          }
        }, 150);
      }
    } else {
      DOM.drawerLocationText.innerHTML = `<span>No GPS coordinates embedded in this photo</span>`;
      DOM.gpsMapContainer.style.display = 'none';
    }
  }

  function nextPhoto() {
    if (state.currentGalleryPhotos.length <= 1) return;
    state.lightboxIndex = (state.lightboxIndex + 1) % state.currentGalleryPhotos.length;
    updateLightboxUI();
  }

  function prevPhoto() {
    if (state.currentGalleryPhotos.length <= 1) return;
    state.lightboxIndex = (state.lightboxIndex - 1 + state.currentGalleryPhotos.length) % state.currentGalleryPhotos.length;
    updateLightboxUI();
  }

  function toggleSlideshow() {
    if (state.isSlideshowPlaying) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  }

  function startSlideshow() {
    state.isSlideshowPlaying = true;
    DOM.lbPlayIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
    showToast('Starting slideshow', 'info');
    state.slideshowInterval = setInterval(() => {
      nextPhoto();
    }, 3800);
  }

  function stopSlideshow() {
    state.isSlideshowPlaying = false;
    DOM.lbPlayIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
    if (state.slideshowInterval) {
      clearInterval(state.slideshowInterval);
      state.slideshowInterval = null;
    }
  }

  // ==========================================
  // ACTIONS: FAVORITES & DELETE
  // ==========================================
  async function toggleFavorite(photoId) {
    if (!requireUserAuth('bookmark favorite photos')) return;

    const photo = state.allPhotos.find(p => p.id === photoId);
    if (!photo) return;
    photo.favorite = !photo.favorite;

    // Backend update if online
    if (window.api && window.api.isServerAvailable !== false) {
      try {
        await window.api.toggleFavorite(photoId);
      } catch (err) {
        console.warn('Backend favorite sync failed, cached locally:', err);
      }
    }

    // Local IndexedDB update
    try {
      await window.photoDB.updatePhoto(photoId, { favorite: photo.favorite });
    } catch (e) {}

    showToast(photo.favorite ? 'Added to Favorites' : 'Removed from Favorites', 'info');
    renderGallery();
    updateSidebarCounts();

    if (DOM.lightboxModal.classList.contains('active')) {
      updateLightboxUI();
    }
  }

  async function deletePhoto(photoId) {
    if (!requireUserAuth('delete photos')) return;
    if (!confirm('Are you sure you want to delete this photo? This cannot be undone.')) return;

    // Backend deletion if online
    if (window.api && window.api.isServerAvailable !== false) {
      try {
        await window.api.deletePhoto(photoId);
      } catch (err) {
        console.warn('Backend delete failed, removing locally:', err);
      }
    }

    // Local IndexedDB deletion
    try {
      await window.photoDB.deletePhoto(photoId);
    } catch (e) {}

    showToast('Photo deleted', 'info');
    if (DOM.lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
    await refreshData();
  }

  // ==========================================
  // PHOTO UPLOAD & EXIF PROCESSING PIPELINE
  // ==========================================
  function openUploadModal() {
    if (!requireUserAuth('upload photos to your vault')) return;
    DOM.uploadModal.classList.add('active');
    DOM.uploadProgressCard.style.display = 'none';
    DOM.uploadProgressBar.style.width = '0%';
  }

  function closeUploadModal() {
    DOM.uploadModal.classList.remove('active');
  }

  async function processSelectedFiles(files) {
    if (!files || files.length === 0) return;
    if (!requireUserAuth('upload photos')) return;

    DOM.uploadProgressCard.style.display = 'flex';
    DOM.uploadProgressBar.style.width = '10%';
    DOM.uploadStatusText.textContent = `Reading ${files.length} file(s)...`;

    const targetAlbumId = DOM.uploadTargetAlbumSelect.value;
    const newPhotos = [];
    const isOnline = Boolean(window.api && window.api.isServerAvailable !== false);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      DOM.uploadStatusText.textContent = `Extracting EXIF & GPS from "${file.name}" (${i + 1}/${files.length})...`;
      const stepPct = Math.round(((i + 0.5) / files.length) * 85);
      DOM.uploadProgressBar.style.width = `${stepPct}%`;

      try {
        // Step 1: Extract complete EXIF, GPS, camera metadata client-side
        const metadata = await ExifProcessor.extractMetadata(file);

        let savedPhoto = null;

        // Step 2: Upload to Backend if server is online
        if (isOnline) {
          DOM.uploadStatusText.textContent = `Uploading "${file.name}" to server (${i + 1}/${files.length})...`;
          const formData = new FormData();
          formData.append('file', file);
          formData.append('title', file.name.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' '));
          if (targetAlbumId) formData.append('albumId', targetAlbumId);
          formData.append('metadata', JSON.stringify(metadata));
          formData.append('tags', `upload, ${metadata.cameraMake || ''}`);

          try {
            const res = await window.api.uploadPhoto(formData);
            if (res && res.photo) {
              savedPhoto = normalizePhoto(res.photo);
              // Cache in local IndexedDB
              await window.photoDB.savePhoto(savedPhoto);
            }
          } catch (uploadErr) {
            console.warn('Backend photo upload failed, switching to local store:', uploadErr);
          }
        }

        // Step 3: Offline fallback if backend was unavailable or failed
        if (!savedPhoto) {
          DOM.uploadStatusText.textContent = `Saving "${file.name}" to offline vault...`;
          const dataUrl = await readFileAsDataURL(file);
          savedPhoto = {
            id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' '),
            description: '',
            dataUrl: dataUrl,
            thumbnailUrl: dataUrl,
            mimeType: file.type || 'image/jpeg',
            fileSize: file.size,
            favorite: false,
            albumIds: targetAlbumId ? [targetAlbumId] : [],
            tags: ['upload', (metadata.cameraMake || '').toLowerCase().replace(/\s+/g, '')].filter(Boolean),
            createdAt: Date.now(),
            metadata: metadata
          };
          await window.photoDB.savePhoto(savedPhoto);
        }

        newPhotos.push(savedPhoto);
      } catch (err) {
        console.error('Failed to process file:', file.name, err);
      }

      DOM.uploadProgressBar.style.width = `${Math.round(((i + 1) / files.length) * 95)}%`;
    }

    DOM.uploadProgressBar.style.width = '100%';
    DOM.uploadStatusText.textContent = isOnline
      ? 'Photos safely stored in server database!'
      : 'Photos stored in local IndexedDB vault!';

    showToast(`Successfully ingested ${newPhotos.length} photo(s) with EXIF metadata!`, 'success');

    setTimeout(async () => {
      closeUploadModal();
      await refreshData();
    }, 450);
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  function setupDragDrop() {
    const dropzone = DOM.uploadDropzone;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      processSelectedFiles(files);
    });

    DOM.browseFilesBtn.addEventListener('click', () => {
      DOM.fileInputElement.click();
    });

    DOM.fileInputElement.addEventListener('change', (e) => {
      processSelectedFiles(e.target.files);
    });
  }

  // ==========================================
  // ALBUM CREATION, EDITING & DELETION
  // ==========================================
  function openAlbumModal(album = null) {
    if (!requireUserAuth(album ? 'edit albums' : 'create albums')) return;

    if (album) {
      DOM.albumModalTitle.textContent = 'Edit Album';
      DOM.editAlbumId.value = album.id;
      DOM.albumTitleInput.value = album.title;
      DOM.albumDescInput.value = album.description || '';
      state.selectedColor = album.accentColor || '#38bdf8';
      DOM.deleteAlbumModalBtn.style.display = 'inline-flex';
    } else {
      DOM.albumModalTitle.textContent = 'Create New Album';
      DOM.editAlbumId.value = '';
      DOM.albumTitleInput.value = '';
      DOM.albumDescInput.value = '';
      state.selectedColor = '#38bdf8';
      DOM.deleteAlbumModalBtn.style.display = 'none';
    }

    // Select color swatch
    DOM.albumColorSwatches.querySelectorAll('.color-swatch-opt').forEach(swatch => {
      if (swatch.dataset.color === state.selectedColor) swatch.classList.add('selected');
      else swatch.classList.remove('selected');
    });

    DOM.albumModal.classList.add('active');
    DOM.albumTitleInput.focus();
  }

  function closeAlbumModal() {
    DOM.albumModal.classList.remove('active');
  }

  async function handleSaveAlbum() {
    if (!requireUserAuth('save albums')) return;

    const title = DOM.albumTitleInput.value.trim();
    if (!title) {
      DOM.albumTitleInput.focus();
      return;
    }

    const editId = DOM.editAlbumId.value;
    const isOnline = Boolean(window.api && window.api.isServerAvailable !== false);

    if (editId) {
      // 1. Update existing album
      let updatedAlbum = null;
      if (isOnline) {
        try {
          const res = await window.api.updateAlbum(editId, {
            title: title,
            description: DOM.albumDescInput.value.trim(),
            accent_color: state.selectedColor,
            accentColor: state.selectedColor
          });
          if (res && res.album) updatedAlbum = normalizeAlbum(res.album);
        } catch (err) {
          console.warn('Backend album update failed, saving locally:', err);
        }
      }

      if (!updatedAlbum) {
        const localAlbum = (await window.photoDB.getAlbum(editId)) || state.allAlbums.find(a => a.id === editId) || {};
        updatedAlbum = {
          ...localAlbum,
          id: editId,
          title: title,
          description: DOM.albumDescInput.value.trim(),
          accentColor: state.selectedColor,
          updatedAt: Date.now()
        };
      }

      await window.photoDB.saveAlbum(updatedAlbum);
      showToast('Album updated successfully', 'success');
    } else {
      // 2. Create new album
      let newAlbum = null;
      if (isOnline) {
        try {
          const res = await window.api.createAlbum({
            title: title,
            description: DOM.albumDescInput.value.trim(),
            accent_color: state.selectedColor,
            accentColor: state.selectedColor,
            visibility: 'private'
          });
          if (res && res.album) newAlbum = normalizeAlbum(res.album);
        } catch (err) {
          console.warn('Backend album creation failed, saving locally:', err);
        }
      }

      if (!newAlbum) {
        newAlbum = {
          id: 'album-' + Date.now(),
          title: title,
          description: DOM.albumDescInput.value.trim(),
          accentColor: state.selectedColor,
          createdAt: Date.now(),
          sharing: {
            isShared: false,
            shareToken: 'shr-' + Math.random().toString(36).substr(2, 8),
            allowDownload: true,
            stripExifOnShare: true,
            passwordProtected: false
          }
        };
      }

      await window.photoDB.saveAlbum(newAlbum);
      showToast(`Created album "${title}"`, 'success');
      state.activeFilter = newAlbum.id;
    }

    closeAlbumModal();
    await refreshData();
  }

  async function handleDeleteAlbum() {
    if (!requireUserAuth('delete albums')) return;

    const editId = DOM.editAlbumId.value;
    if (!editId) return;

    const album = state.allAlbums.find(a => a.id === editId);
    const title = album ? album.title : 'this album';

    if (!confirm(`Are you sure you want to delete the album "${title}"? Photos inside will remain in your library.`)) {
      return;
    }

    // Backend deletion if online
    if (window.api && window.api.isServerAvailable !== false) {
      try {
        await window.api.deleteAlbum(editId);
      } catch (err) {
        console.warn('Backend album deletion failed, deleting locally:', err);
      }
    }

    // Local deletion
    try {
      await window.photoDB.deleteAlbum(editId);
    } catch (e) {}

    showToast(`Deleted album "${title}"`, 'info');
    state.activeFilter = 'all';
    closeAlbumModal();
    await refreshData();
  }

  // ==========================================
  // ASSIGN PHOTO TO ALBUMS MODAL
  // ==========================================
  function openAssignModal(photo) {
    if (!requireUserAuth('organize photos into albums')) return;

    state.photoToAssign = photo;
    DOM.assignModalSubtitle.textContent = `Select albums for "${photo.title}":`;
    DOM.assignAlbumsChecklist.innerHTML = '';

    state.allAlbums.forEach(album => {
      const isChecked = photo.albumIds && photo.albumIds.includes(album.id);
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '0.75rem';
      label.style.padding = '0.6rem 0.85rem';
      label.style.background = 'var(--bg-surface-elevated)';
      label.style.borderRadius = 'var(--radius-md)';
      label.style.cursor = 'pointer';

      label.innerHTML = `
        <input type="checkbox" value="${album.id}" ${isChecked ? 'checked' : ''} style="width:16px; height:16px; accent-color: var(--accent-primary);">
        <span class="album-color-dot" style="background: ${album.accentColor || '#38bdf8'};"></span>
        <span style="font-weight: 600; font-size: 0.9rem;">${escapeHtml(album.title)}</span>
      `;
      DOM.assignAlbumsChecklist.appendChild(label);
    });

    DOM.assignAlbumModal.classList.add('active');
  }

  function closeAssignModal() {
    DOM.assignAlbumModal.classList.remove('active');
    state.photoToAssign = null;
  }

  async function handleSaveAssignments() {
    if (!state.photoToAssign) return;
    if (!requireUserAuth('assign albums')) return;

    const checkboxes = DOM.assignAlbumsChecklist.querySelectorAll('input[type="checkbox"]');
    const selectedAlbumIds = [];
    checkboxes.forEach(cb => {
      if (cb.checked) selectedAlbumIds.push(cb.value);
    });

    // Backend update if online
    if (window.api && window.api.isServerAvailable !== false) {
      try {
        await window.api.assignAlbums(state.photoToAssign.id, selectedAlbumIds);
      } catch (err) {
        console.warn('Backend assign albums failed, updating locally:', err);
      }
    }

    // Local IndexedDB update
    try {
      await window.photoDB.updatePhoto(state.photoToAssign.id, { albumIds: selectedAlbumIds });
    } catch (e) {}

    showToast('Album assignments updated', 'success');
    closeAssignModal();
    await refreshData();
  }

  // ==========================================
  // SHARING SUBSYSTEM & SECURE QR CODES
  // ==========================================
  async function openShareModal() {
    let albumToShare = null;
    if (state.activeFilter !== 'all' && state.activeFilter !== 'favorites' && state.activeFilter !== 'geotagged') {
      albumToShare = state.allAlbums.find(a => a.id === state.activeFilter);
    }

    const albumTitle = albumToShare ? albumToShare.title : 'Selected Collection';
    DOM.shareAlbumName.textContent = albumTitle;

    const baseUrl = window.location.origin;
    let fullShareUrl = `${baseUrl}?share=${encodeURIComponent(albumToShare ? (albumToShare.sharing?.shareToken || albumToShare.id) : 'all')}`;

    // Generate real secure share link from Backend API if online
    if (albumToShare && window.api && window.api.isServerAvailable !== false) {
      try {
        const hideGps = DOM.stripExifShareToggle.checked ? 1 : 0;
        const shareRes = await window.api.createShare(albumToShare.id, {
          access_type: 'anyone',
          permission: 'view',
          hide_gps: hideGps,
          hide_camera: 0,
          strip_exif_download: 1,
          allow_download: 1
        });

        if (shareRes && shareRes.shareUrl) {
          fullShareUrl = shareRes.shareUrl;
          if (albumToShare.sharing) {
            albumToShare.sharing.shareToken = shareRes.share.share_token;
          }
        }
      } catch (err) {
        console.warn('Backend share generation fallback:', err);
      }
    }

    DOM.shareUrlDisplay.value = fullShareUrl;

    // Render QR Code onto Canvas
    if (window.renderQRCode) {
      window.renderQRCode(DOM.shareQrCanvas, fullShareUrl, {
        size: 180,
        colorDark: '#0f172a',
        colorLight: '#ffffff'
      });
    }

    DOM.shareModal.classList.add('active');
  }

  function closeShareModal() {
    DOM.shareModal.classList.remove('active');
  }

  function copyShareUrl() {
    DOM.shareUrlDisplay.select();
    navigator.clipboard.writeText(DOM.shareUrlDisplay.value).then(() => {
      showToast('Secure share link copied to clipboard!', 'success');
    }).catch(() => {
      document.execCommand('copy');
      showToast('Share link copied!', 'success');
    });
  }

  function handleNativeShare() {
    if (navigator.share) {
      navigator.share({
        title: DOM.shareAlbumName.textContent,
        text: `Check out my photo album "${DOM.shareAlbumName.textContent}" on LuminaLens:`,
        url: DOM.shareUrlDisplay.value
      }).catch((e) => console.log('Share dismissed', e));
    } else {
      copyShareUrl();
    }
  }

  // Cross-Device Public Guest Viewing
  async function handleSharedLinkParam(token) {
    state.guestMode = true;
    DOM.guestModeBanner.style.display = 'flex';

    let loaded = false;

    // 1. Try public backend shared endpoint (cross-device capable!)
    if (window.api) {
      try {
        const sharedData = await window.api.getSharedAlbum(token);
        if (sharedData && sharedData.album) {
          state.sharedAlbumData = sharedData;
          state.allAlbums = [normalizeAlbum(sharedData.album)];
          state.allPhotos = (sharedData.photos || []).map(normalizePhoto);
          state.activeFilter = sharedData.album.id;
          state.sharedAlbumId = sharedData.album.id;
          loaded = true;
          showToast(`Viewing shared album: "${sharedData.album.title}"`, 'info');
        }
      } catch (err) {
        console.warn('Public backend shared lookup error:', err);
      }
    }

    // 2. Fallback to local IndexedDB matching if offline
    if (!loaded) {
      const localPhotos = (await window.photoDB.getAllPhotos()).map(normalizePhoto);
      const localAlbums = (await window.photoDB.getAllAlbums()).map(normalizeAlbum);
      state.allPhotos = localPhotos;
      state.allAlbums = localAlbums;

      const album = state.allAlbums.find(a => a.sharing?.shareToken === token || a.id === token);
      if (album) {
        state.activeFilter = album.id;
        state.sharedAlbumId = album.id;
      } else {
        state.activeFilter = 'all';
      }
    }

    populateCameraFilterOptions();
    updateSidebarCounts();
    renderSidebarAlbums();
    renderTagsCloud();
    updateStorageMeter();
    renderHeroBanner();
    renderGallery();
  }

  function previewGuestExperience() {
    closeShareModal();
    const token = state.activeFilter;
    handleSharedLinkParam(token);
    showToast('Guest mode enabled. This simulates how your shared album appears to visitors.', 'info');
  }

  async function exitGuestMode() {
    state.guestMode = false;
    state.sharedAlbumData = null;
    DOM.guestModeBanner.style.display = 'none';
    const cleanUrl = window.location.origin + window.location.pathname.replace(/\/shared\/.*$/, '');
    window.history.replaceState({}, document.title, cleanUrl);
    state.activeFilter = 'all';
    await refreshData();
    showToast('Returned to Studio Editor', 'info');
  }

  // ==========================================
  // PRIVACY SANITIZER & DOWNLOADS
  // ==========================================
  async function downloadOriginalPhoto() {
    const photo = state.currentGalleryPhotos[state.lightboxIndex];
    if (!photo) return;
    const a = document.createElement('a');
    a.href = photo.dataUrl;
    a.download = `${photo.title || 'photo'}.jpg`;
    a.click();
    showToast('Downloading photo...', 'info');
  }

  async function exportStrippedPhoto() {
    const photo = state.currentGalleryPhotos[state.lightboxIndex];
    if (!photo) return;
    showToast('Stripping GPS & camera identifiers for privacy...', 'info');

    try {
      const sanitizedBlob = await ExifProcessor.stripExifForPrivacy(photo.dataUrl);
      const url = URL.createObjectURL(sanitizedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${photo.title || 'photo'}-privacy-safe.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Privacy-sanitized photo downloaded!', 'success');
    } catch (err) {
      console.error('Failed to strip metadata:', err);
      showToast('Could not sanitize metadata', 'error');
    }
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';

    let iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    if (type === 'success') {
      toast.style.borderLeftColor = 'var(--accent-emerald)';
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      toast.style.borderLeftColor = '#f43f5e';
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ==========================================
  // EVENT LISTENERS & KEYBOARD BINDINGS
  // ==========================================
  function setupEventListeners() {
    // Authentication & Profile Navbar Controls
    DOM.btnNavSignIn.addEventListener('click', () => openAuthModal('login'));

    DOM.userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = DOM.userDropdownMenu.classList.contains('show');
      DOM.userDropdownMenu.classList.toggle('show', !isOpen);
      DOM.userProfileBtn.classList.toggle('active', !isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!DOM.userMenuContainer.contains(e.target)) {
        DOM.userDropdownMenu.classList.remove('show');
        DOM.userProfileBtn.classList.remove('active');
      }
    });

    DOM.btnProfileSettings.addEventListener('click', openProfileModal);
    DOM.btnSignOut.addEventListener('click', handleLogout);
    DOM.profileModalLogoutBtn.addEventListener('click', handleLogout);
    DOM.closeProfileModalBtn.addEventListener('click', closeProfileModal);
    DOM.closeProfileModalDoneBtn.addEventListener('click', closeProfileModal);
    DOM.profileModal.addEventListener('click', (e) => {
      if (e.target === DOM.profileModal) closeProfileModal();
    });

    // Auth Modal Tabs & Actions
    DOM.closeAuthModalBtn.addEventListener('click', closeAuthModal);
    DOM.authModal.addEventListener('click', (e) => {
      if (e.target === DOM.authModal) closeAuthModal();
    });
    DOM.tabLoginBtn.addEventListener('click', () => setAuthModalMode('login'));
    DOM.tabRegisterBtn.addEventListener('click', () => setAuthModalMode('register'));

    DOM.authSwitchPrompt?.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'linkSwitchToRegister') {
        e.preventDefault();
        setAuthModalMode('register');
      } else if (e.target && e.target.id === 'linkSwitchToLogin') {
        e.preventDefault();
        setAuthModalMode('login');
      }
    });

    DOM.loginForm.addEventListener('submit', handleLoginSubmit);
    DOM.registerForm.addEventListener('submit', handleRegisterSubmit);

    // Quick Demo Credentials Fill
    DOM.btnFillDemoCreds.addEventListener('click', () => {
      DOM.loginEmail.value = 'demo@luminalens.app';
      DOM.loginPassword.value = 'password123';
      DOM.loginSubmitBtn.focus();
    });

    // Password Visibility Toggles
    DOM.toggleLoginPasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility(DOM.loginPassword, DOM.toggleLoginPasswordBtn);
    });

    DOM.toggleRegisterPasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility(DOM.registerPassword, DOM.toggleRegisterPasswordBtn);
    });

    DOM.toggleRegisterConfirmPasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility(DOM.registerConfirmPassword, DOM.toggleRegisterConfirmPasswordBtn);
    });

    // Navigation Brand
    DOM.brandHomeBtn.addEventListener('click', () => setActiveFilter('all'));
    DOM.navAllPhotos.addEventListener('click', () => setActiveFilter('all'));
    DOM.navFavorites.addEventListener('click', () => setActiveFilter('favorites'));
    DOM.navGeotagged.addEventListener('click', () => setActiveFilter('geotagged'));

    // Search
    DOM.globalSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderGallery();
    });

    // Camera Filter
    DOM.cameraSelectFilter.addEventListener('change', (e) => {
      state.cameraFilter = e.target.value;
      renderGallery();
    });

    // Sort Select
    DOM.sortSelect.addEventListener('change', (e) => {
      state.sortOrder = e.target.value;
      renderGallery();
    });

    // Quick Filter Badges
    DOM.filterPillFavorites.addEventListener('click', () => {
      state.favoritesOnly = !state.favoritesOnly;
      DOM.filterPillFavorites.classList.toggle('active', state.favoritesOnly);
      renderGallery();
    });

    DOM.filterPillGps.addEventListener('click', () => {
      state.gpsOnly = !state.gpsOnly;
      DOM.filterPillGps.classList.toggle('active', state.gpsOnly);
      renderGallery();
    });

    // Modals
    DOM.btnNewAlbum.addEventListener('click', () => openAlbumModal());
    DOM.sidebarAddAlbumBtn.addEventListener('click', () => openAlbumModal());
    DOM.closeAlbumModalBtn.addEventListener('click', closeAlbumModal);
    DOM.cancelAlbumModalBtn.addEventListener('click', closeAlbumModal);
    DOM.saveAlbumBtn.addEventListener('click', handleSaveAlbum);
    DOM.deleteAlbumModalBtn.addEventListener('click', handleDeleteAlbum);

    DOM.btnEditAlbum.addEventListener('click', () => {
      const album = state.allAlbums.find(a => a.id === state.activeFilter);
      if (album) openAlbumModal(album);
    });

    // Color Swatches
    DOM.albumColorSwatches.addEventListener('click', (e) => {
      const swatch = e.target.closest('.color-swatch-opt');
      if (swatch) {
        DOM.albumColorSwatches.querySelectorAll('.color-swatch-opt').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        state.selectedColor = swatch.dataset.color;
      }
    });

    // Sharing
    DOM.btnHeroShare.addEventListener('click', openShareModal);
    DOM.closeShareModalBtn.addEventListener('click', closeShareModal);
    DOM.doneShareBtn.addEventListener('click', closeShareModal);
    DOM.copyShareLinkBtn.addEventListener('click', copyShareUrl);
    DOM.nativeShareBtn.addEventListener('click', handleNativeShare);
    DOM.previewGuestViewBtn.addEventListener('click', previewGuestExperience);
    DOM.btnExitGuestMode.addEventListener('click', exitGuestMode);
    DOM.stripExifShareToggle.addEventListener('change', () => openShareModal());

    // Upload
    DOM.btnUploadPhotos.addEventListener('click', openUploadModal);
    DOM.closeUploadModalBtn.addEventListener('click', closeUploadModal);
    DOM.cancelUploadBtn.addEventListener('click', closeUploadModal);

    // Assign Modal
    DOM.closeAssignModalBtn.addEventListener('click', closeAssignModal);
    DOM.cancelAssignBtn.addEventListener('click', closeAssignModal);
    DOM.saveAssignBtn.addEventListener('click', handleSaveAssignments);

    // Lightbox Controls
    DOM.lbCloseBtn.addEventListener('click', closeLightbox);
    DOM.lbNextBtn.addEventListener('click', nextPhoto);
    DOM.lbPrevBtn.addEventListener('click', prevPhoto);
    DOM.lbSlideshowBtn.addEventListener('click', toggleSlideshow);
    DOM.btnHeroSlideshow.addEventListener('click', () => {
      if (state.currentGalleryPhotos.length > 0) {
        openLightbox(0);
        startSlideshow();
      }
    });

    DOM.lbFavBtn.addEventListener('click', () => {
      const photo = state.currentGalleryPhotos[state.lightboxIndex];
      if (photo) toggleFavorite(photo.id);
    });

    DOM.lbDownloadBtn.addEventListener('click', downloadOriginalPhoto);
    DOM.btnExportStrippedPhoto.addEventListener('click', exportStrippedPhoto);

    DOM.lbToggleInfoBtn.addEventListener('click', () => {
      DOM.lightboxDrawer.classList.toggle('open');
    });

    DOM.drawerCloseSubBtn.addEventListener('click', () => {
      DOM.lightboxDrawer.classList.remove('open');
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (DOM.lightboxModal.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowRight') nextPhoto();
        else if (e.key === 'ArrowLeft') prevPhoto();
        else if (e.key === ' ') {
          e.preventDefault();
          toggleSlideshow();
        } else if (e.key === 'i' || e.key === 'I') {
          DOM.lightboxDrawer.classList.toggle('open');
        }
      } else {
        if (e.key === 'Escape') {
          closeAlbumModal();
          closeShareModal();
          closeUploadModal();
          closeAssignModal();
          closeAuthModal();
          closeProfileModal();
        }
      }
    });
  }

  // Helper escape function
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Run initial setup on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
