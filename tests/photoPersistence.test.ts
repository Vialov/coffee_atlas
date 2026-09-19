import { beforeEach, describe, expect, it, vi } from "vitest";
const files = vi.hoisted(() => ({
  copy: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("expo-file-system", () => ({
  Paths: { document: "file:///documents" },
  Directory: class {
    create = files.create;
  },
  File: class {
    uri: string;
    extension = ".heic";
    exists = true;
    constructor(...parts: string[]) {
      this.uri = parts.join("/");
    }
    copy = files.copy;
    delete = files.remove;
  },
}));
import {
  persistCoffeePhoto,
  removeCoffeePhoto,
} from "../src/utils/coffeePhoto";
beforeEach(() => vi.clearAllMocks());
describe("saved package photos", () => {
  it("copies a picker file into Documents and returns only the relative path", () => {
    expect(persistCoffeePhoto("file:///cache/picker.heic", "uuid")).toBe(
      "coffee-photos/uuid.heic",
    );
    expect(files.create).toHaveBeenCalledWith({
      intermediates: true,
      idempotent: true,
    });
    expect(files.copy).toHaveBeenCalledWith(
      expect.objectContaining({
        uri: "file:///documents/coffee-photos/uuid.heic",
      }),
    );
  });
  it("only removes managed photos", () => {
    removeCoffeePhoto("coffee-photos/uuid.heic");
    expect(files.remove).toHaveBeenCalledTimes(1);
    removeCoffeePhoto("../outside.heic");
    removeCoffeePhoto("other/document.heic");
    removeCoffeePhoto(null);
    expect(files.remove).toHaveBeenCalledTimes(1);
  });
  it("propagates copy failures so the lot is not saved with a missing photo", () => {
    files.copy.mockImplementationOnce(() => {
      throw new Error("Storage full");
    });
    expect(() =>
      persistCoffeePhoto("file:///cache/picker.heic", "uuid"),
    ).toThrow("Storage full");
  });
});
