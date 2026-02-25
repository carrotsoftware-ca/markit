/**
 * Firebase Storage REST API requires slashes in the object path to be encoded
 * as %2F. e.g. /o/projects/abc/file.png → /o/projects%2Fabc%2Ffile.png
 *
 * This is a no-op if the URL doesn't contain /o/ or if the path has no slashes
 * to encode (i.e. it's already encoded or not a Storage URL).
 */
export function encodeStoragePath(url: string): string {
  const oIndex = url.indexOf("/o/");
  if (oIndex === -1) return url;

  const beforePath = url.slice(0, oIndex + 3); // everything up to and including "/o/"
  const rest = url.slice(oIndex + 3); // "projects/id/file.png?alt=media&token=..."

  const qIndex = rest.indexOf("?");
  const rawPath = qIndex !== -1 ? rest.slice(0, qIndex) : rest;
  const query = qIndex !== -1 ? rest.slice(qIndex) : "";

  // If there are no unencoded slashes in the path, nothing to do
  if (!rawPath.includes("/")) return url;

  return beforePath + rawPath.replace(/\//g, "%2F") + query;
}
