export type CoffeeLot = {
  id: string;
  name: string;
  roaster: string;
  country: string | null;
  region: string | null;
  process: string | null;
  variety: string | null;
  roastDate: string | null;
  packageDescriptors: string[];
  myImpression: string | null;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
};
