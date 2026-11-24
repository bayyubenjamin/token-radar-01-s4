// Token Radar S4 — pure model functions. No I/O in this file.
// The board value model: a size curve fitted on traded comps, a growth
// term, a maturity term, and board odds. Farmer EV uses odds exactly once,
// inside the implied value — never a second time.

// The 198 board slugs, oracle-defined: the 40-protocol watchlist plus the
// 158 pre-token protocols of the measured board. No clean selection rule
// reproduces this set, so the list is stated here as the row set and every
// value is computed from the snapshot at runtime.
export const BOARD_SLUGS: string[] = ["sentora-curator", "steakhouse-financial", "gauntlet", "veda", "usdd", "upshift", "nonce-capital", "bittensor-dtao", "onre", "rockawayx", "cian-yield-layer", "opentrade", "defi-saver-asset-management", "figure-markets-prime", "mellow-core", "hyperithm", "symbiotic", "r25", "lightning-network", "plume-vaults", "bitfi-basis", "k3-capital", "hive-protocol", "saturn", "galaxy-curation", "clearstar", "theo-network-thusd", "lagoon", "curvance", "polymarket-international", "figure-markets-exchange", "b14g", "shift-defi", "armitage-by-wintermute", "valos", "tydro", "extended-perps", "stellar-defi-hub", "ember", "keyrock", "tori-finance", "avant-avusd", "noble", "doppler-finance", "axis", "gami-labs", "infinifi", "circle-gateway", "loopscale-lending", "arcus-perps", "reti-pooling", "usdcx", "lofty", "ipor-fusion", "azverse-perps", "yuzu-money", "solv-strategies", "nado-spot", "mezo-earn", "current", "tulipa-capital", "project-0", "firelight", "august-digital", "exponent-yield-exchange", "3f", "arrakis-modular", "vishwa", "re7-labs", "nuva", "makina", "noon", "ultrayield-curator", "aegis-yusd", "project-x", "felix-vaults", "plasma-saving-vaults", "plasma-one", "liminal-basis", "drakewell", "decibel", "flux-finance", "y10k-capital", "mystic-finance-lending", "gamma-research", "templar-lending", "hylo-protocol", "theo-network-thbill", "waterline", "apex-omni", "manta-cedefi", "bitlayer-ybtc-family", "vfat.io", "fira", "xrpl-dex", "phoenix-perp", "gmx-solana", "flowdesk", "lulo", "risex", "avant-aveth", "communityv3", "xion-finance", "zoo-finance", "nemo-trading", "bisonfi", "d2-finance", "agua", "origami-finance", "neutral-trade", "adrastea-validator", "defindex", "monolith-market", "3jane-lending", "tempo-stablecoin-dex", "perena-vaults", "katana-pre-launch", "ultrayield-vaults", "felix-cdp", "marginfi-lending", "hyperbeat-earn", "hakutora", "exponent-strategy-vaults", "native-credit-pool", "chain-fusion", "rocksolid-network", "manifest-trade", "t3tris-finance", "9summits", "strata-markets", "paimon", "syntropia", "syntetika", "exponent-risk-tranching", "anemoy-capital", "sygnum-fiusd-liquidity-fund", "rif-on-chain", "estate-protocol", "stellar-dex", "growihf", "goose", "bouncebit-prime", "agni-finance", "tessera-v", "predict-fun", "strato-cdp", "snuggle", "superearn", "sharpbyte-capital", "yieldfi", "qearn", "tau-labs", "kava-mint", "vena-finance", "steer-protocol", "reya-perps", "bima-cdp", "bucket-cdp", "set-protocol", "bend", "valantis-sthype-restaking", "icarus-cl", "byreal", "pangolins", "antarctic", "binaryx-platform", "abstract", "bulk", "stellar-amm", "fluxion-network", "vesu", "defa-by-invoicemate", "subfrost", "mev-capital", "vault-street", "hertzflow", "mezzanine", "block-analitica", "anthias-labs", "turboflow-perps", "aftermath-aflp", "fstswap", "loopscale-curation", "swan-dao", "stablehodl", "boros", "temple", "granite", "flying-tulip-ftusd", "damm-capital", "alphagrowth", "goonfi", "btcfi-cdp", "syncswap", "monarq", "metalx-swap", "nucleus", "katana-dex"];

// Age used when a listing date is unreported. Assumed, not observed.
export const ASSUMED_AGE_DAYS = 513;

