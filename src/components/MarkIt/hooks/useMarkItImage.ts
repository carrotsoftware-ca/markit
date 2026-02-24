import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { encodeStoragePath } from "../utils/encodeStoragePath";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1630699144919-681cf308ae82?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

/**
 * Resolves an image URL to something Skia's useImage can consume.
 *
 * - Web:    useImage can fetch HTTP URLs directly, so we just return the
 *           encoded URL as-is.
 * - Native: useImage only works with local file URIs, so we download the
 *           remote image to the device cache first.
 *
 * Returns null while the download is in progress (use to show a spinner).
 */
export function useMarkItImage(imageUrl?: string): string | null {
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    const src = imageUrl ?? DEFAULT_IMAGE;

    if (Platform.OS === "web") {
      // useImage on web fetches HTTP directly — just ensure the path is encoded
      setLocalUri(encodeStoragePath(src));
      return;
    }

    // Local file (e.g. picked from device) — use as-is
    if (!src.startsWith("http")) {
      setLocalUri(src);
      return;
    }

    // Remote URL on native — download to cache
    let cancelled = false;
    setLocalUri(null);

    const dest = `${FileSystem.cacheDirectory}markit_${Date.now()}.png`;
    const downloadUrl = encodeStoragePath(src);

    FileSystem.downloadAsync(downloadUrl, dest)
      .then(({ uri, status }) => {
        if (cancelled) return;
        if (status >= 200 && status < 300) {
          setLocalUri(uri);
        } else {
          console.warn("[MarkIt] download failed with status:", status);
        }
      })
      .catch((e) => {
        if (!cancelled) console.warn("[MarkIt] download error:", e);
      });

    // If the component unmounts before the download completes, don't call
    // setLocalUri on the dead component
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return localUri;
}
