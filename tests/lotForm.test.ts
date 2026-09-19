import { describe, expect, it } from "vitest";
import { addFlavorNote, emptyLot, normalizeLot } from "../src/utils/lotForm";
import {
  coffeeCountries,
  otherCountries,
  filterCountries,
} from "../src/data/countries";
describe("lot form values", () => {
  it("trims descriptors, ignores blank and duplicate values, and preserves individual notes", () => {
    expect(addFlavorNote(["peach"], " PEACH ")).toEqual(["peach"]);
    expect(addFlavorNote([], "  ")).toEqual([]);
    expect(addFlavorNote(["peach"], " jasmine ")).toEqual(["peach", "jasmine"]);
  });
  it("keeps optional fields empty and normalizes decimal ratings", () => {
    expect(normalizeLot({ ...emptyLot, name: "Lot" }).rating).toBeNull();
    expect(
      normalizeLot({ ...emptyLot, name: "Lot", rating: 4.39999 }).rating,
    ).toBe(4.4);
    expect(normalizeLot({ ...emptyLot, name: "Lot", rating: 9 }).rating).toBe(
      5,
    );
    expect(normalizeLot({ ...emptyLot, name: "Lot", rating: 0 }).rating).toBe(
      1,
    );
  });
  it("includes all 249 ISO countries and territories with preferred origins first", () => {
    const all = [...coffeeCountries, ...otherCountries];
    expect(all).toHaveLength(249);
    expect(new Set(all.map((country) => country.code)).size).toBe(249);
    expect(filterCountries(all, "ETH")[0]?.name).toBe("Ethiopia");
    expect(
      filterCountries(all, "gua").some(
        (country) => country.name === "Guatemala",
      ),
    ).toBe(true);
    expect(filterCountries(all, "thiop")[0]?.name).toBe("Ethiopia");
    expect(coffeeCountries).toHaveLength(32);
  });
});
