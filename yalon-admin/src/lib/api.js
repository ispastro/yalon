// Thin wrapper for operations that must go through the Express backend rather
// than straight to Supabase: signed document URLs require the service_role key
// and therefore can't be generated client-side.
//
// VITE_API_BASE_URL should be the bare server origin, e.g.:
//   https://yalon.onrender.com
// (no trailing slash, no /api suffix — the admin route lives at /admin/…)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '');

export async function getSignedDocumentUrl(documentId, accessToken) {
  const res = await fetch(`${API_BASE_URL}/admin/documents/${documentId}/signed-url`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    let message = 'Failed to load document link.';
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore parse errors, use default message
    }
    throw new Error(message);
  }
  const data = await res.json();
  return data.signedUrl;
}
