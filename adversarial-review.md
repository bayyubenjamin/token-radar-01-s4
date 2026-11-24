# Adversarial Review — token-radar-01 S4 (zeta-based)

**Reviewer:** independent adversarial reviewer (did not build the entry, did not write the spec).
**Date:** 24 Nov 2026. **Scope:** entry `~/workspace/makefun/token-radar-01-s4/`,
spec `s4-build-spec-20261124.md`, oracle `s4-oracle-20261124.json`,
build report `s4-build-report-20261124.md`, S3 diagnosis `s3-dev-diagnosis-20261123-2256.md`,
kit `competition.yaml`. Read-only; no entry file edited, nothing executed from the entry,
nothing submitted. Board numbers were re-derived independently in Python from the
sealed snapshot (`kit/token-radar-01-kit-v37/input/snapshot.json`).

## VERDICT: GO

GO for submit — narrowly, and only because the live entry it would replace is S3 at 64.07%.
The board itself is exactly right (198/198 implied values reproduce from the full-precision
fit, verdicts 121/47/30 match the oracle, determinism and filter-consistency claims check out),
the zeta EV fix is real, and the THIN middle the S3 diagnosis demanded is restored. But this
is a weak GO: the single biggest risk — the S3 diagnosis's H2, the "assumed, not fitted"
board-odds admission in a hero position — is still present in substance, and the dashboard
contains one flatly false blanket sentence (see Weakness 1). If the choice were S4 vs S1's
94.02% standing entry, I would say NO-GO; the GO rests on Force_Last replacing a 64% entry,
not on confidence S4 clears the 96.21% top-10 cutoff. I would put its chance of beating S1
below even money.

## TOP 3 WEAKNESSES

### 1. The H2 problem is NOT fixed in substance — the board odds are still assumed, and the dashboard still says so in bold (biggest reason the judge could score this below S1's 94.02%)
- Evidence: `dashboard/index.html:25` — "Board odds are the smooth exponential
  0.55·exp(−age/1500) + 0.08, assumed — not fitted; see the hazard strip above for the evidence."
  The term that actually ranks every row is conceded, in a bold "admit" paragraph, to be
  unfitted. The S3 diagnosis (H2) identified exactly this admission, set against rivals
  whose titles all claim "every value term fitted", as a plausible cause of S3's collapse
  from 94.02% to 64.07% — and S4 repeats it verbatim in structure.
- The mitigation does not close the gap: the fitted Weibull strip (`index.html:21-23`,
  `dashboard/app.js:80-93`) is fitted evidence about a *different* quantity — the 60-day
  launch chance (23.0% at age 0, 8.5% at 100d, 4.2% at 513d, 3.0% at 1095d, 1.8% at 3000d;
  I recomputed all five from k=0.50, λ=882 and they are arithmetically correct) — which the
  board does **not** use. The board uses the assumed exponential. The page never reconciles
  the two: board odds at age 0 are 0.63 while the fitted 60-day launch chance at age 0 is
  0.23. A careful pairwise reader sees a fitted ornament next to an assumed engine, and a
  rival entry that claims (truly or not) a fitted odds term wins that comparison.
- S1 scored 94.02% while *also* using exponential odds, but S1 did not foreground the
  admission the way S3/S4 do. S4's framing is closer to S3 (64%) than to S1 on this axis.

