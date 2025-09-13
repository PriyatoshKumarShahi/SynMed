// Simple offline queue using localStorage. In production use IndexedDB.
const QUEUE_KEY = 'offlineUploadQueue';

export function queueUpload(obj) {
  const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  q.push(obj);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export async function flushQueue(api) {
  const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  if (!q.length) return;
  if (!navigator.onLine) return;
  for (const item of q) {
    try {
      const fd = new FormData();
      fd.append('file', item.file);
      await api.post(item.path, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
    } catch(e) {
      console.warn('upload failed', e);
      // stop and keep queue
      return;
    }
  }
  localStorage.removeItem(QUEUE_KEY);
}
