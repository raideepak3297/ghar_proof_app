const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

/**
 * Returns a working, absolute image stream URL for any photo upload object, string ID, or URL.
 */
export const getPhotoUrl = (photo: any): string => {
  if (!photo) return '';

  if (typeof photo === 'string') {
    if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('blob:') || photo.startsWith('data:')) {
      return photo;
    }
    // Clean string ID if wrapped with any previous relative paths
    const cleanId = photo
      .replace(/^\/?api\/v1\/uploads\/?/, '')
      .replace(/^\/?api\/uploads\/?/, '')
      .replace(/^\/?uploads\/?/, '')
      .replace(/\/view$/, '');

    return `${BASE_URL}/uploads/${cleanId}/view`;
  }

  // If object has photoUrl
  if (photo.photoUrl && typeof photo.photoUrl === 'string') {
    if (photo.photoUrl.startsWith('http://') || photo.photoUrl.startsWith('https://') || photo.photoUrl.startsWith('blob:') || photo.photoUrl.startsWith('data:')) {
      return photo.photoUrl;
    }
    const cleanId = photo.photoUrl
      .replace(/^\/?api\/v1\/uploads\/?/, '')
      .replace(/^\/?api\/uploads\/?/, '')
      .replace(/^\/?uploads\/?/, '')
      .replace(/\/view$/, '');
    return `${BASE_URL}/uploads/${cleanId}/view`;
  }

  const id = photo._id || photo.id;
  if (id) {
    return `${BASE_URL}/uploads/${id}/view`;
  }

  return '';
};

export const getPhotoHash = (photo: any): string => {
  if (!photo || typeof photo !== 'object') return '';
  return photo.sha256Hash || photo.sha256 || '';
};

export const getPhotoName = (photo: any): string => {
  if (!photo || typeof photo !== 'object') return 'Inspection Photo';
  return photo.originalName || photo.fileName || 'Inspection Photo';
};
