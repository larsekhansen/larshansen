// Time and sky in Oslo, worked out locally with no service to call.

export interface OsloClock {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-24, with minutes as a fraction
  offset: number; // hours ahead of UTC, summer time included
}

export function osloClock(now: Date = new Date()): OsloClock {
  const parts: Record<string, string> = {};
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23"
  })
    .formatToParts(now)
    .forEach((p) => (parts[p.type] = p.value));
  const wall = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return {
    year: +parts.year,
    month: +parts.month,
    day: +parts.day,
    hour: +parts.hour + +parts.minute / 60,
    offset: Math.round((wall - now.getTime()) / 900_000) / 4
  };
}

/** Sunrise and sunset in Oslo as local hours, from NOAA's simple solar model. Good to a few minutes. */
export function sunTimes(c: OsloClock): { rise: number; set: number } {
  const lat = (59.91 * Math.PI) / 180;
  const lon = 10.75;
  const dayOfYear = Math.round((Date.UTC(c.year, c.month - 1, c.day) - Date.UTC(c.year, 0, 0)) / 86_400_000);
  const g = ((2 * Math.PI) / 365) * (dayOfYear - 1);
  const decl =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  const eqTime =
    229.18 *
    (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const cosH =
    (Math.cos((90.833 * Math.PI) / 180) - Math.sin(lat) * Math.sin(decl)) / (Math.cos(lat) * Math.cos(decl));
  const hourAngle = (Math.acos(Math.max(-1, Math.min(1, cosH))) * 180) / Math.PI;
  const noon = (720 - 4 * lon - eqTime) / 60 + c.offset;
  return { rise: noon - hourAngle / 15, set: noon + hourAngle / 15 };
}

export type Phase = "day" | "evening" | "night" | "twilight";

export interface Sky {
  phase: Phase;
  month: number;
  snow: boolean;
  aurora: boolean;
  flags: boolean;
}

const OVERRIDES: Record<string, Omit<Sky, "month"> & { month?: number }> = {
  day: { phase: "day", snow: false, aurora: false, flags: false },
  evening: { phase: "evening", snow: false, aurora: false, flags: false },
  night: { phase: "night", snow: false, aurora: true, flags: false },
  twilight: { phase: "twilight", month: 6, snow: false, aurora: false, flags: false },
  winter: { phase: "night", month: 1, snow: true, aurora: true, flags: false },
  "17mai": { phase: "day", month: 5, snow: false, aurora: false, flags: true }
};

/**
 * The sky for a moment in Oslo. Summer nights stay blue because the sun never gets far below the
 * horizon, the northern lights only show on dark winter-half nights, there is snow from December to
 * February, and flags on 17 May. `override` takes a name from `?sky=` so every look can be seen.
 */
export function skyFor(now: Date = new Date(), override?: string | null): Sky {
  const c = osloClock(now);
  const forced = override ? OVERRIDES[override] : undefined;
  if (forced) return { ...forced, month: forced.month ?? c.month };
  const { rise, set } = sunTimes(c);
  let phase: Phase = "day";
  if (c.hour < rise - 0.6 || c.hour > set + 0.6) phase = c.month >= 5 && c.month <= 7 ? "twilight" : "night";
  else if (Math.abs(c.hour - rise) <= 0.6 || Math.abs(c.hour - set) <= 0.6) phase = "evening";
  return {
    phase,
    month: c.month,
    snow: c.month === 12 || c.month <= 2,
    aurora: phase === "night" && (c.month >= 10 || c.month <= 3),
    flags: c.month === 5 && c.day === 17
  };
}
