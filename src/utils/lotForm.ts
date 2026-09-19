import type { CoffeeLot } from "../types/coffee";

export type LotDraft = Omit<CoffeeLot, "id" | "createdAt" | "updatedAt">;
export const emptyLot: LotDraft = {
  name: "",
  roaster: "",
  country: null,
  region: null,
  process: null,
  variety: null,
  roastDate: null,
  packageDescriptors: [],
  myImpression: null,
  rating: null,
  photoPath: null,
};
export function addFlavorNote(notes: string[], input: string): string[] {
  const value = input.trim();
  return !value ||
    notes.some((note) => note.toLowerCase() === value.toLowerCase())
    ? notes
    : [...notes, value];
}
export function normalizeLot(draft: LotDraft): LotDraft {
  if (!draft.name.trim()) throw new Error("Please enter a lot name.");
  const optional = (value: string | null) => value?.trim() || null;
  return {
    ...draft,
    name: draft.name.trim(),
    roaster: draft.roaster.trim(),
    country: optional(draft.country),
    region: optional(draft.region),
    process: optional(draft.process),
    variety: optional(draft.variety),
    myImpression: optional(draft.myImpression),
    packageDescriptors: draft.packageDescriptors.reduce(
      addFlavorNote,
      [] as string[],
    ),
    rating:
      draft.rating === null
        ? null
        : Math.max(10, Math.min(50, Math.round(draft.rating * 10))) / 10,
  };
}
export function draftFromLot(lot: CoffeeLot): LotDraft {
  const { id: _id, createdAt: _created, updatedAt: _updated, ...draft } = lot;
  return draft;
}
export function formatRoastDate(value: string) {
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
}