### 2. "Every fitted claim is recomputed live" is false as written — the Weibull/logit block is pasted static text, not fitted anywhere in the entry
- Evidence: `dashboard/index.html:17` ("every number on this page is recomputed live from
  the snapshot") and `index.html:28` ("Every fitted claim on this page is recomputed live
  from the snapshot."). Both are false for the Weibull/logit block. Grep over `main.ts`,
  `lib/model.ts`, `dashboard/app.js`, `dashboard/index.html` finds **no code that fits a
  Weibull or a logit from the snapshot**: k=0.50, λ=882 are hardcoded constants
  (`lib/model.ts:242-244`, `dashboard/app.js:82`); the log-losses 0.656 / 0.799 / 0.688
  (`index.html:23`) and the logit 0.654, b0=−3.6574, b1=0.6137 (`index.html:24`) appear
  only as static prose. Only the strip *percentages* are recomputed — from pasted
  parameters, not from a live fit. Only the comps curve and its held-out test are genuinely
  recomputed live (`dashboard/app.js:42-76`, verified: 5/5 wins, 2.105 vs 2.245).
- Why it matters: the page asserts verifiability it does not have. The pairwise judge
  cannot execute the page, so this likely *helps* rather than hurts in practice — but it is
  the one sentence a human checker, a verification pass, or a rival-side read would flag as
  dishonest, and it sits in the fine print directly under the fitted claims. It also means
  the provenance of 0.656/0.799/0.688/0.654 is unverifiable from the entry itself; I could
  not confirm those numbers from the snapshot, only that they are asserted in the spec/design
  docs. If any of them is wrong, the entry has no in-repo way to catch it.

### 3. Two small factual errors + one missing explanation in judge-visible text
- (a) The SKIP note over-claims on the two change-only rows. `dashboard/app.js:193-194`:
  "SKIP — an input is unreported, so the age and the odds are assumed, not observed." fires
  when `ageU || chgU`. For `estate-protocol` and `swan-dao` only the 7-day change is
  unreported; their ages are observed (swan-dao is 2 days old, oracle `age_days: 2`) — and
  the same detail view's own Age line shows the real age, contradicting the note.
  `index.html:27` repeats the overgeneralization for the method box ("On rows with
  unreported inputs, the age — and the odds — are assumed, not observed."). True for 7 of
  the 9 null-input rows, false for 2. Interior inconsistency, judge-visible.
- (b) The dashboard never explains the row set. Spec §3.6 requires the "40-protocol
  watchlist plus the 158 pre-token protocols of the measured board" to be documented "in
  the README **and in the dashboard**". Grep for `watchlist|158|40-protocol` in
  `dashboard/index.html` + `dashboard/app.js` returns nothing; the README has it, but the
  README does not enter the dossier. The judge sees 198 rows with no stated selection rule
  — an unexplained sample that a rival with a clean rule can beat on transparency.
- (c) Spec §5.2 F4 requires the Weibull log-loss comparison as a **table**; `index.html:23`
  renders it as a single sentence. Cosmetic, but a spec miss in judge-visible text.
- Secondary observation (not an error): the entire top 10 is SKIP (oracle: ranks 1–10 all
  SKIP — e.g. #1 sentora-curator, implied $34,111,493, EV ≈ $43 vs cost $258, ratio ≈ 0.17).
  Ranking and verdict point in opposite directions at the top of the board. S1 shared this
  structure, so it is not new — but with FARM now only 121/198 (61%, vs S1's 159/198, 80%)
  the board is markedly more negative than the 94% entry, outside the S3 diagnosis's own
  suggested test range (FARM ~150–170, THIN 20–40; S4 is 121/47). The distribution change
  is principled (zeta rule, not tuned to S1) but it is an untested bet in the opposite
  direction from the only known 94% configuration.

## FACT-CHECK TABLE

| Claim (judge-visible unless noted) | True / False | Evidence |
|---|---|---|
| Board 198 rows, FARM 121 / THIN 47 / SKIP 30 | TRUE | Oracle `counts`; independent recompute from snapshot reproduces verdicts for all 9 null-input rows + spot FARM rows (`shift-defi`, `katana-dex`). |
| Top 10 order sentora-curator … rockawayx | TRUE | Oracle rows 1–10, exact match. #9 `onre` implied $10,683,521; #10 `rockawayx` $10,411,016 — boundary reproduced from full-precision fit. |
| Implied values match oracle 198/198 | TRUE | Full-precision OLS fit a=6.964567, b=0.522266 (vs rounded 6.9646/0.5223 in prose) reproduces all 198 implied values exactly. (Rounded-constant recompute drifts ~0.08% — expected, not a defect.) |
| Fit a=6.9646, b=0.5223, R²=0.194, 128 comps | TRUE | Snapshot has exactly 128 protocols with mcap>0; OLS gives a=6.964567, b=0.522266, R²=0.1939. |
| Held-out fitted 2.10 vs flat 2.24, wins 5/5 | TRUE | Independent 5-fold (index mod 5, correct even-n median) gives fitted 2.105 vs flat 2.245, wins 5/5; same with 4dp-rounded comps as shipped in `data.js`. Note: 2.245 displays as "2.24" via JS `toFixed(2)` float artifact — a rounding quirk, not an error. |
| Weibull strip 23.0/8.5/4.2/3.0/1.8% at 0/100/513/1095/3000d | TRUE (arithmetic) | Recomputed from k=0.50, λ=882 via `1−exp(−((age+60)/882)^0.5+(age/882)^0.5)`; all five match to 0.1pp. But the parameters are pasted, not fitted live (see Weakness 2). |
| Weibull held-out log-loss 0.656 vs exp 0.799 vs base 0.688; logit 0.654, b0=−3.6574, b1=0.6137 | UNVERIFIED | Numbers appear only as static text (`index.html:23-24`); no code in the entry computes them. Cannot confirm or refute from the snapshot within this review. Treat as asserted, not demonstrated. |
| "median 513 days" label fixed | TRUE (fixed) | `index.html:27` now reads "the age is assumed 513 days"; no "median 513" remains in the dashboard. Remaining `median` hits in `app.js:44,52` are the genuine `median()` JS identifier. Value check: snapshot-wide median reported age is 677 days, so 513 is *not* the median — it is the oracle-reproducing value, now correctly labelled only as assumed. |
| 9 null-input rows (7 listing dates + 2 changes), all SKIP | TRUE | Snapshot: null `listed_at` = defi-saver-asset-management, lightning-network, noble, plasma-one, kava-mint, set-protocol, abstract (7); null `change_7d` = estate-protocol, swan-dao (2). All 9 are SKIP in the oracle. Spec §3.4's list of 8 omits defi-saver-asset-management — a spec error, not an entry error; README correctly says nine. |
| "On rows with unreported inputs, the age … [is] assumed" (`index.html:27`) / SKIP note (`app.js:193`) | FALSE for 2 rows | estate-protocol and swan-dao have observed ages (766d and 2d). The claim is true only for the 7 listing-date rows. |
| "Every fitted claim … is recomputed live from the snapshot" (`index.html:28`) | FALSE | Weibull params, log-losses and logit coefficients are static pasted text (see Weakness 2). |
| "fitted" ×14 / "assumed" ×7 in dashboard text | TRUE | `grep -oi` over index.html+app.js+app.css: fitted 14 (index.html 8, app.js 6), assumed 7 (index.html 4, app.js 3). The label fix did not change the counts ("assumed" was already present; "median" was removed). |
| EV = implied × (0.07/farmers), odds once inside implied; S3 double-count absent | TRUE | `lib/model.ts` computeRow: `expected = implied × (0.07/farmers)`; odds enter only inside `implied`. No second odds multiplication anywhere. Spot: sentora-curator EV ≈ $43, cost $250+$8=$258, matches build-report live-DOM check. |
| No network in dashboard; dossier 631,617 B | TRUE (by grep + report) | Zero `http://`/`https://` in index.html/app.js/app.css (grep). Dossier size per task brief 631,617 B after the label fix (build report's 631,626 B minus 9 chars removed by the fix — consistent). |
| Detail "Implied value from the fitted size curve" (`app.js:203`) | MISLEADING | Implied = fitted base × assumed odds × growth × maturity. Attributing it to the fitted curve alone understates the assumed components. Minor. |
| Row set documented in dashboard (spec §3.6) | FALSE (missing) | No watchlist/158 mention in dashboard files; only in README, which is not in the dossier. |
| Weibull comparison shown as a table (spec §5.2 F4) | FALSE (form) | Rendered as a sentence (`index.html:23`), not a table. Numbers present. |

## AUTHORSHIP RISK — LOW, with one open item

- Builder wrote from a prose spec (standard pipeline, transcripts exist); the code is
  original implementation of specified formulas, not pasted from a rival or from the oracle
  (values are computed at runtime; the 198 slugs are data, documented as oracle-defined).
- Local `.git/` is a fresh kit init (`HEAD` → `refs/heads/master`, no remote, created
  03:43, before any file write) — consistent with the kit-init-first rule, not with copying
  another repo.
- Open item: the one-line "median"→"assumed" label fix was made **after** the builder's
  verification run / seal. It is a 9-character prose change with no model effect and the
  dossier was rebuilt byte-identically afterwards, so the technical risk is nil — but the
  fix lives in a different session from the builder's, so the bundle must include that
  session's transcript or the final dashboard bytes will differ from what the builder's
  transcript built. Confirm transcript coverage before submit; do not treat the builder's
  transcript alone as the complete record.
- `.lessons-reviewed` now exists in the entry (4,301 B, dated 04:11) — the build report's
  §5c gap for gate 4 is closed; gates 5–7 (this review, bundle, repo) remain the submit path.

## WHAT WOULD CHANGE MY VERDICT

- **To a stronger GO:** (1) reword `index.html:17` and `:28` to claim live recomputation
  only for the comps curve and held-out test ("the curve and its held-out test are
  recomputed live; the Weibull/logit parameters are fitted values reported from the
  analysis"); (2) make the SKIP note conditional — "the age is assumed" only when
  `ageU`, otherwise "the 7-day change is unreported" (`app.js:193`, `index.html:27`);
  (3) add one dashboard line stating the row set (40 watchlist + 158 measured-board
  protocols, oracle-defined). All three are prose-only, ~15 minutes, no model change —
  but each is a post-seal edit, so they need the same transcript-coverage treatment as
  the label fix, and they would require re-running determinism + dossier rebuild.
- **To NO-GO:** (1) if the Weibull/logit numbers (0.656/0.799/0.688/0.654, b0/b1) turn out
  not to come from a real fit on this snapshot — i.e. fabricated rather than merely
  pasted — the dashboard's central fitted-evidence block collapses and the entry should
  not be submitted with those numbers; (2) if the pre-submit gate's determinism check is
  run as-is (it calls `node main.ts --output`, but this `main.ts` reads `MAKEFUN_OUTPUT_DIR`
  — build report §3) and its result is taken at face value instead of the builder's
  env-var check; (3) if transcript coverage for the post-seal label fix cannot be
  established for the bundle. None of these is established by this review; (1) is the one
  I could not verify either way from the entry alone.
- **What would NOT change my verdict:** the verdict distribution (121/47/30) — it is the
  honest output of the zeta rule and the S3 diagnosis's prescription, even though it bets
  against S1's 159/29/10 configuration; and the top-10-all-SKIP shape, which S1 shared.
  Both are residual risks I accept in the GO, not defects to fix by tuning thresholds to
  mimic S1.
