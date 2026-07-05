type PackPricing = {
  amount: number;
  display: string;
  perStoryDisplay: string;
  stories: number;
};

function moneyFromCents(cents: number, currency: string): string {
  const sym = currency === "gbp" ? "£" : "$";
  const value = cents / 100;
  if (Number.isInteger(value)) return `${sym}${value}`;
  return `${sym}${value.toFixed(2)}`;
}

export type PackSavingsCopy = {
  collectionSaveVsSingles: string;
  collectionSinglesTotal: string;
  collectionSaveVsFivePacks: string | null;
  collectionPerStoryVsSingle: string;
  bundleSaveVsSingles: string;
  bundleSinglesTotal: string;
};

/** Psychology-oriented savings lines for the reveal paywall (pack_20 hero, pack_5 fallback). */
export function buildPackSavingsCopy(
  pack1: PackPricing,
  pack5: PackPricing,
  pack20: PackPricing,
  currency: string,
): PackSavingsCopy {
  const singlesFor20 = pack1.amount * 20;
  const save20VsSingles = singlesFor20 - pack20.amount;
  const fivePacksFor20 = pack5.amount * 4;
  const save20VsFivePacks = fivePacksFor20 - pack20.amount;

  const singlesFor5 = pack1.amount * 5;
  const save5VsSingles = singlesFor5 - pack5.amount;

  return {
    collectionSaveVsSingles: moneyFromCents(save20VsSingles, currency),
    collectionSinglesTotal: moneyFromCents(singlesFor20, currency),
    collectionSaveVsFivePacks:
      save20VsFivePacks > 0 ? moneyFromCents(save20VsFivePacks, currency) : null,
    collectionPerStoryVsSingle: `${pack20.perStoryDisplay} each vs ${pack1.perStoryDisplay} for one`,
    bundleSaveVsSingles: moneyFromCents(save5VsSingles, currency),
    bundleSinglesTotal: moneyFromCents(singlesFor5, currency),
  };
}
