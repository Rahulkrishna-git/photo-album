// sample-data.js - Curated demo albums & photos with realistic photographic EXIF metadata

const SAMPLE_ALBUMS = [
  {
    id: 'album-alpine',
    title: 'Alpine Escapes',
    description: 'Breathtaking peaks, glacial valleys, and twilight ridgelines across the Swiss and Italian Alps.',
    accentColor: '#38bdf8', // Sky Cyan
    coverPhotoId: 'photo-1',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    sharing: {
      isShared: true,
      shareToken: 'alp-7f9a2b',
      allowDownload: true,
      stripExifOnShare: false,
      passwordProtected: false
    }
  },
  {
    id: 'album-urban',
    title: 'Urban Neon & Reflections',
    description: 'High-contrast nocturnal streetscapes, glowing neon signage, and rainy alleyways in Tokyo and Hong Kong.',
    accentColor: '#ec4899', // Neon Pink
    coverPhotoId: 'photo-3',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 28,
    sharing: {
      isShared: false,
      shareToken: 'urb-12c8e4',
      allowDownload: true,
      stripExifOnShare: true,
      passwordProtected: false
    }
  },
  {
    id: 'album-wild',
    title: 'Wilderness & Solitude',
    description: 'Ethereal volcanic coastlines of Iceland and granite monoliths of Yosemite under moody skies.',
    accentColor: '#10b981', // Emerald
    coverPhotoId: 'photo-4',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
    sharing: {
      isShared: true,
      shareToken: 'wld-93d4a1',
      allowDownload: true,
      stripExifOnShare: false,
      passwordProtected: false
    }
  },
  {
    id: 'album-golden',
    title: 'Golden Hour Vignettes',
    description: 'Intimate portraits and warm sun-drenched architecture captured during magical golden light.',
    accentColor: '#f59e0b', // Amber
    coverPhotoId: 'photo-6',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
    sharing: {
      isShared: false,
      shareToken: 'gld-65f0e9',
      allowDownload: false,
      stripExifOnShare: true,
      passwordProtected: false
    }
  }
];

