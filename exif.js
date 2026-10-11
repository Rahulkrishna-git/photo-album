// exif.js - Comprehensive client-side EXIF, IPTC & GPS metadata parser and privacy sanitizer

class ExifProcessor {
  /**
   * Main entry point to extract all metadata from a File object
   * Uses exifr library if available, and gracefully falls back to native binary parser.
   */
  static async extractMetadata(file) {
    let result = {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      lastModified: file.lastModified,
      dimensions: { width: 0, height: 0, aspectRatio: 1 },
      cameraMake: 'Unknown Camera',
      cameraModel: 'Unknown Model',
      lensModel: 'Standard Lens',
      aperture: null,
      shutterSpeed: null,
      iso: null,
      focalLength: null,
      exposureBias: null,
      dateTimeOriginal: null,
      location: null,
      orientation: 1,
      colorSpace: 'sRGB',
      hasExif: false
    };

    // 1. Get image dimensions via Image element or ImageBitmap
    try {
      const dimensions = await this.getImageDimensions(file);
      result.dimensions = dimensions;
    } catch (e) {
      console.warn('Could not read image dimensions:', e);
    }

    // 2. Try exifr library if available in window
    if (window.exifr) {
      try {
        const exifData = await window.exifr.parse(file, {
          tiff: true,
          xmp: true,
          icc: true,
          iptc: true,
          jfif: true,
          gps: true,
          translateKeys: true,
          translateValues: true,
          reviveValues: true
        });

        if (exifData) {
          result.hasExif = true;
          if (exifData.Make) result.cameraMake = String(exifData.Make).trim();
          if (exifData.Model) result.cameraModel = String(exifData.Model).trim();
          if (exifData.LensModel) result.lensModel = String(exifData.LensModel).trim();
          if (exifData.FNumber) result.aperture = this.formatAperture(exifData.FNumber);
          if (exifData.ExposureTime) result.shutterSpeed = this.formatShutter(exifData.ExposureTime);
          if (exifData.ISO || exifData.ISOSpeedRatings) result.iso = exifData.ISO || exifData.ISOSpeedRatings;
          if (exifData.FocalLength) result.focalLength = this.formatFocalLength(exifData.FocalLength);
          if (exifData.ExposureCompensation !== undefined) {
            result.exposureBias = `${exifData.ExposureCompensation > 0 ? '+' : ''}${exifData.ExposureCompensation} EV`;
          }
          if (exifData.DateTimeOriginal) {
            result.dateTimeOriginal = this.formatDateTime(exifData.DateTimeOriginal);
          } else if (exifData.CreateDate) {
            result.dateTimeOriginal = this.formatDateTime(exifData.CreateDate);
          }
          if (exifData.latitude && exifData.longitude) {
            result.location = {
              latitude: Number(exifData.latitude.toFixed(6)),
              longitude: Number(exifData.longitude.toFixed(6)),
              altitude: exifData.altitude ? Math.round(exifData.altitude) : undefined
            };
          }
          if (exifData.Orientation) result.orientation = exifData.Orientation;
          if (exifData.ColorSpace) result.colorSpace = exifData.ColorSpace === 1 ? 'sRGB' : 'Adobe RGB';

          return result;
        }
      } catch (err) {
        console.warn('exifr parse error, using native parser:', err);
      }
    }

    // 3. Fallback: Native binary ArrayBuffer EXIF parser
    try {
      const buffer = await file.arrayBuffer();
      const nativeExif = this.parseNativeJpegExif(buffer);
      if (nativeExif && Object.keys(nativeExif).length > 0) {
        result.hasExif = true;
        Object.assign(result, nativeExif);
      }
    } catch (e) {
      console.warn('Native EXIF parse error:', e);
    }

    // Default fallback date if none extracted
    if (!result.dateTimeOriginal) {
      result.dateTimeOriginal = new Date(file.lastModified).toISOString().split('T')[0];
    }

    return result;
  }

