export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates image file type and file size.
 * Allows JPEG, PNG, WEBP up to 5MB.
 */
export function validateImageFile(file: File): FileValidationResult {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'Invalid file format. Please upload a JPG, PNG, or WEBP image.'
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size too large (${sizeInMB}MB). Maximum allowed image size is 5MB.`
    };
  }

  return { isValid: true };
}

/**
 * Validates video file type and size.
 * Allows MP4, WEBM up to 50MB.
 */
export function validateVideoFile(file: File): FileValidationResult {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const maxSizeBytes = 50 * 1024 * 1024; // 50 MB

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'Invalid video format. Please upload an MP4 or WebM video file.'
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Video size too large (${sizeInMB}MB). Maximum allowed video size is 50MB.`
    };
  }

  return { isValid: true };
}

/**
 * Validates and converts YouTube URLs to embed format.
 * Supports standard watch URLs, short URLs, and embed URLs.
 */
export function parseYouTubeUrl(url: string): { isValid: boolean; embedUrl?: string; videoId?: string; error?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  const trimmed = url.trim();

  // Pattern matches:
  // - https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // - https://youtu.be/dQw4w9WgXcQ
  // - https://www.youtube.com/embed/dQw4w9WgXcQ
  // - https://www.youtube.com/shorts/dQw4w9WgXcQ
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];
    return {
      isValid: true,
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`
    };
  }

  return {
    isValid: false,
    error: 'Please enter a valid YouTube video URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)'
  };
}

/**
 * Validates generic HTTP/HTTPS URLs.
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