const SAMPLE_PHOTOS = [
  {
    id: 'photo-1',
    title: 'Alpenglow on the Matterhorn',
    description: 'Captured at 5:45 AM just as the first morning ray pierced through low hanging clouds at Zermatt.',
    dataUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80',
    mimeType: 'image/jpeg',
    fileSize: 4820300,
    favorite: true,
    albumIds: ['album-alpine'],
    tags: ['mountains', 'sunrise', 'alps', 'snow', 'landscape'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    metadata: {
      cameraMake: 'Sony',
      cameraModel: 'ILCE-7RM5 (A7R V)',
      lensModel: 'FE 24-70mm F2.8 GM II',
      aperture: 'f/8.0',
      shutterSpeed: '1/125s',
      iso: 100,
      focalLength: '35mm',
      exposureBias: '0.0 EV',
      dateTimeOriginal: '2026-08-14 05:47:22',
      location: {
        latitude: 45.9765,
        longitude: 7.7491,
        altitude: 3100,
        placeName: 'Zermatt, Valais, Switzerland'
      },
      dimensions: { width: 4000, height: 2667, aspectRatio: 1.5 },
      colorSpace: 'sRGB',
      hasExif: true
    }
  },
  {
    id: 'photo-2',
    title: 'Emerald Lake Reflection',
    description: 'Glass-smooth alpine lake mirroring towering pine forests and limestone crags before the morning breeze picked up.',
    dataUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80',
    mimeType: 'image/jpeg',
    fileSize: 3950100,
    favorite: false,
    albumIds: ['album-alpine', 'album-wild'],
    tags: ['lake', 'reflections', 'forest', 'calm', 'nature'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    metadata: {
      cameraMake: 'Canon',
      cameraModel: 'EOS R5',
      lensModel: 'RF 15-35mm F2.8 L IS USM',
      aperture: 'f/11.0',
      shutterSpeed: '1/30s',
      iso: 64,
      focalLength: '21mm',
      exposureBias: '-0.3 EV',
      dateTimeOriginal: '2026-08-18 07:15:09',
      location: {
        latitude: 46.5385,
        longitude: 12.0163,
        altitude: 1756,
        placeName: 'Dolomites, Trentino-Alto Adige, Italy'
      },
      dimensions: { width: 3840, height: 2560, aspectRatio: 1.5 },
      colorSpace: 'Adobe RGB',
      hasExif: true
    }
  },
  {
    id: 'photo-3',
    title: 'Rainy Shinjuku Crossing',
    description: 'Umbrellas glowing beneath torrential neon signage during a summer downpour in Tokyo.',
    dataUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=500&q=80',
    mimeType: 'image/jpeg',
    fileSize: 5210400,
    favorite: true,
    albumIds: ['album-urban'],
    tags: ['tokyo', 'neon', 'rain', 'night', 'cyberpunk', 'street'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 22,
    metadata: {
      cameraMake: 'Fujifilm',
      cameraModel: 'X-T5',
      lensModel: 'XF 33mm F1.4 R LM WR',
      aperture: 'f/1.4',
      shutterSpeed: '1/250s',
      iso: 1600,
      focalLength: '33mm',
      exposureBias: '-0.7 EV',
      dateTimeOriginal: '2026-07-02 21:34:18',
      location: {
        latitude: 35.6938,
        longitude: 139.7034,
        altitude: 40,
        placeName: 'Shinjuku, Tokyo, Japan'
      },
      dimensions: { width: 3600, height: 2400, aspectRatio: 1.5 },
      colorSpace: 'sRGB',
      hasExif: true
    }
  },
  {
    id: 'photo-4',
    title: 'Black Sands of Vík',
    description: 'Basalt sea stacks confronting the fierce Atlantic breakers beneath dramatic northern storm clouds.',
    dataUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=500&q=80',
    mimeType: 'image/jpeg',
    fileSize: 4320900,
    favorite: true,
    albumIds: ['album-wild'],
    tags: ['ocean', 'storm', 'iceland', 'moody', 'coastal'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
    metadata: {
      cameraMake: 'Nikon',
      cameraModel: 'Z8',
      lensModel: 'NIKKOR Z 24-120mm f/4 S',
      aperture: 'f/5.6',
      shutterSpeed: '1/640s',
      iso: 200,
      focalLength: '48mm',
      exposureBias: '+0.3 EV',
      dateTimeOriginal: '2026-06-11 16:42:01',
      location: {
        latitude: 63.4186,
        longitude: -19.0060,
        altitude: 12,
        placeName: 'Reynisfjara, Vík í Mýrdal, Iceland'
      },
      dimensions: { width: 3900, height: 2600, aspectRatio: 1.5 },
      colorSpace: 'sRGB',
      hasExif: true
    }
  },
  {
    id: 'photo-5',
    title: 'Manhattan Blue Hour Skyline',
    description: 'The geometric rhythm of lower Manhattan glowing against a deep cobalt sky right at civil twilight.',
    dataUrl: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=500&q=80',
    mimeType: 'image/jpeg',
    fileSize: 6140500,
    favorite: false,
    albumIds: ['album-urban'],
    tags: ['new-york', 'architecture', 'cityscape', 'blue-hour'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    metadata: {
      cameraMake: 'Sony',
      cameraModel: 'ILCE-7M4 (A7 IV)',
      lensModel: 'FE 16-35mm F2.8 GM',
      aperture: 'f/8.0',
      shutterSpeed: '4.0s',
      iso: 100,
      focalLength: '24mm',
      exposureBias: '0.0 EV',
      dateTimeOriginal: '2026-07-24 20:12:44',
      location: {
        latitude: 40.7061,
        longitude: -73.9969,
        altitude: 25,
        placeName: 'Brooklyn Bridge Park, New York, USA'
      },
      dimensions: { width: 4200, height: 2800, aspectRatio: 1.5 },
      colorSpace: 'sRGB',
      hasExif: true
    }
  },
  {
    id: 'photo-6',
    title: 'Sunset over Parisian Rooftops',
    description: 'Zinc roofs and chimney pots bathed in honey-colored light from the dome of Sacré-Cœur.',
    dataUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500&q=80',
    mimeType: 'image/jpeg',
    fileSize: 3410200,
    favorite: true,
    albumIds: ['album-golden'],
    tags: ['paris', 'golden-hour', 'sunset', 'travel', 'europe'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 50,
    metadata: {
      cameraMake: 'Leica',
      cameraModel: 'Leica Q3',
      lensModel: 'Summilux 28mm f/1.7 ASPH',
      aperture: 'f/2.4',
      shutterSpeed: '1/800s',
      iso: 125,
      focalLength: '28mm',
      exposureBias: '+0.3 EV',
      dateTimeOriginal: '2026-05-30 20:45:11',
      location: {
        latitude: 48.8867,
        longitude: 2.3431,
        altitude: 130,
        placeName: 'Montmartre, Paris, France'
      },
      dimensions: { width: 3500, height: 2333, aspectRatio: 1.5 },
      colorSpace: 'sRGB',
      hasExif: true
    }
  },
  {
    id: 'photo-7',
    title: 'Yosemite Valley Mist & El Capitan',
    description: 'Morning low ceiling fog lifting across the Merced River with El Capitan towering majestically.',
    dataUrl: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=500&q=80',
    mimeType: 'image/jpeg',
    fileSize: 4720100,
    favorite: true,
    albumIds: ['album-wild', 'album-alpine'],
    tags: ['yosemite', 'mist', 'cliffs', 'monochrome-feel', 'forest'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    metadata: {
      cameraMake: 'Hasselblad',
      cameraModel: 'X2D 100C',
      lensModel: 'XCD 55mm f/2.5 V',
      aperture: 'f/5.6',
      shutterSpeed: '1/160s',
      iso: 100,
      focalLength: '55mm',
      exposureBias: '-0.3 EV',
      dateTimeOriginal: '2026-09-12 08:30:19',
      location: {
        latitude: 37.7456,
        longitude: -119.5936,
        altitude: 1210,
        placeName: 'Yosemite National Park, California, USA'
      },
      dimensions: { width: 4400, height: 2933, aspectRatio: 1.5 },
      colorSpace: 'Adobe RGB',
      hasExif: true
    }
  },
  {
    id: 'photo-8',
    title: 'Hong Kong Neon Arcade',
    description: 'Layered retro typography and glowing neon reflections in the bustling streets of Mong Kok.',
    dataUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=500&q=80',
    mimeType: 'image/jpeg',
    fileSize: 4980200,
    favorite: false,
    albumIds: ['album-urban'],
    tags: ['hong-kong', 'neon', 'night', 'asia', 'street'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    metadata: {
      cameraMake: 'Sony',
      cameraModel: 'ILCE-7RM5 (A7R V)',
      lensModel: 'FE 50mm F1.2 GM',
      aperture: 'f/1.2',
      shutterSpeed: '1/500s',
      iso: 800,
      focalLength: '50mm',
      exposureBias: '-1.0 EV',
      dateTimeOriginal: '2026-07-15 22:18:40',
      location: {
        latitude: 22.3193,
        longitude: 114.1694,
        altitude: 18,
        placeName: 'Mong Kok, Kowloon, Hong Kong'
      },
      dimensions: { width: 3800, height: 2533, aspectRatio: 1.5 },
      colorSpace: 'sRGB',
      hasExif: true
    }
  }
];

window.SAMPLE_ALBUMS = SAMPLE_ALBUMS;
window.SAMPLE_PHOTOS = SAMPLE_PHOTOS;
