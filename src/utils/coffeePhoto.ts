import { File, Paths } from "expo-file-system";

// Stored paths are relative to Documents, never temporary picker or remote URIs.
export function resolveCoffeePhoto(path: string | null): string | null {
  if (
    !path ||
    /[\\:%?#]/.test(path) ||
    path.split("/").some((part) => !part || part === "." || part === "..")
  )
    return null;
  try {
    return new File(Paths.document, path).uri;
  } catch {
    return null;
  }
}
