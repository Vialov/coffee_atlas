import { Directory, File, Paths } from "expo-file-system";

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

// Copy only on save, keeping picker cache URIs out of SQLite.
export function persistCoffeePhoto(uri: string, filename: string): string {
  const directory = new Directory(Paths.document, "coffee-photos");
  directory.create({ intermediates: true, idempotent: true });
  const source = new File(uri);
  const extension = source.extension.match(/^\.[a-zA-Z0-9]+$/)?.[0] ?? ".jpg";
  const relative = `coffee-photos/${filename}${extension}`;
  source.copy(new File(Paths.document, relative));
  return relative;
}
export function removeCoffeePhoto(path: string | null) {
  const uri = resolveCoffeePhoto(path);
  if (!uri || !path?.startsWith("coffee-photos/")) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (error) {
    console.warn("Could not remove unused coffee photo", error);
  }
}
