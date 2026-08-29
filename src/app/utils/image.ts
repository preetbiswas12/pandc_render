export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '/placeholder.png';
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return \https://drive.google.com/uc?export=view&id=\\;
  }
  if (url.includes('drive.google.com/open?id=')) {
    const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match) return \https://drive.google.com/uc?export=view&id=\\;
  }
  return url;
}
export function getProductImage(images: string[] | string | undefined | null): string {
  if (Array.isArray(images) && images.length > 0) return getImageUrl(images[0]);
  if (typeof images === 'string') return getImageUrl(images);
  return '/placeholder.png';
}