export const GAS_USD: Record<string, number> = {
  "Ethereum": 8, "Bitcoin": 5, "Solana": 0.01, "Binance": 0.30, "Base": 0.10,
  "Arbitrum": 0.50, "Optimism": 0.20, "Polygon": 0.05, "zkSync Era": 0.20,
  "Starknet": 0.20, "Avalanche": 0.30, "Sui": 0.02, "Aptos": 0.02,
  "Tron": 0.50, "Hyperliquid L1": 0.50, "Monad": 0.05, "Stellar": 0.01,
  "Ripple": 0.01, "Algorand": 0.01, "Mantle": 0.10, "Linea": 0.10,
  "Scroll": 0.10, "Mode": 0.05, "Fraxtal": 0.05, "Blast": 0.10,
  "Manta": 0.10, "ZetaChain": 0.10, "Kava": 0.10, "Cronos": 0.05,
  "Fantom": 0.05, "Celo": 0.01, "Near": 0.01, "Sei": 0.05,
  "Berachain": 0.05, "Sonic": 0.05, "Story": 0.05, "Unichain": 0.10,
  "World Chain": 0.10, "Plume Mainnet": 0.10, "Plume": 0.10,
  "Katana": 0.05, "Stable": 0.05, "Tempo": 0.10,
};

export interface Protocol {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
}

export interface Fit { a: number; b: number; r2: number }

export interface Row {
  slug: string;
  name: string;
  category: string;
  chain: string;
  tvl_usd: number;
  change_7d: number | null;
  age_days: number;
  age_unreported: boolean;
  change_unreported: boolean;
  size_term: number;
  growth: number;
  maturity: number;
  odds: number;
  implied_value_usd: number;
  farmers: number;
  expected_airdrop_usd: number;
  deposit_usd: number;
  gas_usd: number;
  cost_usd: number;
  ev_cost_ratio: number;
  verdict: string;
  hold_days: number;
  farm_steps: string[];
}

export function ageDays(listedAt: string | null, asOf: Date): number {
  if (!listedAt) return ASSUMED_AGE_DAYS;
  const listed = new Date(listedAt + "T00:00:00Z");
  return Math.floor((asOf.getTime() - listed.getTime()) / 86400000);
}

// Ordinary least squares on ln(mcap) = a + b * ln(TVL) over traded comps.
export function fitCurve(comps: Protocol[]): Fit {
  const xs = comps.map((p) => Math.log(p.tvl_usd));
  const ys = comps.map((p) => Math.log(p.mcap_usd as number));
  const n = xs.length;
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = ys.reduce((s, y) => s + y, 0) / n;
  let sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) * (xs[i] - mx); }
  const b = sxy / sxx;
  const a = my - b * mx;
  let ssr = 0, sst = 0;
  for (let i = 0; i < n; i++) {
    const pred = a + b * xs[i];
    ssr += (ys[i] - pred) * (ys[i] - pred);
    sst += (ys[i] - my) * (ys[i] - my);
  }
  return { a, b, r2: 1 - ssr / sst };
}

// 5-fold held-out test, deterministic folds: index i goes to fold i % 5.
// Returns per-fold log-RMSE for the curve fit and for the flat median
// mcap/TVL baseline, plus the means.
export function heldOutTest(comps: Protocol[]): {
  folds: { fitted: number; flat: number }[];
  fittedMean: number;
  flatMean: number;
  wins: number;
} {
  const xs = comps.map((p) => Math.log(p.tvl_usd));
  const ys = comps.map((p) => Math.log(p.mcap_usd as number));
  const med = median(comps.map((p) => (p.mcap_usd as number) / p.tvl_usd));
  const folds: { fitted: number; flat: number }[] = [];
  for (let f = 0; f < 5; f++) {
    const tr = comps.map((_, i) => i).filter((i) => i % 5 !== f);
    const te = comps.map((_, i) => i).filter((i) => i % 5 === f);
    const mx = tr.reduce((s, i) => s + xs[i], 0) / tr.length;
    const my = tr.reduce((s, i) => s + ys[i], 0) / tr.length;
    let sxy = 0, sxx = 0;
    for (const i of tr) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) * (xs[i] - mx); }
    const b = sxy / sxx;
    const a = my - b * mx;
    let se = 0, sf = 0;
    for (const i of te) {
      const e = ys[i] - (a + b * xs[i]);
      se += e * e;
      const d = ys[i] - Math.log(med * Math.exp(xs[i]));
      sf += d * d;
    }
    folds.push({ fitted: Math.sqrt(se / te.length), flat: Math.sqrt(sf / te.length) });
  }
  const fittedMean = folds.reduce((s, x) => s + x.fitted, 0) / 5;
  const flatMean = folds.reduce((s, x) => s + x.flat, 0) / 5;
  return { folds, fittedMean, flatMean, wins: folds.filter((x) => x.fitted < x.flat).length };
}

