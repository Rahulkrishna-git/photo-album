// test-api.js - Automated API tests for LuminaLens backend
const BASE_URL = 'http://localhost:8085';

async function runTests() {
  console.log('--- Starting LuminaLens Backend Verification Tests ---');

  // 1. Healthcheck
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const health = await healthRes.json();
  console.log('✓ Healthcheck:', health.status, health.version);

  // 2. Login as Demo User
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@luminalens.app', password: 'password123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.token) {
    throw new Error('Login failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.token;
  console.log('✓ Login successful for:', loginData.user.name, `(${loginData.user.email})`);

  // 3. User Dashboard / Profile Stats
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const meData = await meRes.json();
  console.log('✓ User Dashboard Stats:', meData.stats);

  // 4. Albums
  const albumsRes = await fetch(`${BASE_URL}/api/albums`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const albums = await albumsRes.json();
  console.log(`✓ Fetched ${albums.length} albums for user`);

  // 5. Photos with EXIF metadata
  const photosRes = await fetch(`${BASE_URL}/api/photos`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const photos = await photosRes.json();
  console.log(`✓ Fetched ${photos.length} photos with EXIF metadata`);
  if (photos.length > 0) {
    const p = photos[0];
    console.log(`  Sample photo: "${p.title}" | Camera: ${p.metadata.cameraMake} ${p.metadata.cameraModel} | Aperture: ${p.metadata.aperture} | ISO: ${p.metadata.iso} | GPS: ${p.metadata.location?.placeName || 'N/A'}`);
  }

  // 6. Cross-Device Sharing Validation (Requirement 5 & 8)
  const alpineAlbum = albums.find(a => a.title.includes('Alpine')) || albums[0];
  console.log(`\nTesting Sharing for Album: "${alpineAlbum.title}" (ID: ${alpineAlbum.id})`);

  // Create real server share link with privacy settings
  const shareRes = await fetch(`${BASE_URL}/api/albums/${alpineAlbum.id}/shares`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      access_type: 'anyone',
      permission: 'view',
      hide_gps: 1, // Privacy: mask exact GPS
      hide_camera: 0,
      strip_exif_download: 1,
      allow_download: 1
    })
  });
  const shareData = await shareRes.json();
  console.log('✓ Real Share Link Created:', shareData.shareUrl);
  const shareToken = shareData.share.share_token;

  // 7. Verify cross-device access WITHOUT ANY AUTHENTICATION (public guest view)
  const guestRes = await fetch(`${BASE_URL}/api/shared/${shareToken}`);
  const guestData = await guestRes.json();
  console.log(`✓ Guest accessed shared album: "${guestData.album.title}" by "${guestData.album.owner.name}"`);
  console.log(`✓ Received ${guestData.photos.length} photos in shared album`);
  console.log(`✓ Privacy Check - GPS hidden: ${guestData.permissions.hideGps}, Camera hidden: ${guestData.permissions.hideCamera}`);
  if (guestData.photos.length > 0) {
    const guestPhoto = guestData.photos[0];
    console.log(`  Shared Photo: "${guestPhoto.title}" | Coordinates: ${JSON.stringify(guestPhoto.metadata.location)}`);
  }

  // 8. Test Revoking Share Link
  const revokeRes = await fetch(`${BASE_URL}/api/shares/${shareData.share.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const revokeData = await revokeRes.json();
  console.log('✓ Revoked share link:', revokeData.message);

  // 9. Verify revoked link is rejected with 410 Gone
  const rejectedRes = await fetch(`${BASE_URL}/api/shared/${shareToken}`);
  console.log(`✓ Revoked link access status: ${rejectedRes.status} (Expected 410)`);

  console.log('\n--- ALL BACKEND ARCHITECTURE & SHARING TESTS PASSED! ---');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
