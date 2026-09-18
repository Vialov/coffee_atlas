import { describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  document: "file:///documents/",
  fail: false,
}));
vi.mock("expo-file-system", () => ({
  Paths: {
    get document() {
      return state.document;
    },
  },
  File: class {
    uri: string;
    constructor(base: string, path: string) {
      if (state.fail) throw new Error("Invalid file");
      this.uri = base + path;
    }
  },
}));
import { resolveCoffeePhoto } from "../src/utils/coffeePhoto";
describe("local photo paths", () => {
  it.each([
    null,
    "",
    "/photo.jpg",
    "../photo.jpg",
    "photos/../photo.jpg",
    "file:///tmp/photo.jpg",
    "https://example.com/photo.jpg",
    "photos/%2e%2e/photo.jpg",
  ])("rejects non-document paths: %s", (path) => {
    expect(resolveCoffeePhoto(path)).toBeNull();
  });
  it("resolves against the current documents directory after relocation", () => {
    expect(resolveCoffeePhoto("photos/lot.jpg")).toBe(
      "file:///documents/photos/lot.jpg",
    );
    state.document = "file:///new-container/documents/";
    expect(resolveCoffeePhoto("photos/lot.jpg")).toBe(
      "file:///new-container/documents/photos/lot.jpg",
    );
  });
  it("falls back if the native file cannot be constructed", () => {
    state.fail = true;
    expect(resolveCoffeePhoto("photos/lot.jpg")).toBeNull();
    state.fail = false;
  });
});