  static async getImageDimensions(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / (img.naturalHeight || 1)
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0, aspectRatio: 1 });
      };
      img.src = url;
    });
  }

  /**
   * Pure native binary parser for JPEG EXIF & GPS
   */
  static parseNativeJpegExif(buffer) {
    const view = new DataView(buffer);
    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xFFD8) {
      return null; // Not a valid JPEG
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset < length - 2) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      if (marker === 0xFFE1) { // APP1 Marker (EXIF)
        const segmentLength = view.getUint16(offset, false);
        const exifHeader = view.getUint32(offset + 2, false);
        if (exifHeader === 0x45786966) { // "Exif"
          return this.parseTiff(view, offset + 8);
        }
        offset += segmentLength;
      } else if ((marker & 0xFF00) === 0xFF00) {
        if (marker === 0xFFDA || marker === 0xFFD9) break; // Start of Scan or EOI
        const segmentLength = view.getUint16(offset, false);
        offset += segmentLength;
      } else {
        break;
      }
    }
    return null;
  }

  static parseTiff(view, tiffStart) {
    const byteOrder = view.getUint16(tiffStart, false);
    const littleEndian = byteOrder === 0x4949; // 'II' = Intel / little-endian, 'MM' = Motorola / big-endian

    if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002A) {
      return null; // Invalid TIFF header
    }

    const firstIFDOffset = view.getUint32(tiffStart + 4, littleEndian);
    const result = {};

    let exifIFDOffset = null;
    let gpsIFDOffset = null;

    // Read IFD0
    const ifd0 = this.readIFD(view, tiffStart, tiffStart + firstIFDOffset, littleEndian);
    if (ifd0[0x010F]) result.cameraMake = ifd0[0x010F]; // Make
    if (ifd0[0x0110]) result.cameraModel = ifd0[0x0110]; // Model
    if (ifd0[0x0112]) result.orientation = ifd0[0x0112];
    if (ifd0[0x8769]) exifIFDOffset = ifd0[0x8769]; // Exif IFD Pointer
    if (ifd0[0x8825]) gpsIFDOffset = ifd0[0x8825]; // GPS IFD Pointer

    // Read Exif IFD
    if (exifIFDOffset) {
      const exifIFD = this.readIFD(view, tiffStart, tiffStart + exifIFDOffset, littleEndian);
      if (exifIFD[0x829A]) result.shutterSpeed = this.formatShutter(exifIFD[0x829A]);
      if (exifIFD[0x829D]) result.aperture = this.formatAperture(exifIFD[0x829D]);
      if (exifIFD[0x8827]) result.iso = exifIFD[0x8827];
      if (exifIFD[0x920A]) result.focalLength = this.formatFocalLength(exifIFD[0x920A]);
      if (exifIFD[0x9003]) result.dateTimeOriginal = String(exifIFD[0x9003]).replace(/:/g, '-');
      if (exifIFD[0xA434]) result.lensModel = exifIFD[0xA434];
    }

    // Read GPS IFD
    if (gpsIFDOffset) {
      const gpsIFD = this.readIFD(view, tiffStart, tiffStart + gpsIFDOffset, littleEndian);
      if (gpsIFD[0x0002] && gpsIFD[0x0004]) { // Lat and Long
        const lat = this.convertGpsDMS(gpsIFD[0x0002], gpsIFD[0x0001] || 'N');
        const lng = this.convertGpsDMS(gpsIFD[0x0004], gpsIFD[0x0003] || 'E');
        if (lat !== null && lng !== null) {
          result.location = {
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
            altitude: gpsIFD[0x0006] ? Math.round(gpsIFD[0x0006]) : undefined
          };
        }
      }
    }

    return result;
  }

  static readIFD(view, tiffStart, dirStart, littleEndian) {
    const entries = {};
    if (dirStart + 2 > view.byteLength) return entries;
    const numEntries = view.getUint16(dirStart, littleEndian);

    for (let i = 0; i < numEntries; i++) {
      const entryOffset = dirStart + 2 + (i * 12);
      if (entryOffset + 12 > view.byteLength) break;

      const tag = view.getUint16(entryOffset, littleEndian);
      const type = view.getUint16(entryOffset + 2, littleEndian);
      const count = view.getUint32(entryOffset + 4, littleEndian);
      const valueOffset = entryOffset + 8;

      let val = null;
      if (type === 2) { // ASCII String
        const offset = count > 4 ? tiffStart + view.getUint32(valueOffset, littleEndian) : valueOffset;
        val = this.readAscii(view, offset, count);
      } else if (type === 3) { // SHORT
        val = view.getUint16(valueOffset, littleEndian);
      } else if (type === 4) { // LONG
        val = view.getUint32(valueOffset, littleEndian);
      } else if (type === 5) { // RATIONAL
        const offset = tiffStart + view.getUint32(valueOffset, littleEndian);
        val = this.readRational(view, offset, littleEndian, count);
      }
      entries[tag] = val;
    }
    return entries;
  }

  static readAscii(view, offset, count) {
    let str = '';
    for (let i = 0; i < count - 1; i++) {
      if (offset + i >= view.byteLength) break;
      const charCode = view.getUint8(offset + i);
      if (charCode === 0) break;
      str += String.fromCharCode(charCode);
    }
    return str.trim();
  }

  static readRational(view, offset, littleEndian, count) {
    if (offset + 8 > view.byteLength) return 0;
    if (count > 1) {
      const rationals = [];
      for (let i = 0; i < count; i++) {
        const num = view.getUint32(offset + (i * 8), littleEndian);
        const den = view.getUint32(offset + (i * 8) + 4, littleEndian);
        rationals.push(den === 0 ? 0 : num / den);
      }
      return rationals;
    }
    const num = view.getUint32(offset, littleEndian);
    const den = view.getUint32(offset + 4, littleEndian);
    return den === 0 ? 0 : num / den;
  }

  static convertGpsDMS(dms, ref) {
    if (!Array.isArray(dms) || dms.length < 3) return null;
    let deg = dms[0] + (dms[1] / 60) + (dms[2] / 3600);
    if (ref === 'S' || ref === 'W') deg = -deg;
    return deg;
  }

  // Formatters
  static formatShutter(val) {
    if (!val) return null;
    if (typeof val === 'string' && val.includes('/')) return val;
    const num = Number(val);
    if (num <= 0) return null;
    if (num < 1) {
      return `1/${Math.round(1 / num)}s`;
    }
    return `${Number(num.toFixed(1))}s`;
  }

  static formatAperture(val) {
    if (!val) return null;
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return `f/${num.toFixed(1).replace(/\.0$/, '')}`;
  }

  static formatFocalLength(val) {
    if (!val) return null;
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return `${Math.round(num)}mm`;
  }

  static formatDateTime(val) {
    if (!val) return null;
    if (val instanceof Date) return val.toISOString().split('T')[0];
    const str = String(val).trim();
    // handles "YYYY:MM:DD HH:MM:SS"
    const match = str.match(/^(\d{4})[:\-](\d{2})[:\-](\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return str;
  }

  static formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  /**
   * Privacy feature: Strip EXIF and GPS from an image blob / file before sharing or exporting
   */
  static async stripExifForPrivacy(imageSrc) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Canvas export failed'));
          resolve(blob);
        }, 'image/jpeg', 0.92);
      };
      img.onerror = (e) => reject(e);
      img.src = imageSrc;
    });
  }
}

window.ExifProcessor = ExifProcessor;