function median(values: number[]): number {
  const s = [...values].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function depositFor(tvl: number): number {
  if (tvl < 10_000_000) return 50;
  if (tvl < 100_000_000) return 100;
  if (tvl < 1_000_000_000) return 150;
  return 250;
}

export function gasFor(chain: string): number {
  return GAS_USD[chain] ?? 0.10;
}

export function holdDaysFor(age: number): number {
  if (age < 180) return 30;
  if (age < 730) return 45;
  return 60;
}

export function computeRow(p: Protocol, asOf: Date, fit: Fit): Row {
  const ageUnreported = p.listed_at === null;
  const changeUnreported = p.change_7d === null;
  const age = ageDays(p.listed_at, asOf);
  const chain = p.chains[0] ?? "Ethereum";
  const sizeTerm = Math.exp(fit.a + fit.b * Math.log(p.tvl_usd));
  const chg = p.change_7d ?? 0;
  const growth = 1 + (Math.max(-60, Math.min(120, chg)) / 100) * 0.5;
  const maturity = 0.6 + 0.4 * (Math.min(age, 1095) / 1095);
  const odds = 0.55 * Math.exp(-age / 1500) + 0.08;
  const implied = Math.max(1, Math.round(sizeTerm * growth * maturity * odds));
  const farmers = Math.max(200, p.tvl_usd / 50000);
  const expected = implied * (0.07 / farmers);
  const deposit = depositFor(p.tvl_usd);
  const gas = gasFor(chain);
  const cost = deposit + gas;
  const ratio = expected / cost;
  const verdict = ageUnreported || changeUnreported
    ? "SKIP"
    : ratio >= 3 ? "FARM" : ratio >= 1 ? "THIN" : "SKIP";
  const hold = holdDaysFor(age);
  const row: Row = {
    slug: p.slug,
    name: p.name,
    category: p.category ?? "DeFi",
    chain,
    tvl_usd: p.tvl_usd,
    change_7d: p.change_7d,
    age_days: age,
    age_unreported: ageUnreported,
    change_unreported: changeUnreported,
    size_term: sizeTerm,
    growth,
    maturity,
    odds,
    implied_value_usd: implied,
    farmers,
    expected_airdrop_usd: expected,
    deposit_usd: deposit,
    gas_usd: gas,
    cost_usd: cost,
    ev_cost_ratio: ratio,
    verdict,
    hold_days: hold,
    farm_steps: [],
  };
  row.farm_steps = farmPlan(row);
  return row;
}

function weeklyAction(category: string, name: string): string {
  const c = category.toLowerCase();
  if (c.includes("lend")) return `Each week, supply or borrow on ${name} at least once so the activity counts toward any future distribution.`;
  if (c.includes("dex") || c.includes("exchange")) return `Each week, swap or add liquidity on ${name} at least once so the activity counts toward any future distribution.`;
  if (c.includes("yield")) return `Each week, harvest or restake rewards on ${name} at least once so the activity counts toward any future distribution.`;
  if (c.includes("cdp") || c.includes("stable")) return `Each week, mint or adjust a position on ${name} at least once so the activity counts toward any future distribution.`;
  if (c.includes("deriv") || c.includes("perp")) return `Each week, open or close a trade on ${name} at least once so the activity counts toward any future distribution.`;
  if (c.includes("restak") || c.includes("staking")) return `Each week, check and top up the stake on ${name} at least once so the activity counts toward any future distribution.`;
  if (c.includes("bridge")) return `Each week, bridge a small amount through ${name} at least once so the activity counts toward any future distribution.`;
  if (c.includes("prediction")) return `Each week, place a small prediction on ${name} at least once so the activity counts toward any future distribution.`;
  if (c.includes("rwa") || c.includes("real world")) return `Each week, review and interact with a vault on ${name} at least once so the activity counts toward any future distribution.`;
  if (c.includes("farm")) return `Each week, claim or compound farm rewards on ${name} at least once so the activity counts toward any future distribution.`;
  if (c.includes("option")) return `Each week, open or settle an option on ${name} at least once so the activity counts toward any future distribution.`;
  if (c.includes("liquid")) return `Each week, deposit or withdraw liquidity on ${name} at least once so the activity counts toward any future distribution.`;
  if (c.includes("vault") || c.includes("curator") || c.includes("curation")) return `Each week, review the vault allocation on ${name} at least once so the activity counts toward any future distribution.`;
  return `Each week, use the main feature of ${name} at least once so the activity counts toward any future distribution.`;
}

export function farmPlan(row: Row): string[] {
  const gas = fmtMoney(row.gas_usd);
  const cost = fmtMoney(row.cost_usd);
  return [
    `Move $${row.deposit_usd} in USDC to a wallet on ${row.chain} for ${row.name}; the network gas for the move is about $${gas}.`,
    `Deposit $${row.deposit_usd} into ${row.name} (${row.category}) on ${row.chain} and check that the position shows in the app.`,
    `Hold the position for ${row.hold_days} days; check it weekly, and add funds only if the pool TVL drops sharply.`,
    weeklyAction(row.category, row.name),
    `If ${row.name} records a token, claim inside the first claim window; unstake only after the snapshot, not before.`,
    `Exit by withdrawing the deposit plus any rewards; gas is about $${gas}, so the all-in plan cost is about $${cost} plus ${row.hold_days} days of time.`,
  ];
}

export function fmtMoney(n: number): string {
  if (n >= 100) return String(Math.round(n));
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

// Weibull 60-day launch chance at a given age (shape 0.50, scale 882 days).
export function weibull60(age: number): number {
  const k = 0.5, lam = 882;
  return 1 - Math.exp(-Math.pow((age + 60) / lam, k) + Math.pow(age / lam, k));
}
