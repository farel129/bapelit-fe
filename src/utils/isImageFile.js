// utils/isImageFile.js
export default function isImageFile(file) {
  if (!file) return false;
  const urlPath = new URL(file.url).pathname.toLowerCase();
  const urlExt = urlPath.split('.').pop();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(urlExt)) return true;
  
  const mimeToExt = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
    'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp', 'image/svg+xml': 'svg',
  };
  if (file.type && mimeToExt[file.type.toLowerCase()]) return true;

  if (file.filename) {
    const ext = file.filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return true;
  }
  return false;
}