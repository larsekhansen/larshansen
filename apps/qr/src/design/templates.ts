// Ready-made looks. A template only sets colors and shapes; the user's logo, margin and
// error correction stay as they are when a template is picked.

import type { Design, Look } from "./design";

export interface Template {
  id: string;
  name: string;
  look: Look;
}

export const TEMPLATES: Template[] = [
  {
    id: "classic",
    name: "Klassisk",
    look: {
      dotStyle: "square",
      cornerSquareStyle: "square",
      cornerDotStyle: "square",
      dotColor: "#151714",
      gradient: "none",
      gradientColor: "#151714",
      cornerColor: "#151714",
      backgroundColor: "#ffffff",
      transparentBackground: false
    }
  },
  {
    id: "rounded",
    name: "Avrundet",
    look: {
      dotStyle: "rounded",
      cornerSquareStyle: "extra-rounded",
      cornerDotStyle: "dot",
      dotColor: "#1d2340",
      gradient: "none",
      gradientColor: "#1d2340",
      cornerColor: "#1d2340",
      backgroundColor: "#ffffff",
      transparentBackground: false
    }
  },
  {
    id: "fjord",
    name: "Fjord",
    look: {
      dotStyle: "classy-rounded",
      cornerSquareStyle: "extra-rounded",
      cornerDotStyle: "dot",
      dotColor: "#0b3c5d",
      gradient: "linear",
      gradientColor: "#1b6a9c",
      cornerColor: "#0b3c5d",
      backgroundColor: "#ffffff",
      transparentBackground: false
    }
  },
  {
    id: "aurora",
    name: "Nordlys",
    look: {
      dotStyle: "extra-rounded",
      cornerSquareStyle: "extra-rounded",
      cornerDotStyle: "dot",
      dotColor: "#0d5c4f",
      gradient: "linear",
      gradientColor: "#51307f",
      cornerColor: "#0d5c4f",
      backgroundColor: "#f6fbf9",
      transparentBackground: false
    }
  },
  {
    id: "lingonberry",
    name: "Tyttebær",
    look: {
      dotStyle: "dots",
      cornerSquareStyle: "extra-rounded",
      cornerDotStyle: "dot",
      dotColor: "#9b1b30",
      gradient: "none",
      gradientColor: "#9b1b30",
      cornerColor: "#5e0b1c",
      backgroundColor: "#fff7f7",
      transparentBackground: false
    }
  },
  {
    id: "copper",
    name: "Kobber",
    look: {
      dotStyle: "classy",
      cornerSquareStyle: "square",
      cornerDotStyle: "square",
      dotColor: "#7a3b14",
      gradient: "radial",
      gradientColor: "#a4521f",
      cornerColor: "#5c2b0d",
      backgroundColor: "#fff8f0",
      transparentBackground: false
    }
  },
  {
    id: "slate",
    name: "Skifer",
    look: {
      dotStyle: "square",
      cornerSquareStyle: "extra-rounded",
      cornerDotStyle: "square",
      dotColor: "#2c3742",
      gradient: "none",
      gradientColor: "#2c3742",
      cornerColor: "#0f1419",
      backgroundColor: "#e8edf1",
      transparentBackground: false
    }
  },
  {
    id: "newsprint",
    name: "Avis",
    look: {
      dotStyle: "dots",
      cornerSquareStyle: "square",
      cornerDotStyle: "square",
      dotColor: "#1a1a1a",
      gradient: "none",
      gradientColor: "#1a1a1a",
      cornerColor: "#1a1a1a",
      backgroundColor: "#f2eee3",
      transparentBackground: false
    }
  },
  {
    id: "signal",
    name: "Signal",
    look: {
      dotStyle: "rounded",
      cornerSquareStyle: "square",
      cornerDotStyle: "square",
      dotColor: "#151714",
      gradient: "none",
      gradientColor: "#151714",
      cornerColor: "#151714",
      backgroundColor: "#ffd23f",
      transparentBackground: false
    }
  },
  {
    id: "heather",
    name: "Lyng",
    look: {
      dotStyle: "rounded",
      cornerSquareStyle: "dot",
      cornerDotStyle: "dot",
      dotColor: "#4a1f6e",
      gradient: "radial",
      gradientColor: "#8a2f7c",
      cornerColor: "#4a1f6e",
      backgroundColor: "#ffffff",
      transparentBackground: false
    }
  },
  {
    id: "forest",
    name: "Skog",
    look: {
      dotStyle: "classy-rounded",
      cornerSquareStyle: "square",
      cornerDotStyle: "dot",
      dotColor: "#1f4d2b",
      gradient: "none",
      gradientColor: "#1f4d2b",
      cornerColor: "#12321b",
      backgroundColor: "#f3f6ee",
      transparentBackground: false
    }
  },
  {
    // Light code on a dark background. Looks good, but some older scanners cannot read it,
    // which the scannability meter points out.
    id: "night",
    name: "Natt",
    look: {
      dotStyle: "extra-rounded",
      cornerSquareStyle: "extra-rounded",
      cornerDotStyle: "dot",
      dotColor: "#f2f4f0",
      gradient: "none",
      gradientColor: "#f2f4f0",
      cornerColor: "#ffd23f",
      backgroundColor: "#151714",
      transparentBackground: false
    }
  }
];

const LOOK_KEYS = Object.keys(TEMPLATES[0].look) as (keyof Look)[];

export function applyTemplate(design: Design, template: Template): Design {
  return { ...design, ...template.look };
}

export function usesTemplate(design: Design, template: Template): boolean {
  return LOOK_KEYS.every((key) => design[key] === template.look[key]);
}

function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** "Overrask meg": colors from one template, shapes from others, so the result stays scannable. */
export function surpriseLook(): Look {
  return {
    ...pickOne(TEMPLATES).look,
    dotStyle: pickOne(TEMPLATES).look.dotStyle,
    cornerSquareStyle: pickOne(TEMPLATES).look.cornerSquareStyle,
    cornerDotStyle: pickOne(TEMPLATES).look.cornerDotStyle
  };
}
