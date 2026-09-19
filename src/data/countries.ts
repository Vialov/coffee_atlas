// Bundled ISO 3166-1 names; no network or native Intl.DisplayNames needed.
import countryNames from "./countryNames.json";
const codes = Object.keys(countryNames);
const preferred =
  "ET KE RW BI UG TZ CD MW ZM ZW BR CO PE BO EC GT CR PA HN SV NI MX JM DO ID PG IN YE VN PH TH CN".split(
    " ",
  );

const country = (code: string) => ({
  code,
  name: countryNames[code as keyof typeof countryNames],
});
export const coffeeCountries = preferred.map(country);
export const otherCountries = codes
  .filter((code) => !preferred.includes(code))
  .map(country)
  .sort((a, b) => a.name.localeCompare(b.name));
export function filterCountries<T extends { name: string }>(
  countries: T[],
  query: string,
): T[] {
  return countries.filter((country) =>
    country.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
}
