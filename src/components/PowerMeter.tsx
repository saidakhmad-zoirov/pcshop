/** Saytning asosiy "imzo" elementi: tizim iste'moli va quvvat bloki sig'imi bitta shkalada. */
export default function PowerMeter({ watts, psu, recommended }: { watts: number; psu: number | null; recommended: number }) {
  const max = Math.max(psu ?? 0, recommended, watts, 100) * 1.1;
  const pct = (v: number) => `${Math.min(100, (v / max) * 100)}%`;
  const state = psu === null ? "none" : psu < watts ? "bad" : psu < recommended ? "warn" : "ok";
  const fill = { none: "bg-steel", bad: "bg-bad", warn: "bg-amber", ok: "bg-ok" }[state];

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-steel">Taxminiy iste'mol</p>
        <p className="h-display text-2xl">
          {watts} <span className="text-base text-steel">W</span>
        </p>
      </div>
      <div className="relative mt-3 h-3 rounded-full bg-bench" role="img"
        aria-label={`Iste'mol ${watts} W, tavsiya ${recommended} W${psu ? `, blok ${psu} W` : ""}`}>
        <div className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ${fill}`} style={{ width: pct(watts) }} />
        <div className="absolute -top-1 h-5 w-0.5 bg-ink/70" style={{ left: pct(recommended) }} title="Tavsiya" />
        {psu !== null && <div className="absolute -top-1.5 h-6 w-1 rounded bg-amber" style={{ left: pct(psu) }} title="Quvvat bloki" />}
      </div>
      <div className="mt-2 flex justify-between text-xs text-steel">
        <span>Tavsiya: {recommended} W dan</span>
        <span className={state === "bad" ? "text-bad" : state === "warn" ? "text-amber" : state === "ok" ? "text-ok" : ""}>
          {psu === null ? "Quvvat bloki tanlanmagan" : `Blok: ${psu} W`}
        </span>
      </div>
    </div>
  );
}
