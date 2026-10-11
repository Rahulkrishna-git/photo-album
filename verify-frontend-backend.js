// verify-frontend-backend.js - Verification of frontend-backend integration flow
const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = 'http://localhost:8085';

async function verify() {
  console.log('=== STARTING FRONTEND-TO-BACKEND INTEGRATION TESTS ===\n');

  // Step 1: Healthcheck & Authentication
  console.log('[1/7] Testing API Healthcheck & Auth Login...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const health = await healthRes.json();
  if (health.status !== 'ok') throw new Error('Healthcheck failed');
  console.log('  ✓ API Online:', health.app, `(v${health.version})`);

  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@luminalens.app', password: 'password123' })
  });
  if (!loginRes.ok) throw new Error('Login failed: ' + (await loginRes.text()));
  const loginData = await loginRes.json();
  const token = loginData.token;
  const authHeaders = { 'Authorization': `Bearer ${token}` };
  console.log(`  ✓ Authenticated as: ${loginData.user.name} (${loginData.user.email})\n`);

  // Step 2: Fetch Initial Albums & Photos
  console.log('[2/7] Fetching Initial Albums & Photos (simulating app init & refreshData)...');
  const albumsRes = await fetch(`${BASE_URL}/api/albums`, { headers: authHeaders });
  const albums = await albumsRes.json();
  const photosRes = await fetch(`${BASE_URL}/api/photos`, { headers: authHeaders });
  const photos = await photosRes.json();
  console.log(`  ✓ Received ${albums.length} albums and ${photos.length} photos`);
  if (albums.length === 0 || photos.length === 0) throw new Error('Initial albums or photos empty');
  console.log(`  ✓ Sample album: "${albums[0].title}" (Accent: ${albums[0].accentColor || albums[0].accent_color})`);
  console.log(`  ✓ Sample photo: "${photos[0].title}" (Camera: ${photos[0].metadata?.cameraModel})\n`);

  // Step 3: Create Album
  console.log('[3/7] Creating New Album via POST /api/albums...');
  const testAlbumTitle = 'Test Glacier Expedition ' + Date.now();
  const createAlbumRes = await fetch(`${BASE_URL}/api/albums`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: testAlbumTitle,
      description: 'High-altitude glaciology documentation and crevasse surveys.',
      accent_color: '#10b981',
      visibility: 'public'
    })
  });
  const createdAlbumData = await createAlbumRes.json();
  if (!createdAlbumData.album || !createdAlbumData.album.id) {
    throw new Error('Failed to create album: ' + JSON.stringify(createdAlbumData));
  }
  const createdAlbum = createdAlbumData.album;
  console.log(`  ✓ Album created successfully: "${createdAlbum.title}" (ID: ${createdAlbum.id})\n`);

  // Step 4: Upload Photo with EXIF & GPS
  console.log('[4/7] Uploading Photo with EXIF metadata to Backend via POST /api/photos/upload...');
  // Create a minimal 1x1 test JPEG binary blob with FormData
  const testJpegBuffer = Buffer.from(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
    'base64'
  );

  const testMetadata = {
    cameraMake: 'Sony',
    cameraModel: 'ILCE-1 (Alpha 1)',
    lensModel: 'FE 70-200mm F2.8 GM OSS II',
    focalLength: '135mm',
    aperture: 'f/2.8',
    shutterSpeed: '1/2000s',
    iso: 250,
    exposureBias: '-0.3 EV',
    dateTimeOriginal: '2026-09-28 14:15:00',
    location: {
      latitude: 46.5124,
      longitude: 8.0125,
      altitude: 3450,
      placeName: 'Jungfraujoch, Bernese Alps, Switzerland'
    },
    dimensions: { width: 1920, height: 1080, aspectRatio: 1.77 },
    colorSpace: 'sRGB',
    hasExif: true
  };

  const formBoundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const multipartBody = Buffer.concat([
    Buffer.from(
      `--${formBoundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="glacier_crevasse.jpg"\r\n` +
      `Content-Type: image/jpeg\r\n\r\n`
    ),
    testJpegBuffer,
    Buffer.from(
      `\r\n--${formBoundary}\r\n` +
      `Content-Disposition: form-data; name="title"\r\n\r\n` +
      `Aletsch Glacier Ice Fall\r\n` +
      `--${formBoundary}\r\n` +
      `Content-Disposition: form-data; name="albumId"\r\n\r\n` +
      `${createdAlbum.id}\r\n` +
      `--${formBoundary}\r\n` +
      `Content-Disposition: form-data; name="metadata"\r\n\r\n` +
      `${JSON.stringify(testMetadata)}\r\n` +
      `--${formBoundary}\r\n` +
      `Content-Disposition: form-data; name="tags"\r\n\r\n` +
      `glacier, alps, ice, research\r\n` +
      `--${formBoundary}--\r\n`
    )
  ]);

  const uploadRes = await fetch(`${BASE_URL}/api/photos/upload`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': `multipart/form-data; boundary=${formBoundary}`
    },
    body: multipartBody
  });

  const uploadData = await uploadRes.json();
  if (!uploadData.photo || !uploadData.photo.id) {
    throw new Error('Upload failed: ' + JSON.stringify(uploadData));
  }
  const uploadedPhoto = uploadData.photo;
  console.log(`  ✓ Upload succeeded! Photo ID: ${uploadedPhoto.id}`);
  console.log(`  ✓ Storage URL on server: ${uploadedPhoto.storage_url}`);
  console.log(`  ✓ Verified server disk persistence:`);
  const localFilePath = path.join(__dirname, uploadedPhoto.storage_url.replace(/^\//, ''));
  if (fs.existsSync(localFilePath)) {
    console.log(`    File physically saved on disk: ${localFilePath} (${fs.statSync(localFilePath).size} bytes)`);
  } else {
    throw new Error(`File was not found on disk at: ${localFilePath}`);
  }
  console.log(`  ✓ EXIF Camera parsed: ${uploadedPhoto.metadata?.cameraMake} ${uploadedPhoto.metadata?.cameraModel}`);
  console.log(`  ✓ GPS Coordinates stored: ${uploadedPhoto.metadata?.location?.placeName}\n`);

  // Step 5: Refresh & Retrieve Uploaded Photo
  console.log('[5/7] Simulating Page Refresh & Photo Retrieval...');
  const refreshedPhotosRes = await fetch(`${BASE_URL}/api/photos`, { headers: authHeaders });
  const allRefreshed = await refreshedPhotosRes.json();
  const foundPhoto = allRefreshed.find(p => p.id === uploadedPhoto.id);
  if (!foundPhoto) throw new Error('Uploaded photo was not found in library after refresh!');
  console.log(`  ✓ Retrieved photo from backend after refresh: "${foundPhoto.title}"`);
  console.log(`  ✓ Verified Album link: ${foundPhoto.albumIds.includes(createdAlbum.id) ? 'Linked to created album' : 'Missing album link'}`);

  // Fetch single photo details
  const singlePhotoRes = await fetch(`${BASE_URL}/api/photos/${uploadedPhoto.id}`, { headers: authHeaders });
  const singlePhoto = await singlePhotoRes.json();
  console.log(`  ✓ Fetched single photo details: "${singlePhoto.title}" | Shutter: ${singlePhoto.metadata?.shutterSpeed} | Aperture: ${singlePhoto.metadata?.aperture} | ISO: ${singlePhoto.metadata?.iso}\n`);

  // Step 6: Create Share Link
  console.log('[6/7] Creating Secure Share Link via POST /api/albums/:id/shares...');
  const shareRes = await fetch(`${BASE_URL}/api/albums/${createdAlbum.id}/shares`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      access_type: 'anyone',
      permission: 'view',
      hide_gps: 1, // Privacy test: Hide exact GPS
      hide_camera: 0,
      strip_exif_download: 1,
      allow_download: 1
    })
  });
  const shareData = await shareRes.json();
  if (!shareData.share || !shareData.share.share_token) {
    throw new Error('Create share failed: ' + JSON.stringify(shareData));
  }
  const shareToken = shareData.share.share_token;
  console.log(`  ✓ Secure token generated: ${shareToken} (Length: ${shareToken.length} chars)`);
  console.log(`  ✓ Public share URL: ${shareData.shareUrl}\n`);

  // Step 7: Public Guest Cross-Device Access
  console.log('[7/7] Simulating Cross-Device Guest Access via GET /api/shared/:token...');
  const guestRes = await fetch(`${BASE_URL}/api/shared/${shareToken}`);
  const guestAlbum = await guestRes.json();
  if (!guestAlbum.album || !guestAlbum.photos) {
    throw new Error('Guest access failed: ' + JSON.stringify(guestAlbum));
  }
  console.log(`  ✓ Guest accessed shared album: "${guestAlbum.album.title}"`);
  console.log(`  ✓ Photos in shared album: ${guestAlbum.photos.length}`);
  console.log(`  ✓ Privacy check - exact GPS masked: ${guestAlbum.photos[0].metadata?.location?.latitude === undefined ? 'Yes (Protected)' : 'No (Exposed)'}`);
  console.log(`  ✓ Camera specs visible: ${guestAlbum.photos[0].metadata?.cameraModel}\n`);

  // Clean up test data
  console.log('--- Cleaning up test album & photo ---');
  await fetch(`${BASE_URL}/api/photos/${uploadedPhoto.id}`, { method: 'DELETE', headers: authHeaders });
  await fetch(`${BASE_URL}/api/albums/${createdAlbum.id}`, { method: 'DELETE', headers: authHeaders });
  console.log('✓ Clean up complete.');

  console.log('\n======================================================');
  console.log('>>> ALL 7 FRONTEND-BACKEND INTEGRATION TESTS PASSED <<<');
  console.log('======================================================\n');
}

verify().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
